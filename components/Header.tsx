import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../data/DataContext';

const CompassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;


const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, setNotifications } = useData();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications
        .filter(n => n.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, user]);

  const unreadCount = useMemo(() => userNotifications.filter(n => !n.isRead).length, [userNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = (notificationId: string, link: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
    setIsNotificationsOpen(false);
    navigate(link);
  }
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === user?.id ? {...n, isRead: true} : n));
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <CompassIcon />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">SkillSpot 2.0</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors hidden sm:block">NGO Directory</Link>
            
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {isAuthenticated ? (
              <>
                 <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                        <BellIcon />
                        {unreadCount > 0 && <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden z-[60]">
                            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Notifications</h4>
                                {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="text-xs text-blue-500 hover:underline">Mark all as read</button>}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {userNotifications.length > 0 ? userNotifications.map(n => (
                                    <div key={n.id} onClick={() => handleNotificationClick(n.id, n.link)} className={`p-3 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                )) : <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">No notifications yet.</p>}
                            </div>
                        </div>
                    )}
                </div>
                {user?.role === 'admin' && (
                   <Link to="/admin-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Admin Dashboard</Link>
                )}
                {user?.role === 'student' && (
                    <Link to="/student-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Student Dashboard</Link>
                )}
                <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;