import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../auth/AuthContext';
import { NGO, Course, Enrollment } from '../types';
import CourseCard from '../components/CourseCard';

const NgoDetailPage: React.FC = () => {
    const { ngoId } = useParams<{ ngoId: string }>();
    const { user, isAuthenticated } = useAuth();
    const [ngos] = useLocalStorage<NGO[]>('skillspot_ngos', []);
    const [enrollments, setEnrollments] = useLocalStorage<Enrollment[]>('skillspot_enrollments', []);
    
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    const ngo = ngos.find(n => n.id === ngoId);

    if (!ngo) {
        return <Navigate to="/" replace />;
    }

    const handleRegisterClick = (course: Course) => {
        if (!isAuthenticated) {
            setModalContent({ title: 'Authentication Required', message: 'You must be logged in to register for courses.' });
            setShowModal(true);
            return;
        }

        if (user?.role !== 'student') {
             setModalContent({ title: 'Registration Failed', message: 'Only students can register for courses.' });
             setShowModal(true);
             return;
        }

        const existingEnrollment = enrollments.find(e => e.studentId === user.id && e.courseId === course.id);
        if (existingEnrollment) {
            setModalContent({ title: 'Already Registered', message: 'You are already registered or on the waitlist for this course.' });
            setShowModal(true);
            return;
        }
        
        const newEnrollment: Enrollment = {
            enrollmentId: `enroll-${Date.now()}`,
            studentId: user.id,
            courseId: course.id,
            ngoId: ngo.id,
            status: 'Pending',
            enrolledAt: new Date().toISOString(),
        };

        setEnrollments(prev => [...prev, newEnrollment]);
        const isWaitlisted = course.seatsAvailable === 0;
        setModalContent({ 
            title: 'Registration Submitted!', 
            message: `Your application for "${course.name}" has been submitted. You will be ${isWaitlisted ? 'added to the waitlist' : 'notified upon approval'}. Check your dashboard for updates.`
        });
        setShowModal(true);
    };

    const InfoBlock: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
        <div>
            <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">{label}</h4>
            <p className="text-gray-800 dark:text-gray-200">{children}</p>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="relative">
                <img src={ngo.bannerUrl} alt={`${ngo.name} banner`} className="h-64 w-full object-cover rounded-lg" />
                <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                    <img src={ngo.logoUrl} alt={`${ngo.name} logo`} className="h-32 w-32 rounded-full object-cover ring-4 ring-white dark:ring-gray-900" />
                </div>
            </div>

            <div className="pt-20 px-8 pb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{ngo.name}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{ngo.description}</p>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mission</h3>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{ngo.missionStatement}</p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <InfoBlock label="Location">{ngo.location}</InfoBlock>
                    <InfoBlock label="Category">{ngo.category}</InfoBlock>
                    <InfoBlock label="Contact Person">{ngo.contact.person}</InfoBlock>
                    <InfoBlock label="Email"><a href={`mailto:${ngo.contact.email}`} className="text-blue-500 hover:underline">{ngo.contact.email}</a></InfoBlock>
                    <InfoBlock label="Website"><a href={`http://${ngo.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ngo.contact.website}</a></InfoBlock>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Courses</h2>
                {ngo.courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ngo.courses.map(course => (
                            <CourseCard key={course.id} course={course} onRegisterClick={() => handleRegisterClick(course)} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-10 text-gray-600 dark:text-gray-400">This NGO currently has no courses listed.</p>
                )}
            </div>

             {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{modalContent.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{modalContent.message}</p>
                        <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NgoDetailPage;