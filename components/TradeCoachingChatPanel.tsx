import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Wrench,
  Loader2,
} from 'lucide-react';
import { CoachingChatMessage, MockInterviewQuestion } from '../types';
import { GoogleGenAI } from '@google/genai';

interface TradeCoachingChatPanelProps {
  scenario: MockInterviewQuestion;
  coachPersona: 'dave' | 'sarah' | 'marcus';
  conversation: CoachingChatMessage[];
  onSendMessage: (text: string) => void;
  isEvaluating?: boolean;
}

export const TradeCoachingChatPanel: React.FC<TradeCoachingChatPanelProps> = ({
  scenario,
  coachPersona,
  conversation,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isCoachThinking]);

  // Handle SpeechSynthesis audio for coach message
  const handlePlayAudio = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (playingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (coachPersona === 'dave') {
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
    } else if (coachPersona === 'sarah') {
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
    } else {
      utterance.rate = 1.05;
      utterance.pitch = 0.85;
    }

    utterance.onstart = () => setPlayingMessageId(msgId);
    utterance.onend = () => setPlayingMessageId(null);
    utterance.onerror = () => setPlayingMessageId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    setInputText('');
    onSendMessage(clean);
  };

  const quickPrompts = [
    {
      label: 'Explain LOTO protocol',
      text: 'How should I explain Lockout/Tagout (LOTO) step-by-step for this scenario?',
      icon: ShieldCheck,
    },
    {
      label: 'Recommended diagnostic tools',
      text: 'What diagnostic meters or instruments would a master journeyman use here?',
      icon: Wrench,
    },
    {
      label: 'Simulate follow-up question',
      text: 'Ask me a tough job-site follow-up question about safety or code standards.',
      icon: HelpCircle,
    },
  ];

  const personaDetails = {
    dave: {
      name: 'Dave Henderson',
      role: 'Master Journeyman Mentor',
      accent: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
      badge: 'Practical & Diagnostic',
    },
    sarah: {
      name: 'Sarah Chen',
      role: 'OSHA & Code Compliance Examiner',
      accent: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      badge: 'Code Standards & Safety',
    },
    marcus: {
      name: 'Marcus Vance',
      role: 'Union General Foreman',
      accent: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
      badge: 'Job-Site Pace & Precision',
    },
  }[coachPersona];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-5 shadow-xs flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {personaDetails.name}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                {personaDetails.badge}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              1-on-1 Vocational Coaching • {scenario.tradeCategory}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Session Saved
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {conversation.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                isCoach ? 'justify-start' : 'justify-end'
              }`}
            >
              {isCoach && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {coachPersona[0].toUpperCase()}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-1 ${
                  isCoach
                    ? 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 rounded-tl-xs'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold opacity-75">
                    {isCoach ? personaDetails.name : 'You'}
                  </span>
                  <span className="text-[9px] opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {isCoach && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.text)}
                      className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center space-x-1"
                      title="Read aloud"
                    >
                      {playingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span className="text-rose-500 font-bold">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {!isCoach && (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isCoachThinking && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>{personaDetails.name} is formulating vocational feedback...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5 border-t border-gray-100 dark:border-gray-700/60">
        {quickPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => onSendMessage(p.text)}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 transition-colors"
            >
              <Icon className="w-3 h-3 text-blue-500" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask ${personaDetails.name} a question about this scenario...`}
          className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
