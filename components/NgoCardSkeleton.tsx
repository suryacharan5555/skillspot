import React from 'react';

const NgoCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="h-40 w-full bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 -mt-12 ring-4 ring-white dark:ring-gray-800"></div>
          <div className="ml-4 flex-grow">
            <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
          </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="mt-4">
            <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <div className="h-10 w-full bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  );
};

export default NgoCardSkeleton;