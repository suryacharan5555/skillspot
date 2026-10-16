import React from 'react';
import {
  X,
  History,
  Play,
  Trash2,
  Calendar,
  Clock,
  Award,
  MessageSquare,
  Sparkles,
  PlusCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { TrainingSession } from '../types';

interface TrainingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TrainingSession[];
  activeSessionId: string;
  onResumeSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartNewSession: () => void;
}

export const TrainingSessionModal: React.FC<TrainingSessionModalProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onResumeSession,
  onDeleteSession,
  onStartNewSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[85vh] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Saved Training Sessions & Resume Hub
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick up where you left off or review past AI evaluations and coach dialogues.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onStartNewSession();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Session</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center text-gray-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                No Saved Sessions Yet
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Practice answering an interview question or chat with an AI trade coach. Your
                answers, timers, and evaluations are automatically preserved!
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              const hasEvaluation = !!sess.evaluation;
              const score = sess.evaluation?.score;

              return (
                <div
                  key={sess.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {sess.tradeCategory}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-bold text-gray-500">
                          Coach:{' '}
                          {sess.coachPersona === 'dave'
                            ? 'Dave'
                            : sess.coachPersona === 'sarah'
                            ? 'Sarah'
                            : 'Marcus'}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Currently Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {sess.scenarioTitle}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {hasEvaluation ? (
                        <div className="text-right">
                          <span
                            className={`text-sm font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                              score! >= 80
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>{score}/100</span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Draft In-Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Answer snippet */}
                  {sess.userAnswer && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 my-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Answer: </span>
                      "{sess.userAnswer}"
                    </p>
                  )}

                  {/* Footer metadata & buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(sess.updatedAt).toLocaleDateString()} at {new Date(sess.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {sess.conversation && sess.conversation.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          <span>{sess.conversation.length} coaching replies</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onDeleteSession(sess.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onResumeSession(sess);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center space-x-1 transition-all shadow-xs"
                      >
                        <span>Resume</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Auto-saving actively synchronizes session data to local cache and Supabase</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
