import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import {
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  QrCode,
  Printer,
  Share2,
  Clock,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const VerifyCertificatePage: React.FC = () => {
  const { certificateId: paramCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();
  const { enrollments, ngos } = useData();

  const [inputCertId, setInputCertId] = useState(paramCertId || '');
  const [activeCertId, setActiveCertId] = useState(paramCertId || '');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (paramCertId) {
      setInputCertId(paramCertId);
      setActiveCertId(paramCertId);
    }
  }, [paramCertId]);

  // Find enrollment with this certificateId
  const verifiedRecord = useMemo(() => {
    if (!activeCertId) return null;
    const cleanId = activeCertId.trim().toUpperCase();
    const found = enrollments.find(
      (e) => e.certificateId && e.certificateId.toUpperCase() === cleanId && e.status === 'Completed'
    );
    if (!found) return null;

    const ngo = ngos.find((n) => n.id === found.ngoId);
    const course = ngo?.courses?.find((c) => c?.id === found.courseId || c?.name === found.courseName);

    return {
      enrollment: found,
      ngo,
      course,
    };
  }, [activeCertId, enrollments, ngos]);

  // Sample certificates for quick demonstration
  const sampleCerts = useMemo(() => {
    return (enrollments || [])
      .filter((e) => e.status === 'Completed' && e.certificateId)
      .slice(0, 3);
  }, [enrollments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCertId.trim()) {
      setActiveCertId(inputCertId.trim());
      navigate(`/verify/${inputCertId.trim()}`);
    }
  };

  const handleCopyVerificationUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Verification Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Employer Credential Verification Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Verify Vocational Credentials Instantly
          </h1>
          <p className="text-sm text-indigo-200/80 leading-relaxed">
            Employers, recruiting partners, and licensing bodies can enter or scan any SkillSpot certificate ID
            to confirm verified course completion, accredited training hours, and issuing partner integrity.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g. CERT-INNO-2025-1049)"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-blue-400/40 focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify ID</span>
            </button>
          </form>

          {/* Sample quick buttons */}
          {sampleCerts.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-indigo-200">
              <span className="text-[11px] text-indigo-300 font-semibold">Try sample IDs:</span>
              {sampleCerts.map((cert) => (
                <button
                  key={cert.certificateId}
                  onClick={() => {
                    setInputCertId(cert.certificateId || '');
                    setActiveCertId(cert.certificateId || '');
                    navigate(`/verify/${cert.certificateId}`);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-mono text-indigo-100 transition-colors border border-white/10"
                >
                  {cert.certificateId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verification Result Section */}
      {activeCertId && (
        <div>
          {verifiedRecord ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-xl space-y-8 print:border-none print:shadow-none">
              
              {/* Authenticity Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                      Official Verified Credential
                    </h2>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                      Cryptographically Validated on SkillSpot Multi-Tenant Ledger
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyVerificationUrl}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 flex items-center space-x-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Proof'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center space-x-1 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>

              {/* Certificate Details Visual Card */}
              <div className="border-4 border-double border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-8 sm:p-12 relative bg-gradient-to-b from-slate-50/50 to-white dark:from-gray-800/80 dark:to-gray-800 text-center space-y-6">
                
                {/* Organization Header */}
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{verifiedRecord.ngo?.name || 'Accredited SkillSpot Partner'}</span>
                  </div>
                  <h3 className="text-xs text-gray-400 uppercase tracking-widest pt-2">Certificate of Vocational Competence</h3>
                </div>

                {/* Recipient */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">This officially certifies that</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    {verifiedRecord.enrollment.studentName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    has successfully completed all rigorous theoretical benchmarks, hands-on workshop hours,
                    and capstone milestone deliverables for
                  </p>
                </div>

                {/* Course Name */}
                <div className="py-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {verifiedRecord.enrollment.courseName}
                  </h3>
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {verifiedRecord.course?.category || 'Vocational Trade'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {verifiedRecord.enrollment.gradeScore || 'Certified with Honors'}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-left">
                  <div className="p-3 bg-white dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Credential ID</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {verifiedRecord.enrollment.certificateId}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Completion Date</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(verifiedRecord.enrollment.completedDate || verifiedRecord.enrollment.requestDate).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Accredited Instructor</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {verifiedRecord.course?.trainer || 'Certified Master Trainer'}
                    </span>
                  </div>
                </div>

                {/* Modules Covered */}
                {verifiedRecord.course?.modules && verifiedRecord.course.modules.length > 0 && (
                  <div className="pt-4 text-left">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-2">
                      Verified Curriculum Modules Delivered:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {verifiedRecord.course.modules.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 flex items-start space-x-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-800 dark:text-gray-200 block">
                              Week {m.weekNumber}: {m.title}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {Array.isArray(m.topics) ? m.topics.slice(0, 3).join(' • ') : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 border border-rose-200 dark:border-rose-900/60 shadow-md text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Certificate ID Not Found
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No active verified credential matches &quot;<span className="font-mono font-bold text-rose-500">{activeCertId}</span>&quot;.
                Please double check the ID format or request the candidate to resend their verified SkillSpot link.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificatePage;
