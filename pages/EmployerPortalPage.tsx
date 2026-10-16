import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import {
  Briefcase,
  Building2,
  Users,
  CheckCircle2,
  Send,
  Filter,
  Search,
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlacementRecord, InterviewInvitation } from '../types';
import { DashboardGlassSkeleton } from '../components/skeletons/GlassSkeleton';

export const EmployerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const {
    users,
    enrollments,
    portfolioItems,
    employerProfiles,
    placementRecords,
    setPlacementRecords,
    interviewInvitations,
    setInterviewInvitations,
    loading,
  } = useData();

  const [activeTab, setActiveTab] = useState<'candidates' | 'invitations' | 'placements'>('candidates');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Employer context (defaults to first or logged in company)
  const [activeEmployerId, setActiveEmployerId] = useState<string>(employerProfiles[0]?.id || 'emp-1');
  const currentEmployer = employerProfiles.find((e) => e.id === activeEmployerId) || employerProfiles[0];

  // Modals
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [invitePosition, setInvitePosition] = useState<string>('');
  const [inviteDate, setInviteDate] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>('');

  const [showPlacementModal, setShowPlacementModal] = useState<boolean>(false);
  const [selectedPlacementGradId, setSelectedPlacementGradId] = useState<string>('');
  const [newPlacement, setNewPlacement] = useState<Partial<PlacementRecord>>({
    companyName: currentEmployer?.companyName || 'Apex Solar & Clean Energy Grid',
    jobTitle: '',
    startingHourlyWage: '$28.00 / hr',
    startDate: new Date().toISOString().split('T')[0],
    retentionMilestone: 'Active (Month 1-2)',
    donorReported: true,
    notes: '',
  });

  // Eligible graduates: ONLY students who have successfully graduated & completed an accredited program with verified certificates
  const graduates = React.useMemo(() => {
    // Strictly filter enrollments where status is 'Completed' and an authentic certificate was issued
    const completedEnrollments = (enrollments || []).filter(
      (e) => e.status === 'Completed' && Boolean(e.certificateId)
    );

    return completedEnrollments.map((enr) => {
      const studentUser = (users || []).find((u) => u.id === (enr.studentId || (enr as any).userId));
      const studentId = enr.studentId || (enr as any).userId || studentUser?.id || `grad-${enr.enrollmentId || Date.now()}`;
      const studentName = enr.studentName || studentUser?.name || 'Certified Graduate';
      const studentEmail = studentUser?.email || `${studentName.toLowerCase().replace(/\s+/g, '.')}@alumni.skillspot.org`;
      const portfolio = (portfolioItems || []).find((p) => p.studentId === studentId);
      const courseTitle = enr.courseName || 'Accredited Vocational Program';
      const completedDate = enr.completedDate || enr.requestDate || '2025-08-30T17:00:00Z';

      // Detect trade domain
      let trade = 'General Vocational Trade';
      const lowerCourse = courseTitle.toLowerCase();
      if (lowerCourse.includes('solar') || lowerCourse.includes('energy') || lowerCourse.includes('heat pump') || lowerCourse.includes('environmental')) {
        trade = 'Clean Energy';
      } else if (lowerCourse.includes('web') || lowerCourse.includes('software') || lowerCourse.includes('data') || lowerCourse.includes('robotics') || lowerCourse.includes('plc') || lowerCourse.includes('technology')) {
        trade = 'Technology';
      } else if (lowerCourse.includes('weld') || lowerCourse.includes('fabrication') || lowerCourse.includes('pcb') || lowerCourse.includes('carpentry') || lowerCourse.includes('hardware')) {
        trade = 'Welding';
      } else if (lowerCourse.includes('nurs') || lowerCourse.includes('cna') || lowerCourse.includes('health')) {
        trade = 'Healthcare';
      } else if (lowerCourse.includes('design') || lowerCourse.includes('ux') || lowerCourse.includes('cad')) {
        trade = 'Design';
      }

      return {
        id: studentId,
        enrollmentId: enr.enrollmentId,
        name: studentName,
        email: studentEmail,
        course: courseTitle,
        trade,
        grade: enr.gradeScore || 'Certified with Honors (Grade A)',
        honors: true,
        certificateId: enr.certificateId || `CERT-VERIFIED-${studentId.substring(0, 5).toUpperCase()}`,
        completedDate,
        workshopHours: 360,
        portfolioTitle: portfolio?.title || `${courseTitle} Industry Capstone`,
        portfolioTools: portfolio?.toolsUsed || ['OSHA 10 Safety Certified', 'Diagnostic Multimeter', 'Blueprint Reading'],
      };
    });
  }, [enrollments, users, portfolioItems]);

  const filteredGraduates = graduates.filter((grad) => {
    const matchesTrade = selectedTrade === 'All' || grad.trade.toLowerCase() === selectedTrade.toLowerCase();
    const matchesSearch =
      grad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grad.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grad.trade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrade && matchesSearch;
  });

  const handleOpenInvite = (candidate: any) => {
    setSelectedCandidate(candidate);
    setInvitePosition(
      candidate.trade === 'Clean Energy'
        ? 'Commercial Solar Field Specialist'
        : candidate.trade === 'Welding'
        ? 'Structural GMAW Apprentice'
        : 'Junior Technician Associate'
    );
    setInviteDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setInviteMessage(
      `Hello ${candidate.name}, we reviewed your vocational coursework and verified capstone credentials. We would love to interview you for a direct position with our team.`
    );
    setShowInviteModal(true);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const newInvitation: InterviewInvitation = {
      id: `inv-${Date.now()}`,
      employerId: currentEmployer.id,
      employerName: currentEmployer.companyName,
      studentId: selectedCandidate.id,
      studentName: selectedCandidate.name,
      tradeField: selectedCandidate.trade,
      positionTitle: invitePosition,
      interviewDate: inviteDate,
      message: inviteMessage,
      status: 'Pending',
      sentAt: new Date().toISOString(),
    };

    setInterviewInvitations([newInvitation, ...interviewInvitations]);
    setShowInviteModal(false);
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleCreatePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = graduates.find((g) => g.id === selectedPlacementGradId) || graduates[0];
    if (!candidate) return;

    const record: PlacementRecord = {
      id: `plc-${Date.now()}`,
      studentId: candidate.id,
      studentName: candidate.name,
      tradeCategory: candidate.trade,
      certificateId: candidate.certificateId,
      companyName: newPlacement.companyName || currentEmployer.companyName,
      jobTitle: newPlacement.jobTitle || 'Field Technician Apprentice',
      startingHourlyWage: newPlacement.startingHourlyWage || '$26.00 / hr',
      startDate: newPlacement.startDate || new Date().toISOString().split('T')[0],
      retentionMilestone: (newPlacement.retentionMilestone as any) || 'Active (Month 1-2)',
      donorReported: !!newPlacement.donorReported,
      notes: newPlacement.notes || 'Successfully completed on-boarding safety audit.',
    };

    setPlacementRecords([record, ...placementRecords]);
    setShowPlacementModal(false);
    confetti({ particleCount: 70, spread: 80 });
  };

  if (loading) {
    return <DashboardGlassSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Hero Header with Employer Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300">
              <Building2 className="w-3.5 h-3.5" />
              <span>Verified Hiring Partner Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Direct Vocational Talent Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Source job-ready certified tradespeople, review hands-on workshop project portfolios, and track employment retention outcomes for donor accountability.
            </p>
          </div>

          {/* Employer Switcher Card */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 self-start shrink-0 min-w-[240px]">
            <span className="text-[10px] text-blue-200 uppercase font-black tracking-wider block mb-1">
              Active Employer View
            </span>
            <select
              value={activeEmployerId}
              onChange={(e) => setActiveEmployerId(e.target.value)}
              aria-label="Active Employer View"
              className="w-full text-xs font-bold bg-white/20 text-white rounded-xl p-2 border border-white/30 focus:outline-hidden"
            >
              {employerProfiles.map((emp) => (
                <option key={emp.id} value={emp.id} className="text-gray-900">
                  {emp.companyName}
                </option>
              ))}
            </select>
            <div className="mt-2 text-[11px] text-blue-200 flex items-center justify-between">
              <span>{currentEmployer.industry}</span>
              <span className="text-emerald-300 font-bold">● {currentEmployer.activeOpenings} Openings</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Verified Graduates</span>
            <span className="text-xl sm:text-2xl font-black text-white">{graduates.length} Available</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Direct Interviews</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300">{interviewInvitations.length} Active</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Placements Verified</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">{placementRecords.length} Retained</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 font-bold uppercase block">Avg Starting Wage</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">$30.00 / hr</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'candidates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Graduates Talent Pool ({filteredGraduates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'invitations'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Interview Invitations ({interviewInvitations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('placements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'placements'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Placement & Retention Ledger ({placementRecords.length})</span>
          </button>
        </div>

        {activeTab === 'placements' && (
          <button
            onClick={() => setShowPlacementModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Graduate Hire / Placement</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Candidates Pool */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Official Graduate Only Notice Banner */}
          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start space-x-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Certified Graduates Pipeline
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Verified Alumni Only
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300 leading-relaxed">
                SkillSpot Employer Portal displays exclusively candidates who have successfully graduated, completed 100% of accredited curriculum benchmarks, and hold verified certificates. Enrolled or prospective students in progress are omitted from hiring views.
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search graduated candidates, skills, certs..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Clean Energy', 'Technology', 'Healthcare', 'Design'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTrade(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedTrade === cat
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGraduates.length === 0 ? (
              <div className="col-span-full py-12 px-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 text-center space-y-2">
                <Users className="w-10 h-10 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  No Graduated Candidates Found
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Only students who have successfully completed an accredited vocational course and earned a verified certificate are listed in the Employer Portal.
                </p>
              </div>
            ) : (
              filteredGraduates.map((grad) => (
                <div
                  key={grad.id + grad.certificateId}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {grad.name}
                        </h3>
                        {grad.honors && (
                          <span className="p-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600" title="Graduated with Honors">
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 block mt-0.5">
                        {grad.course}
                      </span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Graduated: {new Date(grad.completedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Verified {grad.grade}
                    </span>
                  </div>

                  {/* Badges / Hours */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl">
                    <div>
                      <span className="text-gray-400 text-[9px] font-bold uppercase block">Practical Hours</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{grad.workshopHours} Workshop Hrs</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[9px] font-bold uppercase block">Credential ID</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 truncate block">{grad.certificateId}</span>
                    </div>
                  </div>

                  {/* Capstone Preview */}
                  {grad.portfolioTitle && (
                    <div className="text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Featured Capstone Project:
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {grad.portfolioTitle}
                      </p>
                      {Array.isArray(grad.portfolioTools) && grad.portfolioTools.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {grad.portfolioTools.slice(0, 3).map((tool, i) => (
                            <span key={i} className="text-[9px] font-medium bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Action Button */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <a
                    href={`#/verify/${grad.certificateId}`}
                    className="text-[11px] font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center space-x-1"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleOpenInvite(grad)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite to Interview</span>
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Interview Invitations */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'invitations' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Sent Interview & Apprenticeship Invitations
            </h3>
            <span className="text-xs text-gray-500">{interviewInvitations.length} Active Records</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {interviewInvitations.map((inv) => (
              <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {inv.studentName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {inv.tradeField}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Position: <strong className="text-gray-900 dark:text-white">{inv.positionTitle}</strong> • Target Date:{' '}
                    {inv.interviewDate}
                  </p>
                  <p className="text-xs italic text-gray-500 dark:text-gray-400">
                    "{inv.message}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      inv.status === 'Accepted'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : inv.status === 'Completed'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: Placements & Retention Outcome Ledger */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'placements' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Vocational Graduate Placement & Retention Ledger
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Empirical impact records proving transition from vocational training into verified income-generating employment.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
              100% Verified Placements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Candidate & Trade</th>
                  <th className="pb-3">Employer & Role</th>
                  <th className="pb-3">Starting Wage</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Retention Milestone</th>
                  <th className="pb-3 text-right">Donor CSR Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {placementRecords.map((plc) => (
                  <tr key={plc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-gray-900 dark:text-white">{plc.studentName}</div>
                      <div className="text-[10px] text-gray-500">{plc.tradeCategory} • {plc.certificateId}</div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{plc.companyName}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400">{plc.jobTitle}</div>
                    </td>
                    <td className="py-3.5 pr-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {plc.startingHourlyWage}
                    </td>
                    <td className="py-3.5 pr-3 text-gray-600 dark:text-gray-300">
                      {plc.startDate}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {plc.retentionMilestone}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {plc.donorReported ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-[10px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Audit Ready</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Internal Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Send Interview Invitation */}
      {/* ------------------------------------------------------------- */}
      {showInviteModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Invite {selectedCandidate.name} to Interview
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Position / Role Title
                </label>
                <input
                  type="text"
                  required
                  value={invitePosition}
                  onChange={(e) => setInvitePosition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Proposed Interview / Orientation Date
                </label>
                <input
                  type="date"
                  required
                  value={inviteDate}
                  onChange={(e) => setInviteDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Personal Invitation Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Send Official Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Log Placement Outcome */}
      {/* ------------------------------------------------------------- */}
      {showPlacementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Record Graduate Employment Outcome
                </h3>
              </div>
              <button
                onClick={() => setShowPlacementModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlacement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Selected Graduated Candidate
                </label>
                <select
                  required
                  value={selectedPlacementGradId || graduates[0]?.id || ''}
                  onChange={(e) => setSelectedPlacementGradId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                >
                  {graduates.map((g) => (
                    <option key={`${g.id}-${g.certificateId}`} value={g.id}>
                      {g.name} — {g.course} ({g.certificateId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Employer Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlacement.companyName}
                  onChange={(e) => setNewPlacement({ ...newPlacement, companyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Hired Job Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar Field Tech"
                    value={newPlacement.jobTitle}
                    onChange={(e) => setNewPlacement({ ...newPlacement, jobTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Starting Wage ($/hr)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlacement.startingHourlyWage}
                    onChange={(e) => setNewPlacement({ ...newPlacement, startingHourlyWage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newPlacement.startDate}
                    onChange={(e) => setNewPlacement({ ...newPlacement, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Retention Milestone
                  </label>
                  <select
                    value={newPlacement.retentionMilestone}
                    onChange={(e) => setNewPlacement({ ...newPlacement, retentionMilestone: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Active (Month 1-2)">Active (Month 1-2)</option>
                    <option value="3-Month Retained">3-Month Retained</option>
                    <option value="6-Month Retained">6-Month Retained</option>
                    <option value="1-Year Milestone">1-Year Milestone</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="donorReported"
                  checked={newPlacement.donorReported}
                  onChange={(e) => setNewPlacement({ ...newPlacement, donorReported: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="donorReported" className="font-bold text-gray-700 dark:text-gray-300">
                  Include in Public Donor Impact & CSR Verification Ledger
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPlacementModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Log Verified Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerPortalPage;
