import React from 'react';
import { Link } from 'react-router-dom';
import { NGO } from '../types';

interface NgoCardProps {
  ngo: NGO;
}

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const NgoCard: React.FC<NgoCardProps> = ({ ngo }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <img className="h-40 w-full object-cover" src={ngo.bannerUrl} alt={`${ngo.name} banner`} />
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-4">
          <img className="h-16 w-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 -mt-12" src={ngo.logoUrl} alt={`${ngo.name} logo`} />
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ngo.name}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                <LocationIcon />
                {ngo.location}
            </div>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm flex-grow">{ngo.description}</p>
        <div className="mt-4">
            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{ngo.type}</span>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <Link 
          to={`/ngo/${ngo.id}`} 
          className="w-full text-center block bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default NgoCard;