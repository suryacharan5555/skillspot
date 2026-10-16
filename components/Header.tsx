import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../data/DataContext';
import {
  Compass,
  Building2,
  Briefcase,
  ShieldCheck,
  Users,
  BarChart3,
  Sun,
  Moon,
  Bell,
  GraduationCap,
  LogOut,
  User as UserIcon,
  Sparkles,
  PlusCircle,
  Menu,
  X,
  Mic,
  MapPin,
  Heart,
  Wrench,
  Clock,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';
import RegisterNgoModal from './RegisterNgoModal';
import UserProfileModal from './UserProfileModal';
import { playNotificationSound } from '../services/realtimeNotificationService';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, setNotifications } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotifTab, setSelectedNotifTab] = useState<'all' | 'deadline' | 'enrollment' | 'certificate'>('all');
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('skillspot_sound_enabled') === 'false';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const toggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem('skillspot_sound_enabled', next ? 'false' : 'true');
      if (!next) {
        playNotificationSound('default');
      }
      return next;
    });
  };

  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, user]);

  const filteredNotifications = useMemo(() => {
    if (selectedNotifTab === 'all') return userNotifications;
    return userNotifications.filter((n) => {
      const msg = (n.message || '').toLowerCase();
      const title = (n.title || '').toLowerCase();
      if (selectedNotifTab === 'deadline') {
        return n.type === 'deadline' || msg.includes('deadline') || msg.includes('due') || title.includes('deadline');
      }
      if (selectedNotifTab === 'enrollment') {
        return n.type === 'enrollment' || msg.includes('enrollment') || msg.includes('approved') || title.includes('enrollment');
      }
      if (selectedNotifTab === 'certificate') {
        return n.type === 'certificate' || msg.includes('certificate') || msg.includes('completed') || title.includes('certificate');
      }
      return true;
    });
  }, [userNotifications, selectedNotifTab]);

  const unreadCount = useMemo(
    () => userNotifications.filter((n) => !n.isRead).length,
    [userNotifications]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = (notificationId: string, link: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setIsNotificationsOpen(false);
    navigate(link);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === user?.id ? { ...n, isRead: true } : n))
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo & Brand Identity */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[10px] flex items-center justify-center">
                    <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      SkillSpot
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      2.0
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Decentralized Vocational Ecosystem</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>NGO Centers</span>
              </Link>

              <Link
                to="/jobs"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/jobs')
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span>Job & Tool Grants</span>
              </Link>

              <Link
                to="/coach"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/coach')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Mic className="w-4 h-4 text-blue-500" />
                <span>AI Trade Coach</span>
              </Link>

              <Link
                to="/employers"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/employers')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>Employer Portal</span>
              </Link>

              <Link
                to="/workshops"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/workshops')
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-500" />
                <span>Workshop Map</span>
              </Link>

              <Link
                to="/verify"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/verify')
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Verify Certificate</span>
              </Link>

              {user?.role === 'student' && (
                <Link
                  to="/student-dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive('/student-dashboard')
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span>Student Hub</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin-dashboard')
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>Admin Studio</span>
                </Link>
              )}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2">
              {/* Quick Register NGO Button */}
              {(!isAuthenticated || user?.role !== 'admin') && (
                <button
                  onClick={() => setIsNgoModalOpen(true)}
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xs transition-all duration-200"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Register NGO</span>
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700 hover:rotate-12 transition-transform" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in duration-150">
                      {/* Notification Header */}
                      <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-gray-800 dark:to-gray-800/95 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                              {unreadCount} new
                            </span>
                          )}
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleSound}
                            className="p-1 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                            title={isSoundMuted ? 'Turn Sound On' : 'Mute Sounds'}
                          >
                            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
                          </button>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Filter Chips */}
                      <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-750 text-[11px] font-bold overflow-x-auto">
                        <button
                          onClick={() => setSelectedNotifTab('all')}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            selectedNotifTab === 'all'
                              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          All ({userNotifications.length})
                        </button>
                        <button
                          onClick={() => setSelectedNotifTab('deadline')}
                          className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                            selectedNotifTab === 'deadline'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Deadlines</span>
                        </button>
                        <button
                          onClick={() => setSelectedNotifTab('enrollment')}
                          className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                            selectedNotifTab === 'enrollment'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Enrollments</span>
                        </button>
                        <button
                          onClick={() => setSelectedNotifTab('certificate')}
                          className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                            selectedNotifTab === 'certificate'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>Certificates</span>
                        </button>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                        {filteredNotifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-xs space-y-1">
                            <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                            <p className="font-semibold text-gray-600 dark:text-gray-300">No notifications in this filter</p>
                            <p className="text-[11px] text-gray-400">
                              You will receive alerts here about workshop deadlines, cohort enrollments, and certificates.
                            </p>
                          </div>
                        ) : (
                          filteredNotifications.map((notif) => {
                            const isDeadline = notif.type === 'deadline' || notif.message.toLowerCase().includes('deadline') || notif.message.toLowerCase().includes('due');
                            const isCertificate = notif.type === 'certificate' || notif.message.toLowerCase().includes('certificate') || notif.message.toLowerCase().includes('congratulations');
                            const isEnrollment = notif.type === 'enrollment' || notif.message.toLowerCase().includes('enrollment') || notif.message.toLowerCase().includes('approved');

                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id, notif.link)}
                                className={`p-3.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                                  !notif.isRead
                                    ? 'bg-blue-50/40 dark:bg-blue-950/20 font-medium'
                                    : 'text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-start space-x-2.5">
                                  {/* Icon */}
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                      isDeadline
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                        : isCertificate
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : isEnrollment
                                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                    }`}
                                  >
                                    {isDeadline ? (
                                      <Clock className="w-3.5 h-3.5" />
                                    ) : isCertificate ? (
                                      <Award className="w-3.5 h-3.5" />
                                    ) : isEnrollment ? (
                                      <BookOpen className="w-3.5 h-3.5" />
                                    ) : (
                                      <Bell className="w-3.5 h-3.5" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`text-[9px] font-extrabold uppercase tracking-wider ${
                                          isDeadline
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : isCertificate
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : isEnrollment
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500'
                                        }`}
                                      >
                                        {isDeadline ? 'Workshop Deadline' : isCertificate ? 'Accredited Credential' : isEnrollment ? 'Enrollment Update' : 'Notice'}
                                      </span>
                                      {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                      )}
                                    </div>

                                    {notif.title && (
                                      <h6 className="font-bold text-[11px] text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                                        {notif.title}
                                      </h6>
                                    )}

                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[11px] mt-0.5">
                                      {notif.message}
                                    </p>

                                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                                      <span className="text-[9px] text-gray-400">
                                        {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                                        {new Date(notif.createdAt).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                        {notif.actionLabel || 'View Details →'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Authentication Menu */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2 pl-1 border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsUserProfileModalOpen(true)}
                    className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                    title="Edit Profile & Details"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 group-hover:ring-2 ring-blue-500/40 transition-all">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        (user?.name || 'U').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs font-bold text-gray-900 dark:text-white leading-none group-hover:text-blue-600 transition-colors">
                        {user?.name || 'User'}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mt-0.5">
                        {user.role === 'admin' ? 'NGO Administrator' : 'Candidate'} • Edit
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
                >
                  Sign In / Register
                </Link>
              )}

              {/* Mobile menu trigger button */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>NGO Centers</span>
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>Job & Tool Grants</span>
            </Link>
            <Link
              to="/coach"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Mic className="w-4 h-4 text-blue-500" />
              <span>AI Trade Coach</span>
            </Link>
            <Link
              to="/employers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Employer Portal</span>
            </Link>
            <Link
              to="/workshops"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MapPin className="w-4 h-4 text-teal-500" />
              <span>Workshop Map</span>
            </Link>
            <Link
              to="/verify"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Verify Certificate</span>
            </Link>
            {user?.role === 'student' && (
              <Link
                to="/student-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Hub</span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Admin Studio</span>
              </Link>
            )}

            {/* Mobile Drawer Settings Row: Theme & Sound */}
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-3 py-1">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleSound}
                className="flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                title={isSoundMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
              >
                {isSoundMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-500" />
                )}
                <span>{isSoundMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Guided 5-Step Register NGO Wizard Modal */}
      {isNgoModalOpen && (
        <RegisterNgoModal
          isOpen={isNgoModalOpen}
          onClose={() => setIsNgoModalOpen(false)}
        />
      )}

      {/* User Profile & Cover Management Modal */}
      {isUserProfileModalOpen && user && (
        <UserProfileModal
          user={user}
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          onSave={(updates) => updateUser(updates)}
        />
      )}
    </>
  );
};

export default Header;
