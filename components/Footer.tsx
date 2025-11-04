import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NGOS as initialNgos } from '../constants';
import { useData } from '../data/DataContext';
import ConfirmationModal from './ConfirmationModal';

const Footer: React.FC = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { fetchNgos, fetchUsers, fetchEnrollments, fetchNotifications } = useData();

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      // Delete existing data. Order can be important with foreign key constraints.
      // These will delete all rows in the specified tables.
      await supabase.from('enrollments').delete().not('enrollmentId', 'is', null);
      await supabase.from('notifications').delete().not('id', 'is', null);
      await supabase.from('users').delete().not('id', 'is', null);
      await supabase.from('ngos').delete().not('id', 'is', null);
      
      // Reseed NGOs from constants file
      const { error: seedError } = await supabase.from('ngos').insert(initialNgos);
      if (seedError) throw seedError;
      
      // Refetch all data to update the application state
      await Promise.all([
        fetchNgos(),
        fetchUsers(),
        fetchEnrollments(),
        fetchNotifications()
      ]);

      alert('Database has been reset and re-seeded successfully.');

    } catch (err: any) {
      console.error('Database reset failed:', err);
      alert(`Error resetting database: ${err.message}`);
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  return (
    <>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SkillSpot 2.0. All rights reserved.
          </p>
          <button
            onClick={() => setIsResetModalOpen(true)}
            disabled={isResetting}
            className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
            title="Reset all database records to the initial demo state."
          >
            {isResetting ? 'Resetting...' : 'Reset Data'}
          </button>
        </div>
      </footer>
      {isResetModalOpen && (
        <ConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetDatabase}
          title="Reset Database"
          message="Are you sure you want to delete ALL data (NGOs, users, enrollments) and re-seed the initial demo NGOs? This action is irreversible."
        />
      )}
    </>
  );
};

export default Footer;