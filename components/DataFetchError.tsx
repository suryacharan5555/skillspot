import React from 'react';

const ExclamationIcon = () => (
    <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const DataFetchError: React.FC<{ error: string }> = ({ error }) => {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-6 rounded-lg shadow-md my-8" role="alert">
            <div className="flex">
                <div className="py-1">
                    <ExclamationIcon />
                </div>
                <div className="ml-4">
                    <p className="font-bold text-lg">Database Configuration Error</p>
                    <p className="mt-2 text-sm">
                        The application failed to connect to the database. This usually means the database tables are not set up correctly.
                    </p>
                    <div className="mt-4 p-3 bg-red-100 dark:bg-gray-800 rounded-md">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Specific Error:</p>
                        <code className="text-xs text-red-900 dark:text-red-200 break-all">{error}</code>
                    </div>
                    <p className="mt-4 text-sm">
                        Please go to your Supabase SQL Editor and run the complete, correct SQL script to create all the necessary tables.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataFetchError;