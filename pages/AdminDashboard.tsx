import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NGO, Course, Enrollment, User, EnrollmentStatus } from '../types';
import { COURSE_CATEGORIES } from '../constants';
import ConfirmationModal from '../components/ConfirmationModal';

const FormField: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
  <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
  </div>
);

const CourseModal: React.FC<{
  course: Course | null;
  onClose: () => void;
  onSave: (course: Course) => void;
}> = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState<Course>(
    course || {
      id: `course-${Date.now()}`,
      name: '',
      description: '',
      duration: '',
      trainer: '',
      seatsAvailable: 10,
      category: COURSE_CATEGORIES[0],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'seatsAvailable' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{course ? 'Edit Course' : 'Add New Course'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Course Name">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Web Development Bootcamp" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
          </FormField>
          <FormField label="Description">
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="A brief summary of the course" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
          </FormField>
          <FormField label="Duration">
            <input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 8 Weeks" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
          </FormField>
          <FormField label="Trainer Name">
            <input name="trainer" value={formData.trainer} onChange={handleChange} placeholder="e.g., Jane Doe" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
          </FormField>
          <FormField label="Number of Students / Seats">
            <input name="seatsAvailable" type="number" value={formData.seatsAvailable} onChange={handleChange} placeholder="e.g., 15" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
          </FormField>
          <FormField label="Category">
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600">
              {COURSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">Save Course</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [ngos, setNgos] = useLocalStorage<NGO[]>('skillspot_ngos', []);
  const [enrollments, setEnrollments] = useLocalStorage<Enrollment[]>('skillspot_enrollments', []);
  const [users] = useLocalStorage<User[]>('skillspot_users', []);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const adminNgo = useMemo(() => ngos.find(ngo => ngo.id === user?.ngoId), [ngos, user]);
  const ngoEnrollments = useMemo(() => enrollments.filter(e => e.ngoId === adminNgo?.id), [enrollments, adminNgo]);
  const enrolledStudents = useMemo(() => {
    const studentIds = new Set(ngoEnrollments.map(e => e.studentId));
    return users.filter(u => u.role === 'student' && studentIds.has(u.id));
  }, [ngoEnrollments, users]);

  const handleSaveCourse = (course: Course) => {
    setNgos(prevNgos => {
      return prevNgos.map(ngo => {
        if (ngo.id === adminNgo?.id) {
          const courseExists = ngo.courses.some(c => c.id === course.id);
          const updatedCourses = courseExists
            ? ngo.courses.map(c => c.id === course.id ? course : c)
            : [...ngo.courses, course];
          return { ...ngo, courses: updatedCourses };
        }
        return ngo;
      });
    });
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const openDeleteConfirmation = (courseId: string) => {
    setCourseToDelete(courseId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    setNgos(prevNgos => prevNgos.map(ngo => {
        if (ngo.id === adminNgo?.id) {
            return { ...ngo, courses: ngo.courses.filter(c => c.id !== courseToDelete) };
        }
        return ngo;
    }));
    setCourseToDelete(null);
  };

  const handleStatusChange = (enrollmentId: string, newStatus: EnrollmentStatus) => {
    setEnrollments(prev => prev.map(en => en.enrollmentId === enrollmentId ? {...en, status: newStatus} : en));
  }

  if (!adminNgo) return <p>Loading admin data...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard: {adminNgo.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Courses</h3><p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{adminNgo.courses.length}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Total Enrollments</h3><p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{ngoEnrollments.length}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Unique Students</h3><p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{enrolledStudents.length}</p></div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Courses</h2><button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Add New Course</button></div>
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trainer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Seats</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{adminNgo.courses.map(course => (<tr key={course.id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{course.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.trainer}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.seatsAvailable}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"><button onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button><button onClick={() => openDeleteConfirmation(course.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button></td></tr>))}</tbody></table></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Applications</h2>
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{ngoEnrollments.map(enrollment => { const student = users.find(u => u.id === enrollment.studentId); const course = adminNgo.courses.find(c => c.id === enrollment.courseId); if (!student || !course) return null; return (<tr key={enrollment.enrollmentId}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>{enrollment.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm"><select value={enrollment.status} onChange={(e) => handleStatusChange(enrollment.enrollmentId, e.target.value as EnrollmentStatus)} className="w-full p-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"><option>Pending</option><option>Approved</option><option>Rejected</option></select></td></tr>);})}</tbody></table></div>
      </div>

      {isCourseModalOpen && <CourseModal course={editingCourse} onClose={() => setIsCourseModalOpen(false)} onSave={handleSaveCourse} />}
      <ConfirmationModal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} onConfirm={confirmDeleteCourse} title="Delete Course" message="Are you sure you want to permanently delete this course? This action cannot be undone." />
    </div>
  );
};

export default AdminDashboard;