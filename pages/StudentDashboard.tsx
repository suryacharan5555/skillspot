import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { Enrollment, NGO, Course, EnrollmentStatus, Review } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const StarIcon: React.FC<{ filled: boolean, onClick?: () => void, onMouseEnter?: () => void, onMouseLeave?: () => void, sizeClass?: string }> = 
({ filled, onClick, onMouseEnter, onMouseLeave, sizeClass = 'h-6 w-6' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} transition-colors`}
        viewBox="0 0 20 20" 
        fill="currentColor"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ReviewModal: React.FC<{
    course: Course;
    user: { id: string, name: string };
    onClose: () => void;
    onSaveReview: (courseId: string, review: Review) => Promise<void>;
}> = ({ course, user, onClose, onSaveReview }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || isSubmitting) return;
        setIsSubmitting(true);
        const newReview: Review = {
            id: `review-${Date.now()}`,
            studentId: user.id,
            studentName: user.name,
            rating,
            comment,
            createdAt: new Date().toISOString()
        };
        await onSaveReview(course.id, newReview);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Leave a Review for</h2>
                <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-6">{course.name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                        <div className="flex items-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <StarIcon 
                                    key={star}
                                    filled={(hoverRating || rating) >= star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Comment</label>
                        <textarea 
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your experience with this course..."
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-semibold">Cancel</button>
                        <button type="submit" disabled={rating === 0 || isSubmitting} className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


const getStatusPill = (status: EnrollmentStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
    switch (status) {
        case 'Approved': return `${baseClasses} bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case 'Pending': return `${baseClasses} bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
        case 'Rejected': return `${baseClasses} bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200`;
        default: return `${baseClasses} bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100`;
    }
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { enrollments, ngos, fetchNgos, loading, error } = useData();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingCourse, setReviewingCourse] = useState<{ course: Course, ngo: NGO } | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                navigate(location.pathname, { replace: true, state: {} }); 
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, navigate, location.pathname]);

    if (loading) {
        return <p>Loading student data...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }
    
    if (!user) {
        return <p>Redirecting to login...</p>;
    }


    const studentEnrollments = enrollments.filter(e => e.studentId === user.id);

    const getCourseAndNgoDetails = (enrollment: Enrollment): { course?: Course, ngo?: NGO } => {
        const ngo = ngos.find(n => n.id === enrollment.ngoId);
        const course = ngo?.courses.find(c => c.id === enrollment.courseId);
        return { course, ngo };
    }

    const handleOpenReviewModal = (course: Course, ngo: NGO) => {
        setReviewingCourse({ course, ngo });
        setIsReviewModalOpen(true);
    };

    const handleSaveReview = async (courseId: string, review: Review) => {
        if (!reviewingCourse) return;
    
        const ngoToUpdate = ngos.find(n => n.id === reviewingCourse.ngo.id);
        if (!ngoToUpdate) {
            console.error("Could not find the NGO to update.");
            return;
        }

        const updatedCourses = ngoToUpdate.courses.map(course => {
            if (course.id === courseId) {
                const hasReviewed = course.reviews.some(r => r.studentId === user.id);
                if (!hasReviewed) {
                    return { ...course, reviews: [...course.reviews, review] };
                }
            }
            return course;
        });

        const { error } = await supabase
            .from('ngos')
            .update({ courses: updatedCourses })
            .eq('id', ngoToUpdate.id);
        
        if (error) {
            console.error("Failed to save review:", error);
            alert(`Error submitting review: ${error.message}`);
        } else {
            await fetchNgos();
        }

        setIsReviewModalOpen(false);
        setReviewingCourse(null);
    };

    return (
        <div className="space-y-8">
            {successMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-r-lg shadow" role="alert">
                    <p className="font-bold">Success</p>
                    <p>{successMessage}</p>
                </div>
            )}
            
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome, {user.name}!</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Enrollments</h2>
                {studentEnrollments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NGO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {studentEnrollments.map(enrollment => {
                                    const { course, ngo } = getCourseAndNgoDetails(enrollment);
                                    if (!course || !ngo) return null;

                                    const hasReviewed = course.reviews.some(r => r.studentId === user.id);

                                    return (
                                        <tr key={enrollment.enrollmentId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {course.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <Link to={`/ngo/${ngo.id}`} className="hover:underline">{ngo.name}</Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={getStatusPill(enrollment.status)}>{enrollment.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {enrollment.status === 'Approved' && !hasReviewed && (
                                                    <button onClick={() => handleOpenReviewModal(course, ngo)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                        Leave a Review
                                                    </button>
                                                )}
                                                {enrollment.status === 'Approved' && hasReviewed && (
                                                     <span className="text-sm text-gray-500 dark:text-gray-400">Review Submitted</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600 dark:text-gray-400">You haven't enrolled in any courses yet.</p>
                        <Link to="/" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                            Explore NGOs
                        </Link>
                    </div>
                )}
            </div>
            {isReviewModalOpen && reviewingCourse && (
                <ReviewModal 
                    course={reviewingCourse.course}
                    user={user}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSaveReview={handleSaveReview}
                />
            )}
        </div>
    );
};

export default StudentDashboard;