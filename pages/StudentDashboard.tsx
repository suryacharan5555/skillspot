import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Enrollment, NGO, Course, EnrollmentStatus } from '../types';
import { Link } from 'react-router-dom';

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
    const [enrollments] = useLocalStorage<Enrollment[]>('skillspot_enrollments', []);
    const [ngos] = useLocalStorage<NGO[]>('skillspot_ngos', []);

    if (!user) {
        return <p>Loading student data...</p>;
    }

    const studentEnrollments = enrollments.filter(e => e.studentId === user.id);

    const getCourseAndNgoDetails = (enrollment: Enrollment): { course?: Course, ngo?: NGO } => {
        const ngo = ngos.find(n => n.id === enrollment.ngoId);
        const course = ngo?.courses.find(c => c.id === enrollment.courseId);
        return { course, ngo };
    }

    return (
        <div className="space-y-8">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Enrolled On</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {studentEnrollments.map(enrollment => {
                                    const { course, ngo } = getCourseAndNgoDetails(enrollment);
                                    if (!course || !ngo) return null;

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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
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
        </div>
    );
};

export default StudentDashboard;