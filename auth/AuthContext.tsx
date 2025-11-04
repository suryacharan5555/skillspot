import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';


interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // User is signed in. Fetch their profile from the public 'users' table.
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116: row not found
            console.error('Error fetching user profile:', error);
            setUser(null);
          } else if (profile) {
            setUser(profile);
          } else {
            // Profile doesn't exist, create it. This is common for first-time OAuth sign-ins.
            const userEmail = session.user.email;
            if (!userEmail) {
                console.error("User from OAuth is missing an email. Cannot create profile.");
                // Log out the user to prevent an inconsistent state
                await supabase.auth.signOut();
                setUser(null);
            } else {
                const newUserProfile: Omit<User, 'password'> = {
                  id: session.user.id,
                  email: userEmail,
                  name: session.user.user_metadata.full_name || userEmail.split('@')[0] || "New User",
                  role: 'student', // Default role for new sign-ups
                };
                
                const { error: insertError } = await supabase
                  .from('users')
                  .insert(newUserProfile);
                  
                if (insertError) {
                  console.error('Error creating user profile:', insertError);
                  setUser(null);
                } else {
                  setUser(newUserProfile as User);
                }
            }
          }
        } else {
          // User is signed out
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This function is kept for compatibility with the existing email/password form,
  // but onAuthStateChange is now the primary source of truth.
  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    }
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
