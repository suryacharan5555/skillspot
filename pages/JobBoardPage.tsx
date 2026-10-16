import React, { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import { VocationalJob, JobApplication } from '../types';
import { JobCardGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Gift,
  PlusCircle,
  Building2,
  CheckCircle2,
  Award,
  ExternalLink,
  Share2,
  Sparkles,
  Send,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Clean Energy',
  'Technology',
  'Trades & Construction',
  'Healthcare',
  'Culinary Arts',
];

const JOB_TYPES = [
  'All Types',
  'Apprenticeship',
  'Full-time',
  'Tool Grant',
  'Paid Internship',
];

const JobBoardPage: React.FC = () => {
  const { jobs, setJobs, enrollments, portfolioItems, jobApplications, setJobApplications, setNotifications, loading } = useData();
  const { user, isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedJobForApply, setSelectedJobForApply] = useState<VocationalJob | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  // Application Form State
  const [attachedCertId, setAttachedCertId] = useState<string>('');
  const [coverNote, setCoverNote] = useState('');
  const [includePortfolio, setIncludePortfolio] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobCategory, setNewJobCategory] = useState('Clean Energy');
  const [newJobType, setNewJobType] = useState<VocationalJob['type']>('Apprenticeship');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobStipend, setNewJobStipend] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobRequirements, setNewJobRequirements] = useState('');
  const [newJobToolGrant, setNewJobToolGrant] = useState(false);
  const [newJobContact, setNewJobContact] = useState('');

  // Student's completed certificates
  const studentCertificates = useMemo(() => {
    if (!user) return [];
    return enrollments.filter((e) => e.studentId === user.id && e.status === 'Completed' && e.certificateId);
  }, [enrollments, user]);

  const studentProjects = useMemo(() => {
    if (!user) return [];
    return portfolioItems.filter((p) => p.studentId === user.id);
  }, [portfolioItems, user]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchCategory =
        selectedCategory === 'All Categories' || job.category === selectedCategory;
      const matchType = selectedType === 'All Types' || job.type === selectedType;
      const matchSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchType && matchSearch;
    });
  }, [jobs, selectedCategory, selectedType, searchQuery]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;

    const applicantName = user?.name || guestName.trim() || 'Vocational Applicant';
    const applicantEmail = user?.email || guestEmail.trim() || 'applicant@skillspot.org';
    const applicantId = user?.id || `guest-${Date.now()}`;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: selectedJobForApply.id,
      jobTitle: selectedJobForApply.title,
      studentId: applicantId,
      studentName: applicantName,
      studentEmail: applicantEmail,
      attachedCertificateId: attachedCertId || undefined,
      portfolioLinks: includePortfolio && studentProjects.length > 0 ? studentProjects.map((p) => p.title) : [],
      coverNote,
      appliedDate: new Date().toISOString(),
    };

    setJobApplications((prev) => [newApp, ...prev]);

    // Increment applicant count on job
    setJobs((prev) =>
      prev.map((j) => (j.id === selectedJobForApply.id ? { ...j, applicantsCount: (j.applicantsCount || 0) + 1 } : j))
    );

    // Trigger in-app notification if user is logged in
    if (user) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          userId: user.id,
          message: `Your application for "${selectedJobForApply.title}" at ${selectedJobForApply.company} was submitted successfully!`,
          link: '/jobs',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setApplySuccessMessage(`Application sent to ${selectedJobForApply.company}!`);
    setTimeout(() => {
      setApplySuccessMessage(null);
      setSelectedJobForApply(null);
      setCoverNote('');
    }, 2000);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) return;

    const created: VocationalJob = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      company: newJobCompany,
      category: newJobCategory,
      type: newJobType,
      location: newJobLocation || 'Multiple Sites',
      stipendOrSalary: newJobStipend || 'Competitive Stipend',
      description: newJobDescription,
      requirements: newJobRequirements
        ? newJobRequirements.split('\n').filter((r) => r.trim().length > 0)
        : ['Basic vocational training in trade'],
      toolGrantIncluded: newJobToolGrant,
      postedDate: new Date().toISOString().split('T')[0],
      contactEmail: newJobContact || 'recruiting@partner.org',
      applicantsCount: 0,
    };

    setJobs((prev) => [created, ...prev]);
    setIsPostJobModalOpen(false);

    // Reset form
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobDescription('');
    setNewJobRequirements('');
    setNewJobStipend('');
    setNewJobLocation('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Career Pathways & Apprenticeship Exchange</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Connecting Vocational Learners Directly to Employers
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Local workshops, green energy contractors, and tech partners recruit certified SkillSpot graduates.
            Explore apprenticeships with included starter tool-grants and verified digital credentials.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Apprenticeship or Tool Grant</span>
            </button>
            <a
              href="#/student-dashboard"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-all flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Your Verified Credentials ({studentCertificates.length})</span>
            </a>
          </div>
        </div>

        {/* Floating background decorative badge */}
        <div className="absolute right-6 -bottom-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">Active Openings</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">Tool Grants Sponsored</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {jobs.filter((j) => j.toolGrantIncluded).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">Apprenticeships</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {jobs.filter((j) => j.type === 'Apprenticeship').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-gray-400 block">Submitted Applications</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {jobApplications.length}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role, trade category, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-hidden text-gray-700 dark:text-gray-200 font-semibold"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-hidden text-gray-700 dark:text-gray-200 font-semibold"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <JobCardGlassSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {job.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.type === 'Apprenticeship'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : job.type === 'Tool Grant'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {job.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{job.company}</span>
                  </div>
                </div>

                {job.toolGrantIncluded && (
                  <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center space-x-1 shrink-0">
                    <Gift className="w-3 h-3 text-amber-500" />
                    <span>Tool Grant Included</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {job.description}
              </p>

              {/* Requirements Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Key Qualifications
                </span>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {(job.requirements || []).slice(0, 3).map((req, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Info & Action */}
            <div className="pt-5 mt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <DollarSign className="w-3 h-3" />
                  <span>{job.stipendOrSalary}</span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedJobForApply(job);
                    if (studentCertificates.length > 0) {
                      setAttachedCertId(studentCertificates[0].certificateId || '');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply with Credentials</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-2">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">No matching career openings found</h3>
          <p className="text-xs text-gray-400">Try broadening your trade category or search query.</p>
        </div>
      )}

      {/* Modal: Apply to Job with Credentials */}
      {selectedJobForApply && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-5 border-b pb-4 dark:border-gray-700">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>One-Click Credential Application</span>
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  {selectedJobForApply.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedJobForApply.company}</p>
              </div>
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{applySuccessMessage}</h3>
                <p className="text-xs text-gray-500">Your application and certified credentials have been received.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                {user ? (
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Applicant Name & Contact (Auto-attached)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${user.name} (${user.email})`}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-semibold"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Attach Verified Certificate */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Attach Verified SkillSpot Certificate
                  </label>
                  {studentCertificates.length > 0 ? (
                    <select
                      value={attachedCertId}
                      onChange={(e) => setAttachedCertId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-emerald-400/50 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      {studentCertificates.map((cert) => (
                        <option key={cert.certificateId} value={cert.certificateId}>
                          🎓 {cert.courseName} (ID: {cert.certificateId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
                      No completed certificates found yet. You can still apply with your practical portfolio and cover note!
                    </div>
                  )}
                </div>

                {/* Portfolio Showcase attachment */}
                {studentProjects.length > 0 && (
                  <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                        Include Student Capstone Showcase
                      </span>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-300">
                        {studentProjects.length} practical project(s) ready to share
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includePortfolio}
                      onChange={(e) => setIncludePortfolio(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Introductory Note & Hands-on Strengths
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your hands-on experience, shop safety compliance, and why you are excited for this opportunity..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJobForApply(null)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Post New Job / Tool Grant */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-5 border-b pb-4 dark:border-gray-700">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Employer & Workshop Portal
                </span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Post a Vocational Opportunity
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Connect with skilled tradespeople and vocational graduates from trusted community NGOs.
                </p>
              </div>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar PV Installer Apprentice"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Hiring Company or Workshop *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pacific Solar Works"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Vocational Category
                  </label>
                  <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Pathway Type
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                  >
                    {JOB_TYPES.filter((t) => t !== 'All Types').map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Location / Worksite
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oakland, CA (On-site)"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Hourly Stipend or Salary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $22.00 / hr + Benefits"
                    value={newJobStipend}
                    onChange={(e) => setNewJobStipend(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">
                    Sponsor a Tool Starter Kit Grant 🎁
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300">
                    Provides new apprentice with their own basic tools/safety equipment
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newJobToolGrant}
                  onChange={(e) => setNewJobToolGrant(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Role Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe daily duties, trade mentoring, and equipment exposure..."
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Required SkillSpot Qualifications (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. SkillSpot Verified Solar Certificate&#10;OSHA-10 card"
                  value={newJobRequirements}
                  onChange={(e) => setNewJobRequirements(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Employer Contact Email
                </label>
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={newJobContact}
                  onChange={(e) => setNewJobContact(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardPage;
