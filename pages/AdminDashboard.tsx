// Fix: Create AdminDashboard.tsx component.
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import { Enrollment, EnrollmentStatus, Notification, Course, NGO, User } from '../types';
import { supabase } from '../lib/supabaseClient';
import CourseEditorModal from '../components/CourseEditorModal';
import ConfirmationModal from '../components/ConfirmationModal';

const EnrollmentDetailsModal: React.FC<{
    enrollment: Enrollment;
    student: User;
    onClose: () => void;
}> = ({ enrollment, student, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-600">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl">&times;</button>
                </div>
                <div className="space-y-6">
                    {/* Student Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Applicant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><strong className="text-gray-500 dark:text-gray-400">Name:</strong> {student.name}</p>
                            <p><strong className="text-gray-500 dark:text-gray-400">Email:</strong> {student.email}</p>
                            <p><strong className="text-gray-500 dark:text-gray-400">Phone:</strong> {student.phone}</p>
                            <p><strong className="text-gray-500 dark:text-gray-400">Course:</strong> {enrollment.courseName}</p>
                        </div>
                    </div>
                    {/* Application Answers */}
                    <div className="space-y-4">
                         <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Previous Experience</h3>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md whitespace-pre-wrap">{enrollment.previousExperience || 'Not provided'}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Reason for Joining</h3>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md whitespace-pre-wrap">{enrollment.reasonForJoining || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Close</button>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { users, ngos, enrollments, setEnrollments, setNotifications, fetchNgos, loading, error } = useData();
  const navigate = useNavigate();
  
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus | 'All'>('Pending');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteNgoModalOpen, setIsDeleteNgoModalOpen] = useState(false);
  
  const [viewingEnrollment, setViewingEnrollment] = useState<Enrollment | null>(null);

  const adminNgo = useMemo(() => ngos.find(ngo => ngo.id === user?.ngoId), [ngos, user]);

  const ngoEnrollments = useMemo(() => {
    if (!adminNgo) return [];
    return enrollments.filter(e => e.ngoId === adminNgo.id);
  }, [enrollments, adminNgo]);

  const filteredEnrollments = useMemo(() => {
    if (enrollmentFilter === 'All') return ngoEnrollments;
    return ngoEnrollments.filter(e => e.status === enrollmentFilter);
  }, [ngoEnrollments, enrollmentFilter]);

  const studentForViewingEnrollment = useMemo(() => {
      if (!viewingEnrollment) return null;
      return users.find(u => u.id === viewingEnrollment.studentId);
  }, [viewingEnrollment, users]);

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
  
  const handleDeleteNgo = async () => {
    if (!adminNgo) return;

    try {
        await supabase.from('enrollments').delete().eq('ngoId', adminNgo.id);
        await supabase.from('users').delete().eq('ngoId', adminNgo.id);
        await supabase.from('ngos').delete().eq('id', adminNgo.id);
        alert(`${adminNgo.name} has been successfully deleted.`);
        await logout();
        navigate('/');

    } catch (err: any) {
        console.error("Failed to delete NGO:", err);
        alert(`Error deleting NGO: ${err.message}`);
    }
  };


  const getStats = useMemo(() => {
      const ngoCourses = adminNgo?.courses.length || 0;
      const pendingNgoEnrollments = enrollments.filter(e => e.ngoId === adminNgo?.id && e.status === 'Pending').length;
      return {
          totalCourses: ngoCourses,
          pendingEnrollments: pendingNgoEnrollments,
          totalStudents: users.filter(u => u.role === 'student').length,
          totalNgos: ngos.length,
      }
  }, [users, ngos, enrollments, adminNgo]);

  if (loading) return <p>Loading dashboard data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard for {adminNgo?.name}</h1>

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
                         <button onClick={() => setViewingEnrollment(enrollment)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400">Details</button>
                        {enrollment.status === 'Pending' && (
                            <>
                            <button onClick={() => handleUpdateStatus(enrollment, 'Approved')} disabled={isUpdating === enrollment.enrollmentId} className="text-green-600 hover:text-green-900 dark:text-green-400 disabled:opacity-50">Approve</button>
                            <button onClick={() => handleUpdateStatus(enrollment, 'Rejected')} disabled={isUpdating === enrollment.enrollmentId} className="text-red-600 hover:text-red-900 dark:text-red-400 disabled:opacity-50">Reject</button>
                            </>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {filteredEnrollments.length === 0 && <p className="text-center py-8 text-gray-500 dark:text-gray-400">No {enrollmentFilter !== 'All' ? enrollmentFilter.toLowerCase() : ''} enrollments found.</p>}
        </div>
      </div>
      
      {/* Danger Zone Section */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">Danger Zone</h2>
          <div className="flex justify-between items-center">
              <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Delete this NGO</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Once you delete your NGO, all of its resources and data will be permanently removed. This action cannot be undone.
                  </p>
              </div>
              <button 
                  onClick={() => setIsDeleteNgoModalOpen(true)} 
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                  Delete NGO
              </button>
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
      {isDeleteNgoModalOpen && adminNgo && (
        <ConfirmationModal
            isOpen={isDeleteNgoModalOpen}
            onClose={() => setIsDeleteNgoModalOpen(false)}
            onConfirm={handleDeleteNgo}
            title="Confirm NGO Deletion"
            message={`Are you sure you want to permanently delete "${adminNgo.name}"? This will remove all associated courses, enrollments, and admin profiles. This action cannot be undone.`}
        />
      )}
      {viewingEnrollment && studentForViewingEnrollment && (
        <EnrollmentDetailsModal
            enrollment={viewingEnrollment}
            student={studentForViewingEnrollment}
            onClose={() => setViewingEnrollment(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;