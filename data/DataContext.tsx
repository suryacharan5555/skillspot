import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NGO, User, Enrollment, Notification } from '../types';
import { NGOS as initialNgos } from '../constants';

interface DataContextType {
  ngos: NGO[];
  users: User[];
  enrollments: Enrollment[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNgos: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  setNgos: React.Dispatch<React.SetStateAction<NGO[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
        const [ngosRes, usersRes, enrollmentsRes, notificationsRes] = await Promise.all([
            supabase.from('ngos').select('*'),
            supabase.from('users').select('*'),
            supabase.from('enrollments').select('*'),
            supabase.from('notifications').select('*'),
        ]);

        if (ngosRes.error) throw ngosRes.error;
        if (usersRes.error) throw usersRes.error;
        if (enrollmentsRes.error) throw enrollmentsRes.error;
        if (notificationsRes.error) throw notificationsRes.error;

        if (ngosRes.data.length === 0) {
            console.log("No NGOs found, seeding database...");
            const { error: seedError } = await supabase.from('ngos').insert(initialNgos);
            if (seedError) throw seedError;
            const { data: seededNgos } = await supabase.from('ngos').select('*');
            setNgos(seededNgos || []);
        } else {
            setNgos(ngosRes.data);
        }

        setUsers(usersRes.data);
        setEnrollments(enrollmentsRes.data);
        setNotifications(notificationsRes.data);

    } catch (err: any) {
        const errorMessage = `Error fetching data from Supabase. This is likely due to an issue with your database schema or Row Level Security policies.\nDetailed Error:\n${err.message || err}`;
        console.error(errorMessage);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const value = {
      ngos, setNgos,
      users, setUsers,
      enrollments, setEnrollments,
      notifications, setNotifications,
      loading,
      error,
      fetchNgos: async () => { const {data} = await supabase.from('ngos').select('*'); setNgos(data || []); },
      fetchUsers: async () => { const {data} = await supabase.from('users').select('*'); setUsers(data || []); },
      fetchEnrollments: async () => { const {data} = await supabase.from('enrollments').select('*'); setEnrollments(data || []); },
      fetchNotifications: async () => { const {data} = await supabase.from('notifications').select('*'); setNotifications(data || []); }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};