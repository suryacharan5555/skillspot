import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onRegisterClick: () => void;
}

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5a2.5 2.5 0 00-3.05 2.223a5.5 5.5 0 006.1 0A2.5 2.5 0 007.5 11zM11 6a3 3 0 116 0 3 3 0 01-6 0zM12.5 11a2.5 2.5 0 00-3.05 2.223A5.5 5.5 0 0015.55 16A5.5 5.5 0 0018.5 13.223A2.5 2.5 0 0015.5 11h-3z" /></svg>;

const CourseCard: React.FC<CourseCardProps> = ({ course, onRegisterClick }) => {
  const isWaitlisted = course.seatsAvailable === 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-6 flex-grow">
        <span className="inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-semibold mb-2 px-2.5 py-0.5 rounded-full">{course.category}</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">{course.description}</p>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center"><CalendarIcon /><span>Duration: {course.duration}</span></div>
          <div className="flex items-center"><UserIcon /><span>Trainer: {course.trainer}</span></div>
          <div className="flex items-center"><UsersIcon />
            <span>
              {isWaitlisted ? 'Waitlist Open' : `${course.seatsAvailable} Seats Available`}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 mt-auto">
        <button
          onClick={onRegisterClick}
          className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-colors ${
            isWaitlisted
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isWaitlisted ? 'Join Waitlist' : 'Register Now'}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;