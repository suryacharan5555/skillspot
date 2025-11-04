
// Fix: Create NgoDetailPage.tsx component.
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import CourseCard from '../components/CourseCard';
import { Course, Enrollment, Notification } from '../types';
import { supabase } from '../lib/supabaseClient';

const EnrollmentModal: React.FC<{
    course: Course;
    onClose: () => void;
    onSubmit: (answers: { previousExperience: string; reasonForJoining: string }) => void;
    isSubmitting: boolean;
}> = ({ course, onClose, onSubmit, isSubmitting }) => {
    const [previousExperience, setPreviousExperience] = useState('');
    const [reasonForJoining, setReasonForJoining] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ previousExperience, reasonForJoining });
    };

    const inputClasses = "w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enroll in: {course.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Please answer a few questions to complete your application.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="previousExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Experience</label>
                        <textarea
                            id="previousExperience"
                            value={previousExperience}
                            onChange={e => setPreviousExperience(e.target.value)}
                            className={inputClasses}
                            rows={4}
                            placeholder="Tell us about any relevant experience you have (if any)."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="reasonForJoining" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why do you want to join this course?</label>
                        <textarea
                            id="reasonForJoining"
                            value={reasonForJoining}
                            onChange={e => setReasonForJoining(e.target.value)}
                            className={inputClasses}
                            rows={4}
                            placeholder="What are your goals and what do you hope to achieve?"
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NgoDetailPage: React.FC = () => {
    const { ngoId } = useParams<{ ngoId: string }>();
    const { ngos, enrollments, setEnrollments, setNotifications, loading, error } = useData();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const ngo = useMemo(() => ngos.find(n => n.id === ngoId), [ngos, ngoId]);

    const handleOpenEnrollmentModal = (course: Course) => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        if (enrollments.some(e => e.studentId === user.id && e.courseId === course.id)) {
            return;
        }
        
        setSelectedCourse(course);
    };

    const handleRegister = async (answers: { previousExperience: string; reasonForJoining: string }) => {
        if (!user || !selectedCourse || !ngo) return;

        setIsRegistering(selectedCourse.id);
        try {
            const newEnrollment: Omit<Enrollment, 'enrollmentId'> = {
                studentId: user.id,
                studentName: user.name,
                courseId: selectedCourse.id,
                courseName: selectedCourse.name,
                ngoId: ngo.id,
                status: 'Pending',
                requestDate: new Date().toISOString(),
                previousExperience: answers.previousExperience,
                reasonForJoining: answers.reasonForJoining,
            };
            
            const { data: createdEnrollment, error: enrollError } = await supabase
                .from('enrollments')
                .insert(newEnrollment)
                .select()
                .single();

            if (enrollError) throw enrollError;
            
            setEnrollments(prev => [...prev, createdEnrollment]);

            const { data: adminUsers, error: adminError } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'admin')
                .eq('ngoId', ngo.id);
            
            if (adminError) throw adminError;

            for (const admin of adminUsers || []) {
                const newNotification: Omit<Notification, 'id'> = {
                    userId: admin.id,
                    message: `${user.name} requested to enroll in ${selectedCourse.name}.`,
                    link: `/admin-dashboard`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };

                const { data: createdNotification, error: notifyError } = await supabase
                    .from('notifications')
                    .insert(newNotification)
                    .select()
                    .single();
                
                if (notifyError) console.error("Failed to create notification:", notifyError);
                else setNotifications(prev => [...prev, createdNotification]);
            }
            
            setSuccessMessage(`Registration Successful! Your request to enroll in "${selectedCourse.name}" has been submitted.`);

        } catch (err: any) {
            console.error("Course registration failed:", err);
            
            let errorMessage = 'An unexpected error occurred.';
            if (err && typeof err === 'object' && err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            alert(`Course registration failed:\n${errorMessage}`);
        } finally {
            setIsRegistering(null);
            setSelectedCourse(null);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading NGO details...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Error loading data.</div>;
    }

    if (!ngo) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">NGO Not Found</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">The requested NGO could not be found.</p>
                <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                    Back to Directory
                </Link>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            {successMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-r-lg shadow mb-6" role="alert">
                    <p className="font-bold">Success!</p>
                    <p>{successMessage}</p>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{ngo.name}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{ngo.location} • <span className="font-semibold">{ngo.type}</span></p>
                <p className="mt-4 text-gray-700 dark:text-gray-400">{ngo.description}</p>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Courses</h2>
                {ngo.courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ngo.courses.map(course => {
                            const averageRating = course.reviews.length > 0
                                ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
                                : undefined;

                            const userEnrollment = enrollments.find(e => e.studentId === user?.id && e.courseId === course.id);

                            return (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onRegisterClick={() => handleOpenEnrollmentModal(course)}
                                    averageRating={averageRating}
                                    enrollmentStatus={userEnrollment?.status}
                                    isRegistrationDisabled={user?.role === 'admin' || isRegistering === course.id}
                                />
                            );
                        })}
                    </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">This NGO has not added any courses yet.</p>
                )}
            </div>

            {selectedCourse && (
                <EnrollmentModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onSubmit={handleRegister}
                    isSubmitting={isRegistering === selectedCourse.id}
                />
            )}
        </div>
    );
};

export default NgoDetailPage;