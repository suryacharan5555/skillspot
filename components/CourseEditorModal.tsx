import React, { useState, useEffect } from 'react';
import { Course } from '../types';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course: Course | null;
}

const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ isOpen, onClose, onSave, course }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: '',
    trainer: '',
    seatsAvailable: '10',
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });
  const [error, setError] = useState('');
  
  const inputClasses = "w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400";


  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description,
        category: course.category,
        duration: course.duration,
        trainer: course.trainer,
        seatsAvailable: String(course.seatsAvailable),
        startDate: course.startDate.split('T')[0],
      });
    } else {
        // Reset for new course
        setFormData({
            name: '', description: '', category: '', duration: '', trainer: '',
            seatsAvailable: '10', startDate: new Date().toISOString().split('T')[0],
        });
    }
  }, [course, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.startDate) {
        setError('Name, Category, and Start Date are required.');
        return;
    }
    
    const courseData: Course = {
      id: course?.id || `course-${Date.now()}`,
      ...formData,
      seatsAvailable: parseInt(formData.seatsAvailable, 10) || 0,
      reviews: course?.reviews || [],
    };

    onSave(courseData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{course ? 'Edit Course' : 'Add New Course'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Course Name" value={formData.name} onChange={handleChange} required className={inputClasses} />
            <textarea name="description" placeholder="Course Description" value={formData.description} onChange={handleChange} required className={inputClasses} rows={3}></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="category" placeholder="Category (e.g., Technology)" value={formData.category} onChange={handleChange} required className={inputClasses} />
                <input type="text" name="duration" placeholder="Duration (e.g., 8 Weeks)" value={formData.duration} onChange={handleChange} required className={inputClasses} />
                <input type="text" name="trainer" placeholder="Trainer Name" value={formData.trainer} onChange={handleChange} required className={inputClasses} />
                <input type="number" name="seatsAvailable" placeholder="Seats Available" value={formData.seatsAvailable} onChange={handleChange} required min="0" className={inputClasses} />
            </div>
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className={inputClasses} />
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            
            <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    {course ? 'Save Changes' : 'Add Course'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditorModal;