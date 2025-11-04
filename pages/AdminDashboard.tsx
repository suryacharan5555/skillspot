// Fix: Create AdminDashboard.tsx component.
import React, { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import { Enrollment, EnrollmentStatus, Notification, Course, NGO } from '../types';
import { supabase } from '../lib/supabaseClient';
import CourseEditorModal from '../components/CourseEditorModal';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { users, ngos, enrollments, setEnrollments, setNotifications, fetchNgos, loading, error } = useData();
  
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus | 'All'>('Pending');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // State for course management
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const adminNgo = useMemo(() => ngos.find(ngo => ngo.id === user?.ngoId), [ngos, user]);

  const filteredEnrollments = useMemo(() => {
    if (enrollmentFilter === 'All') return enrollments;
    return enrollments.filter(e => e.status === enrollmentFilter);
  }, [enrollments, enrollmentFilter]);

  const handleUpdateStatus = async (enrollment: Enrollment, newStatus: EnrollmentStatus) => {
    setIsUpdating(enrollment.enrollmentId);
    try {
        const { data: updatedEnrollment, error: updateError } = await supabase
            .from('enrollments')
            .update({ status: newStatus })
            .eq('enrollmentId', enrollment.enrollmentId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        setEnrollments(prev => prev.map(e => e.enrollmentId === enrollment.enrollmentId ? updatedEnrollment : e));

        const newNotification: Omit<Notification, 'id'> = {
            userId: enrollment.studentId,
            message: `Your enrollment for "${enrollment.courseName}" has been ${newStatus}.`,
            link: `/student-dashboard`,
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

    } catch(err: any) {
        console.error("Failed to update status:", err);
        alert(`Error: ${err.message}`);
    } finally {
        setIsUpdating(null);
    }
  }

  const handleSaveCourse = async (courseData: Course) => {
    if (!adminNgo) return;

    const isEditing = !!editingCourse;
    let updatedCourses: Course[];

    if (isEditing) {
        updatedCourses = adminNgo.courses.map(c => c.id === courseData.id ? courseData : c);
    } else {
        updatedCourses = [...adminNgo.courses, courseData];
    }
    
    try {
        const { error } = await supabase
            .from('ngos')
            .update({ courses: updatedCourses })
            .eq('id', adminNgo.id);

        if (error) throw error;
        
        await fetchNgos();
        setIsCourseModalOpen(false);
        setEditingCourse(null);

    } catch (err: any) {
        console.error("Failed to save course:", err);
        alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteCourse = async () => {
    if (!adminNgo || !courseToDelete) return;
    
    const updatedCourses = adminNgo.courses.filter(c => c.id !== courseToDelete.id);

    try {
        const { error } = await supabase
            .from('ngos')
            .update({ courses: updatedCourses })
            .eq('id', adminNgo.id);

        if (error) throw error;
        
        await fetchNgos();
        setCourseToDelete(null);

    } catch (err: any) {
        console.error("Failed to delete course:", err);
        alert(`Error: ${err.message}`);
    }
  };


  const getStats = useMemo(() => {
      return {
          totalUsers: users.filter(u => u.role === 'student').length,
          totalNgos: ngos.length,
          totalCourses: ngos.reduce((acc, ngo) => acc + ngo.courses.length, 0),
          pendingEnrollments: enrollments.filter(e => e.status === 'Pending').length,
      }
  }, [users, ngos, enrollments]);

  if (loading) return <p>Loading dashboard data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(getStats).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        ))}
      </div>

      {/* Course Management Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Your Courses</h2>
          <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Add Course</button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Seats</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {adminNgo?.courses.map(course => (
                        <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{course.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(course.startDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.seatsAvailable}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                <button onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Edit</button>
                                <button onClick={() => { setCourseToDelete(course); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-900 dark:text-red-400">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {(!adminNgo || adminNgo.courses.length === 0) && <p className="text-center py-8 text-gray-500 dark:text-gray-400">You have not added any courses yet.</p>}
        </div>
      </div>

      {/* Enrollment Requests Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enrollment Requests</h2>
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4">
                {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(status => (
                    <button key={status} onClick={() => setEnrollmentFilter(status)} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${enrollmentFilter === status ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {status}
                    </button>
                ))}
            </nav>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEnrollments.map(enrollment => (
                    <tr key={enrollment.enrollmentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{enrollment.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{enrollment.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(enrollment.requestDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {enrollment.status === 'Pending' ? (
                            <>
                            <button onClick={() => handleUpdateStatus(enrollment, 'Approved')} disabled={isUpdating === enrollment.enrollmentId} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50">Approve</button>
                            <button onClick={() => handleUpdateStatus(enrollment, 'Rejected')} disabled={isUpdating === enrollment.enrollmentId} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50">Reject</button>
                            </>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Action Taken</span>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {filteredEnrollments.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No {enrollmentFilter !== 'All' ? enrollmentFilter.toLowerCase() : ''} enrollments found.</p>}
        </div>
      </div>
      {isCourseModalOpen && (
        <CourseEditorModal
            isOpen={isCourseModalOpen}
            onClose={() => { setIsCourseModalOpen(false); setEditingCourse(null); }}
            onSave={handleSaveCourse}
            course={editingCourse}
        />
      )}
      {isDeleteModalOpen && courseToDelete && (
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteCourse}
            title="Delete Course"
            message={`Are you sure you want to delete the course "${courseToDelete.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default AdminDashboard;