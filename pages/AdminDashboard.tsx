import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import { Enrollment, EnrollmentStatus, Notification, Course, NGO, User } from '../types';
import { supabase } from '../lib/supabaseClient';
import CourseEditorModal from '../components/CourseEditorModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ImpactAnalytics from '../components/ImpactAnalytics';
import SkillTrendsModule from '../components/SkillTrendsModule';
import AdminDataVisualizations from '../components/AdminDataVisualizations';
import CourseSyllabusModal from '../components/CourseSyllabusModal';
import EquipmentInventoryManager from '../components/EquipmentInventoryManager';
import BroadcastMessagingManager from '../components/BroadcastMessagingManager';
import OrganizationProfileModal from '../components/OrganizationProfileModal';
import { dispatchRealtimeNotification } from '../services/realtimeNotificationService';
import { DashboardGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Settings,
  PlusCircle,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck,
  UserCheck,
  X,
  FileText,
  Download,
  Radio,
  Wrench,
  Printer,
  Image as ImageIcon,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const EnrollmentDetailsModal: React.FC<{
  enrollment: Enrollment;
  student?: User;
  onClose: () => void;
}> = ({ enrollment, student, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Applicant Profile & Application Form</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {enrollment.studentName}
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">ID: {enrollment.enrollmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Student Info Card */}
          <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Name:</strong>{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{enrollment.studentName}</span>
              </p>
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Email:</strong>{' '}
                <span className="text-gray-900 dark:text-white">{student?.email || 'Registered Candidate'}</span>
              </p>
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Phone:</strong>{' '}
                <span className="text-gray-900 dark:text-white">{student?.phone || 'On file'}</span>
              </p>
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Target Cohort:</strong>{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">{enrollment.courseName}</span>
              </p>
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Status:</strong>{' '}
                <span className="font-semibold">{enrollment.status}</span>
              </p>
              <p>
                <strong className="text-gray-500 dark:text-gray-400">Application Date:</strong>{' '}
                <span>{new Date(enrollment.requestDate).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Candidate Written Answers */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Previous Experience & Background
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 leading-relaxed whitespace-pre-wrap">
                {enrollment.previousExperience || 'No prior formal experience noted.'}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Reason for Joining & Career Objectives
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 leading-relaxed whitespace-pre-wrap">
                {enrollment.reasonForJoining || 'Seeking hands-on trade skills for employment.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-xs shadow-sm transition-all"
          >
            Close Candidate Card
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    users,
    ngos,
    setNgos,
    enrollments,
    setEnrollments,
    setNotifications,
    fetchNgos,
    loading,
    error,
    equipment,
    placementRecords,
  } = useData();
  const navigate = useNavigate();

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<
    'visualizations' | 'analytics' | 'trends' | 'applicants' | 'courses' | 'equipment' | 'broadcasts' | 'settings'
  >('visualizations');

  // Export Full Student Impact & Certification Report as CSV
  const handleExportCsv = () => {
    if (!adminNgo) return;
    const headers = [
      'Enrollment ID',
      'Student Name',
      'Course Name',
      'Status',
      'Application Date',
      'Completion Date',
      'Certificate ID',
      'Honors Grade',
    ];
    const rows = ngoEnrollments.map((e) => [
      e.enrollmentId,
      `"${(e.studentName || '').replace(/"/g, '""')}"`,
      `"${(e.courseName || '').replace(/"/g, '""')}"`,
      e.status,
      e.requestDate,
      e.completedDate || 'N/A',
      e.certificateId || 'N/A',
      `"${(e.gradeScore || 'N/A').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${(adminNgo?.name || 'Organization').replace(/\s+/g, '_')}_Student_Impact_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus | 'All'>('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [previewingCourseSyllabus, setPreviewingCourseSyllabus] = useState<Course | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteNgoModalOpen, setIsDeleteNgoModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const [viewingEnrollment, setViewingEnrollment] = useState<Enrollment | null>(null);

  const adminNgo = useMemo(() => ngos.find((ngo) => ngo.id === user?.ngoId), [ngos, user]);

  const ngoEnrollments = useMemo(() => {
    if (!adminNgo) return [];
    return enrollments.filter((e) => e.ngoId === adminNgo.id);
  }, [enrollments, adminNgo]);

  const filteredEnrollments = useMemo(() => {
    if (enrollmentFilter === 'All') return ngoEnrollments;
    return ngoEnrollments.filter((e) => e.status === enrollmentFilter);
  }, [ngoEnrollments, enrollmentFilter]);

  const studentForViewingEnrollment = useMemo(() => {
    if (!viewingEnrollment) return undefined;
    return users.find((u) => u.id === viewingEnrollment.studentId);
  }, [viewingEnrollment, users]);

  // Handle status transitions
  const handleUpdateStatus = async (
    enrollment: Enrollment,
    newStatus: EnrollmentStatus,
    customGradeScore?: string
  ) => {
    setIsUpdating(enrollment.enrollmentId);
    try {
      const updatePayload: Partial<Enrollment> = {
        status: newStatus,
      };

      let notificationMsg = `Your application for "${enrollment.courseName}" has been updated to ${newStatus}.`;

      if (newStatus === 'Completed') {
        const certSuffix = Math.floor(1000 + Math.random() * 9000);
        updatePayload.certificateId = `CERT-${(adminNgo?.id || 'SKILL').substring(0, 4).toUpperCase()}-2026-${certSuffix}`;
        updatePayload.completedDate = new Date().toISOString();
        updatePayload.gradeScore = customGradeScore || 'Certified with Honors (Grade A)';
        notificationMsg = `🎉 Congratulations! You have successfully completed "${enrollment.courseName}". Your official verified certificate is now available in your Student Dashboard!`;
      }

      try {
        const { data: updatedEnrollment, error: updateError } = await supabase
          .from('enrollments')
          .update(updatePayload)
          .eq('enrollmentId', enrollment.enrollmentId)
          .select()
          .single();

        if (updateError) throw updateError;
        setEnrollments((prev) =>
          prev.map((e) => (e.enrollmentId === enrollment.enrollmentId ? updatedEnrollment : e))
        );
      } catch {
        const localUpdated = { ...enrollment, ...updatePayload };
        setEnrollments((prev) =>
          prev.map((e) => (e.enrollmentId === enrollment.enrollmentId ? localUpdated : e))
        );
      }

      const isCert = newStatus === 'Completed';
      const isAppr = newStatus === 'Approved';

      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: enrollment.studentId,
        type: isCert ? 'certificate' : isAppr ? 'enrollment' : 'announcement',
        title: isCert
          ? 'Accredited Certificate Issued!'
          : isAppr
          ? 'Cohort Application Approved!'
          : 'Enrollment Status Updated',
        message: notificationMsg,
        link: `/student-dashboard`,
        isRead: false,
        createdAt: new Date().toISOString(),
        courseName: enrollment.courseName,
        courseId: enrollment.courseId,
        certificateId: updatePayload.certificateId,
        actionLabel: isCert ? 'View Certificate' : 'Open Cohort',
      };

      try {
        const { data: createdNotification, error: notifyError } = await supabase
          .from('notifications')
          .insert({
            userId: newNotification.userId,
            message: newNotification.message,
            link: newNotification.link,
            isRead: false,
            createdAt: newNotification.createdAt,
          })
          .select()
          .single();

        if (!notifyError && createdNotification) {
          const combined = { ...newNotification, id: createdNotification.id };
          setNotifications((prev) => [...prev, combined]);
          dispatchRealtimeNotification(combined);
        } else {
          setNotifications((prev) => [...prev, newNotification]);
          dispatchRealtimeNotification(newNotification);
        }
      } catch {
        setNotifications((prev) => [...prev, newNotification]);
        dispatchRealtimeNotification(newNotification);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveCourse = async (courseData: Course) => {
    if (!adminNgo) return;

    const isEditing = !!editingCourse;
    let updatedCourses: Course[];

    if (isEditing) {
      updatedCourses = adminNgo.courses.map((c) => (c.id === courseData.id ? courseData : c));
    } else {
      updatedCourses = [...adminNgo.courses, courseData];
    }

    try {
      const { error } = await supabase
        .from('ngos')
        .update({ courses: updatedCourses })
        .eq('id', adminNgo.id);

      if (error) adminNgo.courses = updatedCourses;
      await fetchNgos();
      setIsCourseModalOpen(false);
      setEditingCourse(null);
    } catch (err: any) {
      console.error('Failed to save course:', err);
      adminNgo.courses = updatedCourses;
      setIsCourseModalOpen(false);
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (!adminNgo || !courseToDelete) return;

    const updatedCourses = adminNgo.courses.filter((c) => c.id !== courseToDelete.id);

    try {
      const { error } = await supabase
        .from('ngos')
        .update({ courses: updatedCourses })
        .eq('id', adminNgo.id);

      if (error) adminNgo.courses = updatedCourses;
      await fetchNgos();
      setCourseToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      adminNgo.courses = updatedCourses;
      setCourseToDelete(null);
    }
  };

  const handleDeleteNgo = async () => {
    if (!adminNgo) return;

    try {
      setNgos((prev) => prev.filter((n) => n.id !== adminNgo.id));
      setEnrollments((prev) => prev.filter((e) => e.ngoId !== adminNgo.id));
      await supabase.from('enrollments').delete().eq('ngoId', adminNgo.id);
      await supabase.from('users').delete().eq('ngoId', adminNgo.id);
      await supabase.from('ngos').delete().eq('id', adminNgo.id);
      setIsDeleteNgoModalOpen(false);
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error('Failed to delete NGO:', err);
      setIsDeleteNgoModalOpen(false);
      navigate('/');
    }
  };

  if (loading) {
    return <DashboardGlassSkeleton role="admin" />;
  }

  if (error) return <p className="text-rose-500 text-center py-12 text-xs">Error: {error}</p>;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl text-white overflow-hidden shrink-0 shadow-lg">
              {adminNgo?.logoUrl ? (
                <img src={adminNgo.logoUrl} alt={adminNgo?.name || 'Organization'} className="w-full h-full object-cover" />
              ) : (
                adminNgo?.name ? adminNgo.name.slice(0, 2).toUpperCase() : 'SS'
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Admin Management Studio</span>
                </span>
                <span className="text-xs text-white/40">•</span>
                <span className="text-xs text-indigo-200 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{adminNgo?.location}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {adminNgo?.name || 'Organization Dashboard'}
              </h1>
              <p className="text-xs text-indigo-200/80 max-w-xl">
                Curate vocational curriculum, review candidate admissions, grant honors certificates, and monitor cohort analytics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {adminNgo && (
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-amber-300" />
                <span>Edit Profile & Branding</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center space-x-1.5 transition-all"
              title="Download full candidate, enrollment, and certification records"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-indigo-500/25 flex items-center space-x-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Vocational Program</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('visualizations')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'visualizations'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <span>Data Visualizations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
            Recharts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Impact Brief & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'trends'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Skill Trends</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            Cross-Tenant
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'applicants'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Applicants & Certification</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
            {ngoEnrollments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'courses'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span>Curriculum & Cohorts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">
            {adminNgo?.courses?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'equipment'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-500" />
          <span>Workshop Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'broadcasts'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Radio className="w-4 h-4 text-cyan-500" />
          <span>Student Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-gray-800 border-t-2 border-l border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Center Settings</span>
        </button>
      </div>

      {/* Tab: Data Visualizations (Recharts: Enrollment Trends, Skill Mastery, NGO Activity) */}
      {activeTab === 'visualizations' && (
        <AdminDataVisualizations
          ngo={adminNgo}
          ngos={ngos}
          enrollments={enrollments}
          equipment={equipment}
          placementRecords={placementRecords}
          users={users}
        />
      )}

      {/* Tab 1: Impact Analytics & Charts */}
      {activeTab === 'analytics' && adminNgo && (
        <ImpactAnalytics
          ngo={adminNgo}
          enrollments={ngoEnrollments}
          onViewSkillTrends={() => setActiveTab('trends')}
          onViewVisualizations={() => setActiveTab('visualizations')}
        />
      )}

      {/* Tab: Cross-Tenant Skill Trends & Popularity Module */}
      {activeTab === 'trends' && (
        <SkillTrendsModule ngos={ngos} enrollments={enrollments} />
      )}

      {/* Tab 2: Applicants & Certification */}
      {activeTab === 'applicants' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Candidate Admissions & Credentials
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Review applicant statements, approve cohort admission, and grant verified certificates upon completion.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-1">
              {(['All', 'Pending', 'Approved', 'Completed', 'Rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setEnrollmentFilter(status)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    enrollmentFilter === status
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Applied Program</th>
                  <th className="pb-3 font-semibold">Applied Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                {filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.enrollmentId}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {enrollment.studentName}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ID: {(enrollment.enrollmentId || enrollment.id || 'ENR-00000').substring(0, 10)}...
                      </span>
                    </td>

                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300 font-medium">
                      {enrollment.courseName}
                    </td>

                    <td className="py-4 pr-4 text-gray-400">
                      {new Date(enrollment.requestDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center space-x-1 ${
                          enrollment.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : enrollment.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : enrollment.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {enrollment.status === 'Completed' && '🎓 '}
                        {enrollment.status}
                      </span>
                    </td>

                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingEnrollment(enrollment)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-[11px] inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Form</span>
                      </button>

                      {enrollment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(enrollment, 'Approved')}
                            disabled={isUpdating === enrollment.enrollmentId}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(enrollment, 'Rejected')}
                            disabled={isUpdating === enrollment.enrollmentId}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[11px] transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {enrollment.status === 'Approved' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              enrollment,
                              'Completed',
                              'Certified with Distinction (Grade A)'
                            )
                          }
                          disabled={isUpdating === enrollment.enrollmentId}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow-sm"
                        >
                          <Award className="w-3 h-3" />
                          <span>Award Certificate</span>
                        </button>
                      )}

                      {enrollment.status === 'Completed' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          ✓ {enrollment.certificateId}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs">
                No candidate records found matching this status filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum & Cohorts Manager */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Active Training Programs
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage weekly module syllabi, seat caps, trainers, and certifications.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="bg-blue-600 text-white font-bold py-2 px-3.5 rounded-xl hover:bg-blue-700 text-xs flex items-center space-x-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-semibold">Course & Category</th>
                  <th className="pb-3 font-semibold">Syllabus Structure</th>
                  <th className="pb-3 font-semibold">Start Date</th>
                  <th className="pb-3 font-semibold">Seats</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                {adminNgo?.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {course.name}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                          {course.category}
                        </span>
                        {course.level && (
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.2 rounded text-gray-600 dark:text-gray-300">
                            {course.level}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 pr-4">
                      <button
                        onClick={() => setPreviewingCourseSyllabus(course)}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course.modules?.length || 0} Modules</span>
                      </button>
                    </td>

                    <td className="py-4 pr-4 text-gray-400">
                      {new Date(course.startDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 pr-4 font-semibold text-gray-700 dark:text-gray-300">
                      {course.seatsAvailable} seats
                    </td>

                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsCourseModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold hover:bg-blue-100 transition-colors text-[11px] inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setCourseToDelete(course);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold hover:bg-rose-100 transition-colors text-[11px] inline-flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Workshop Equipment & Asset Tracker */}
      {activeTab === 'equipment' && (
        <EquipmentInventoryManager />
      )}

      {/* Tab 5: Multi-Channel Student Broadcasts */}
      {activeTab === 'broadcasts' && (
        <BroadcastMessagingManager
          courses={adminNgo?.courses || []}
          enrollments={ngoEnrollments}
        />
      )}

      {/* Tab 6: NGO Profile & Branding Management */}
      {activeTab === 'settings' && adminNgo && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Public Identity & Branding</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Organization Profile & Customization
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your center's profile photo, cover banner, mission, campus location, and contact information.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => navigate(`/ngo/${adminNgo.id}`)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  <span>View Public Page</span>
                </button>
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Branding</span>
                </button>
              </div>
            </div>

            {/* Live Branding Preview Card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
              <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 overflow-hidden flex items-end p-5">
                {adminNgo.coverImageUrl && (
                  <img
                    src={adminNgo.coverImageUrl}
                    alt="Cover banner preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
                <div className="relative z-10 flex justify-between items-end w-full">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-bold text-[11px]">
                    Cover Page Banner Preview
                  </span>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-900 font-bold text-xs shadow flex items-center space-x-1 transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Cover Banner</span>
                  </button>
                </div>
              </div>

              {/* Identity Row */}
              <div className="p-6 pt-0 bg-white dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-5 gap-4">
                  <div className="flex items-end space-x-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center font-black text-2xl text-blue-600 dark:text-blue-400 overflow-hidden shrink-0 relative z-10">
                      {adminNgo?.logoUrl ? (
                        <img src={adminNgo.logoUrl} alt={adminNgo?.name || 'Organization'} className="w-full h-full object-cover" />
                      ) : (
                        adminNgo?.name ? adminNgo.name.slice(0, 2).toUpperCase() : 'SS'
                      )}
                    </div>
                    <div className="pb-1">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {adminNgo?.name || 'Organization'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <span>{adminNgo?.location || 'Location not set'}</span>
                        {adminNgo?.establishedYear && (
                          <span className="ml-3 flex items-center text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            Est. {adminNgo.establishedYear}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                      {adminNgo.type}
                    </span>
                    {adminNgo.accreditation && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-emerald-500" />
                        <span>{adminNgo.accreditation}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mission Callout */}
                {adminNgo.mission && (
                  <div className="mb-5 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                      Mission Statement
                    </span>
                    <p className="text-xs text-gray-800 dark:text-gray-200 italic">
                      "{adminNgo.mission}"
                    </p>
                  </div>
                )}

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-2 text-gray-400 mb-1">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] uppercase font-bold">Email Address</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{adminNgo.contact.email}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-2 text-gray-400 mb-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] uppercase font-bold">Support Line</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{adminNgo.contact.phone}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-2 text-gray-400 mb-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] uppercase font-bold">Website</span>
                    </div>
                    <a
                      href={adminNgo.contact.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {adminNgo.contact.website}
                    </a>
                  </div>
                </div>

                {adminNgo.address && (
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 text-xs flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Campus Facility Address</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{adminNgo.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-rose-100 dark:border-rose-900/40">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">Danger Zone</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Permanently delete this NGO center and unenroll all active candidates.
              </p>
              <button
                onClick={() => setIsDeleteNgoModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Delete Organization Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Editor Modal */}
      {isCourseModalOpen && (
        <CourseEditorModal
          isOpen={isCourseModalOpen}
          courseToEdit={editingCourse}
          onClose={() => {
            setIsCourseModalOpen(false);
            setEditingCourse(null);
          }}
          onSave={handleSaveCourse}
        />
      )}

      {/* Syllabus Preview Modal */}
      {previewingCourseSyllabus && (
        <CourseSyllabusModal
          course={previewingCourseSyllabus}
          isOpen={!!previewingCourseSyllabus}
          onClose={() => setPreviewingCourseSyllabus(null)}
        />
      )}

      {/* Delete Course Modal */}
      {isDeleteModalOpen && courseToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Course Program"
          message={`Are you sure you want to delete "${courseToDelete?.name || 'this course'}"? This action cannot be undone.`}
          onConfirm={handleDeleteCourse}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
          }}
        />
      )}

      {/* Delete NGO Modal */}
      {isDeleteNgoModalOpen && adminNgo && (
        <ConfirmationModal
          isOpen={isDeleteNgoModalOpen}
          title="Delete Entire Organization Profile"
          message={`Are you sure you want to permanently delete "${adminNgo?.name || 'this organization'}"? All associated courses and candidate records will be erased.`}
          onConfirm={handleDeleteNgo}
          onCancel={() => setIsDeleteNgoModalOpen(false)}
        />
      )}

      {/* Applicant Details Modal */}
      {viewingEnrollment && (
        <EnrollmentDetailsModal
          enrollment={viewingEnrollment}
          student={studentForViewingEnrollment}
          onClose={() => setViewingEnrollment(null)}
        />
      )}

      {/* Organization Profile & Branding Editor Modal */}
      {isEditProfileModalOpen && adminNgo && (
        <OrganizationProfileModal
          ngo={adminNgo}
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSave={(updatedNgo) => {
            setNgos((prev) => prev.map((n) => (n.id === updatedNgo.id ? updatedNgo : n)));
          }}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
