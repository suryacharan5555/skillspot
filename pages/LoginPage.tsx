import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4c0-137 110.3-247.4 244-247.4 68.8 0 125.2 26.1 172.4 72.3l-64.5 64.5C337 154.2 294.6 130.4 244 130.4c-84.3 0-152.3 67.8-152.3 151.4s68 151.4 152.3 151.4c97.9 0 130.5-72.2 134.4-110.2H244v-79.5h236.1c2.3 12.7 3.9 26.6 3.9 41.4z"></path>
    </svg>
);

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would use Supabase's built-in password reset functionality.
        // supabase.auth.resetPasswordForEmail(email)
        // For this demo, we'll just show a confirmation.
        setMessage('If an account with that email exists, a password reset link has been sent.');
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reset Password</h3>
                {message ? (
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <button onClick={onClose} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleResetRequest}>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Enter your email address and we will send you a link to reset your password.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 mb-4"
                            required
                        />
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Send Reset Link</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { fetchUsers } = useData();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const inputBaseClasses = "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const lightModeClasses = "bg-white text-gray-900";
  const darkModeClasses = "dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const combinedInputClasses = `${inputBaseClasses} ${lightModeClasses} ${darkModeClasses}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        const { data: user, error: queryError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // In a real app, you'd send the password to a server-side function to compare hashes.
            .single();

        if (queryError || !user) {
            setError('Invalid email or password.');
            return;
        }

        login(user);
        // Redirect is now handled by the useEffect hook
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
        setError('All fields are required for registration.');
        return;
    }
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    setIsLoading(true);
    try {
        // Check if user already exists
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
        if (existingUser) {
            setError('A user with this email already exists.');
            return;
        }

        const newUser: Omit<User, 'id'> = {
            name,
            email,
            phone,
            password, // IMPORTANT: Never store plain text passwords. Use Supabase Auth or hash on a server.
            role: 'student',
        };
        
        const { data: createdUser, error: insertError } = await supabase.from('users').insert(newUser).select().single();

        if (insertError) throw insertError;

        await fetchUsers();
        login(createdUser);
        // Redirect is now handled by the useEffect hook
    } catch (err: any) {
        setError(err.message || 'Failed to register.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });

    if (error) {
        setError(error.message);
        setIsLoading(false);
    }
    // On success, Supabase redirects to Google, then back to the app.
    // The onAuthStateChange listener in AuthContext will handle the session.
    // The useEffect in this component will handle the final redirect to the dashboard.
  };

  const handleSubmit = isRegister ? handleRegister : handleLogin;

  return (
    <>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              {isRegister ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Or{' '}
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                {isRegister ? 'sign in to an existing account' : 'start your journey today'}
              </button>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {isRegister && (
                <>
                  <div>
                    <input id="name" name="name" type="text" required className={combinedInputClasses} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <input id="phone" name="phone" type="tel" autoComplete="tel" className={combinedInputClasses} placeholder="Phone Number (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <input id="email-address" name="email" type="email" autoComplete="email" required className={combinedInputClasses} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <input id="password" name="password" type="password" autoComplete="current-password" required className={combinedInputClasses} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
               {isRegister && (
                <div>
                  <input id="confirm-password" name="confirm-password" type="password" required className={combinedInputClasses} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}
            </div>

             {!isRegister && (
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <button type="button" onClick={() => setIsForgotPasswordModalOpen(true)} className="font-medium text-blue-600 hover:text-blue-500">
                            Forgot your password?
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div>
              <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-sm text-gray-500 dark:text-gray-400">Or continue with</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <div>
              <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                <GoogleIcon />
                <span className="ml-3">Sign in with Google</span>
              </button>
          </div>
        </div>
      </div>
      {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />}
    </>
  );
};

export default LoginPage;
