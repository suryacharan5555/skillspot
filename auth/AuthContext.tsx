import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';


interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserFromSession = async (session: Session | null) => {
    if (session?.user) {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user profile:', error);
            setUser(null);
        } else if (profile) {
            setUser(profile);
        } else {
            const provider = session.user.app_metadata.provider;
            if (provider && provider !== 'email') {
                const userEmail = session.user.email;
                if (!userEmail) {
                    console.error("OAuth user is missing an email. Cannot create profile.");
                    await supabase.auth.signOut();
                    setUser(null);
                } else {
                    const newUserProfile: Omit<User, 'password'> = {
                      id: session.user.id,
                      email: userEmail,
                      name: session.user.user_metadata.full_name || userEmail.split('@')[0] || "New User",
                      role: 'student',
                    };
                    const { error: insertError } = await supabase.from('users').insert(newUserProfile);
                    if (insertError) {
                      console.error('Error creating user profile for OAuth user:', insertError);
                      sessionStorage.setItem('authError', 'rls_user_insert_policy_missing');
                      await supabase.auth.signOut();
                      setUser(null);
                    } else {
                      setUser(newUserProfile as User);
                    }
                }
            } else {
                console.warn(`User with email ${session.user.email} signed in but has no profile. Logging out.`);
                await supabase.auth.signOut();
                setUser(null);
            }
        }
    } else {
        setUser(null);
    }
  };

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await updateUserFromSession(session);
      } catch (error) {
        console.error('Error fetching initial user session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          await updateUserFromSession(session);
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    } catch (error) {
        console.error('Error logging out:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
