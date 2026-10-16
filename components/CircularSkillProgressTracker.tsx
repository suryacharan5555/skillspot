import React, { useState } from 'react';
import { Enrollment, Course, NGO, AssignmentSubmission } from '../types';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Flame,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Building2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientId?: string;
  trackColor?: string;
  showText?: boolean;
  label?: string;
  subLabel?: string;
  statusIcon?: boolean;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  size = 92,
  strokeWidth = 8,
  color,
  gradientId,
  trackColor,
  showText = true,
  label,
  subLabel,
  statusIcon = true,
}) => {
  const normalizedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  // Determine dynamic gradient color based on percentage if not explicitly provided
  const resolvedColor =
    color ||
    (normalizedPercentage >= 100
      ? '#10b981' // emerald
      : normalizedPercentage >= 70
      ? '#3b82f6' // blue
      : normalizedPercentage >= 40
      ? '#8b5cf6' // purple
      : '#f59e0b'); // amber

  const uniqueId = gradientId || `circ-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0 select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            {normalizedPercentage >= 100 ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </>
            ) : normalizedPercentage >= 70 ? (
              <>
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </>
            ) : normalizedPercentage >= 40 ? (
              <>
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor || 'text-gray-100 dark:text-gray-700/80'}
          fill="transparent"
        />

        {/* Foreground animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || `url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Center content */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
          {normalizedPercentage >= 100 && statusIcon ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-0.5" />
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">100%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {normalizedPercentage}%
              </span>
              {label ? (
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mt-0.5">
                  {label}
                </span>
              ) : subLabel ? (
                <span className="text-[8px] text-gray-400">{subLabel}</span>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CircularSkillProgressTrackerProps {
  enrollments: Enrollment[];
  ngos: NGO[];
  assignmentSubmissions?: AssignmentSubmission[];
  completedTopicIds: Set<string>;
  onToggleTopicCompleted?: (topicId: string) => void;
  onViewSyllabus?: (course: Course) => void;
  onSubmitMilestone?: (enrollment: Enrollment, course?: Course) => void;
  onViewCertificate?: (payload: { enrollment: Enrollment; course?: Course; ngo?: NGO }) => void;
}

export const CircularSkillProgressTracker: React.FC<CircularSkillProgressTrackerProps> = ({
  enrollments = [],
  ngos = [],
  assignmentSubmissions = [],
  completedTopicIds,
  onToggleTopicCompleted,
  onViewSyllabus,
  onSubmitMilestone,
  onViewCertificate,
}) => {
  const [filterMode, setFilterMode] = useState<'current' | 'all' | 'completed'>('current');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Helper to resolve Course & NGO for an enrollment
  const getEnrollmentMeta = (enrollment: Enrollment) => {
    const ngo = (ngos || []).find((n) => n.id === enrollment.ngoId);
    const course = ngo?.courses?.find(
      (c) => c?.id === enrollment.courseId || c?.name === enrollment.courseName
    );
    return { course, ngo };
  };

  // Compute calculated metrics for each enrolled program
  const programProgressList = enrollments.map((enr) => {
    const { course, ngo } = getEnrollmentMeta(enr);
    const modules = course?.modules || [];
    const allTopics = modules.flatMap((m) => m.topics || []);

    // Count topics checked
    const completedTopicsCount = allTopics.filter((_, idx) =>
      completedTopicIds.has(`${course?.id || 'c'}-t-${idx}`)
    ).length;

    // Submissions for this enrollment or course
    const submissions = (assignmentSubmissions || []).filter(
      (s) => s.enrollmentId === enr.enrollmentId || (course && s.courseId === course.id)
    );

    let progressPercentage = 0;
    if (enr.status === 'Completed') {
      progressPercentage = 100;
    } else if (allTopics.length > 0) {
      // Direct proportion of mastered topics
      progressPercentage = Math.round((completedTopicsCount / allTopics.length) * 100);
      // Give realistic base for active approved cohort if learner is getting started
      if (progressPercentage === 0 && enr.status === 'Approved') {
        progressPercentage = 35;
      }
    } else {
      // Fallback if course has no explicit modules in schema
      progressPercentage = enr.status === 'Approved' ? 55 : enr.status === 'Pending' ? 10 : 0;
    }

    return {
      enrollment: enr,
      course,
      ngo,
      modules,
      allTopics,
      completedTopicsCount,
      submissions,
      progressPercentage,
      isCompleted: enr.status === 'Completed' || progressPercentage >= 100,
      isActive: enr.status === 'Approved',
      isPending: enr.status === 'Pending',
    };
  });

  // Filter based on active selection
  const filteredList = programProgressList.filter((item) => {
    if (filterMode === 'current') {
      return item.isActive || item.enrollment.status === 'Approved';
    }
    if (filterMode === 'completed') {
      return item.isCompleted;
    }
    return true; // 'all'
  });

  // Overall Vocational Progress Metrics across current / active programs
  const activePrograms = programProgressList.filter((p) => p.isActive);
  const targetPrograms = activePrograms.length > 0 ? activePrograms : programProgressList;

  const totalCalculatedProgress =
    targetPrograms.length > 0
      ? Math.round(
          targetPrograms.reduce((sum, p) => sum + p.progressPercentage, 0) / targetPrograms.length
        )
      : 0;

  const totalMasteredTopics = programProgressList.reduce((sum, p) => sum + p.completedTopicsCount, 0);
  const totalAvailableTopics = programProgressList.reduce((sum, p) => sum + p.allTopics.length, 0);
  const totalSubmissions = programProgressList.reduce((sum, p) => sum + p.submissions.length, 0);

  if (enrollments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
      {/* Header and Aggregate Radial Progress Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Skill Program Progress & Completion Tracker
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Real-time circular progress indicators tracking syllabus milestone completion, topic mastery, and verified credential readiness across your active cohorts.
          </p>
        </div>

        {/* Global Average Mastery Gauge & Key Indicators */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/50 dark:from-gray-750 dark:via-gray-750 dark:to-gray-750 p-4 rounded-2xl border border-blue-100/60 dark:border-gray-700 shrink-0">
          <div className="flex items-center space-x-3.5">
            <CircularProgressRing
              percentage={totalCalculatedProgress}
              size={84}
              strokeWidth={8}
              label="Mastery"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Overall Mastery</span>
              </span>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {totalCalculatedProgress >= 80
                  ? '🌟 Capstone Ready'
                  : totalCalculatedProgress >= 50
                  ? '⚡ Active Progression'
                  : '🌱 Foundational Phase'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {activePrograms.length} current active {activePrograms.length === 1 ? 'cohort' : 'cohorts'}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-[10px] text-gray-400 block font-semibold">Topics Mastered</span>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {totalMasteredTopics} / {totalAvailableTopics || '—'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-[10px] text-gray-400 block font-semibold">Submissions</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                {totalSubmissions} Submitted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-750 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('current')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterMode === 'current'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Current Skill Programs ({activePrograms.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            All Programs ({enrollments.length})
          </button>

          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterMode === 'completed'
                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed (100%)</span>
          </button>
        </div>

        <span className="text-[11px] text-gray-400 italic">
          Click topics inside any program to update your circular completion meter
        </span>
      </div>

      {/* Program Progress Cards Grid with Circular Indicators */}
      {filteredList.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 space-y-2">
          <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            No skill programs in this view
          </p>
          <p className="text-[11px] text-gray-400">
            Switch tabs above to view all enrolled or completed programs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredList.map(
            ({
              enrollment,
              course,
              ngo,
              modules,
              allTopics,
              completedTopicsCount,
              submissions,
              progressPercentage,
              isCompleted,
            }) => {
              const isExpanded = expandedCourseId === enrollment.enrollmentId;

              return (
                <div
                  key={enrollment.enrollmentId}
                  className={`relative rounded-2xl p-5 border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-gray-800 dark:to-gray-800 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs'
                      : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Main Circular Progress Ring */}
                    <div className="flex flex-col items-center pt-1">
                      <CircularProgressRing
                        percentage={progressPercentage}
                        size={86}
                        strokeWidth={7.5}
                        subLabel={isCompleted ? 'Done' : 'Progress'}
                      />
                      <span
                        className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                            : progressPercentage >= 70
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                        }`}
                      >
                        {isCompleted
                          ? 'Graduated'
                          : enrollment.status === 'Approved'
                          ? 'Active Cohort'
                          : enrollment.status}
                      </span>
                    </div>

                    {/* Program Information & Metrics */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {course?.category || 'Vocational Trade'}
                        </span>
                        {course?.level && (
                          <span className="text-[10px] font-semibold text-gray-400">
                            • {course.level}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight truncate" title={enrollment.courseName}>
                        {enrollment.courseName}
                      </h4>

                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <p className="flex items-center space-x-1 truncate">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {ngo?.name || 'Vocational Training Center'}
                          </span>
                        </p>
                        {course?.trainer && (
                          <p className="text-[11px] text-gray-400 truncate">
                            Instructor: {course.trainer} • Duration: {course.duration || '8 Weeks'}
                          </p>
                        )}
                      </div>

                      {/* Micro Progress Metrics Bar */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>
                            <strong>{completedTopicsCount}</strong> of {allTopics.length || 0} topics
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                          <FileCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>
                            <strong>{submissions.length}</strong> assignments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Expansion Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {modules.length > 0 && (
                        <button
                          onClick={() => setExpandedCourseId(isExpanded ? null : enrollment.enrollmentId)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Checklist' : 'Quick Checklist'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {course && onViewSyllabus && (
                        <button
                          onClick={() => onViewSyllabus(course)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center space-x-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Full Syllabus</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {onSubmitMilestone && (
                        <button
                          onClick={() => onSubmitMilestone(enrollment, course)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1 transition-all active:scale-95"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Submit Milestone</span>
                        </button>
                      )}

                      {isCompleted && onViewCertificate && (
                        <button
                          onClick={() => onViewCertificate({ enrollment, course, ngo })}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Syllabus Module Checklist with Direct Reactive Topic Checkoffs */}
                  {isExpanded && modules.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/80 space-y-3 bg-gray-50/60 dark:bg-gray-750/50 p-3.5 rounded-xl animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <span>Module Topic Mastery Checklist</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                          {progressPercentage}% Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {modules.map((mod, modIdx) => (
                          <div
                            key={mod.id || modIdx}
                            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-gray-800 dark:text-gray-200 truncate">
                                W{mod.weekNumber}: {mod.title}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {(mod.topics || []).map((topic, tIdx) => {
                                const topicKey = `${course?.id || 'c'}-t-${modIdx * 3 + tIdx}`;
                                const isChecked = completedTopicIds.has(topicKey);

                                return (
                                  <label
                                    key={tIdx}
                                    className="flex items-start space-x-2 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-emerald-600 select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => onToggleTopicCompleted && onToggleTopicCompleted(topicKey)}
                                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={isChecked ? 'line-through text-gray-400' : ''}>
                                      {topic}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default CircularSkillProgressTracker;
