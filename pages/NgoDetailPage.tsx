// Fix: Create NgoDetailPage.tsx component.
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import CourseCard from '../components/CourseCard';
import { Course, Enrollment, Notification } from '../types';
import { supabase } from '../lib/supabaseClient';

const NgoDetailPage: React.FC = () => {
    const { ngoId } = useParams<{ ngoId: string }>();
    const { ngos, enrollments, setEnrollments, setNotifications, loading, error } = useData();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState<string | null>(null);

    const ngo = useMemo(() => ngos.find(n => n.id === ngoId), [ngos, ngoId]);

    const handleRegister = async (course: Course) => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        if (enrollments.some(e => e.studentId === user.id && e.courseId === course.id)) {
            alert("You are already enrolled or have a pending request for this course.");
            return;
        }

        setIsRegistering(course.id);
        try {
            const newEnrollment: Omit<Enrollment, 'enrollmentId'> = {
                studentId: user.id,
                studentName: user.name,
                courseId: course.id,
                courseName: course.name,
                ngoId: ngo!.id,
                status: 'Pending',
                requestDate: new Date().toISOString(),
            };
            
            const { data: createdEnrollment, error: enrollError } = await supabase
                .from('enrollments')
                .insert(newEnrollment)
                .select()
                .single();

            if (enrollError) throw enrollError;
            
            setEnrollments(prev => [...prev, createdEnrollment]);

            // This is a simplified notification system. In a real app, you'd target specific admin users.
            const adminUsers = (await supabase.from('users').select('id').eq('role', 'admin')).data || [];

            for (const admin of adminUsers) {
                const newNotification: Omit<Notification, 'id'> = {
                    userId: admin.id,
                    message: `${user.name} requested to enroll in ${course.name}.`,
                    link: `/admin-dashboard`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };

                const { data: createdNotification, error: notifyError } = await supabase
                    .from('notifications')
                    .insert(newNotification)
                    .select()
                    .single();
                
                if (notifyError) throw notifyError;
                
                setNotifications(prev => [...prev, createdNotification]);
            }


            alert(`Your request to enroll in "${course.name}" has been submitted! You will be notified upon approval.`);

        } catch (err: any) {
            console.error("Registration failed:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsRegistering(null);
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
        <div className="space-y-12">
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

                            return (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onRegisterClick={() => handleRegister(course)}
                                    averageRating={averageRating}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">This NGO has not listed any courses yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NgoDetailPage;
