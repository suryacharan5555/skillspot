import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../data/DataContext';
import {
  processLocalQuery,
  buildDynamicPromptContext,
  BotActionCard,
  BotResponse,
} from '../utils/chatbotEngine';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  Building2,
  BookOpen,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Zap,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkle,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actionCards?: BotActionCard[];
  suggestions?: string[];
  timestamp: string;
  source?: 'gemini' | 'local';
}

export const Chatbot: React.FC = () => {
  const { ngos, jobs } = useData();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'gemini' | 'local'>('local');

  const aiClientRef = useRef<GoogleGenAI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalCourses = useMemo(() => {
    return ngos.reduce((acc, n) => acc + (n.courses ? n.courses.length : 0), 0);
  }, [ngos]);

  // Check for Gemini API key on mount
  useEffect(() => {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (key && key.trim() !== '' && key !== 'undefined') {
      try {
        aiClientRef.current = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        setActiveMode('gemini');
      } catch (err) {
        console.warn('Gemini initialization fallback to local smart engine', err);
        setActiveMode('local');
      }
    } else {
      setActiveMode('local');
    }
  }, []);

  // Initial greeting message when opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `👋 **Welcome to the SkillSpot 2.0 AI Navigator!**\n\nI am dynamically updated with live data from **${ngos.length} partner NGOs** and **${totalCourses} accredited vocational courses**.\n\nAsk me anything about training programs, free scholarships, seats available, partner NGOs, or job opportunities!`,
          suggestions: [
            'Explore all courses',
            'Which courses are free?',
            'Show all partner NGOs',
            'Courses with open seats',
            'Hiring job opportunities',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'local',
        },
      ]);
    }
  }, [ngos.length, totalCourses, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || userInput).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setUserInput('');
    setIsLoading(true);

    // Try Gemini API if client initialized, else fall back to intelligent dynamic local engine
    let answered = false;

    if (aiClientRef.current) {
      try {
        const dynamicContext = buildDynamicPromptContext(ngos, jobs);

        // Build recent dialog context as plain text so the model has conversational continuity without complex REST schema pitfalls
        const recentDialogue = messages
          .slice(-6)
          .map((m) => {
            const roleLabel = m.sender === 'user' ? 'Student/User' : 'SkillSpot AI';
            return `${roleLabel}: ${m.text}`;
          })
          .join('\n\n');

        const fullPrompt = `${dynamicContext}

---
RECENT CONVERSATION HISTORY:
${recentDialogue || '(This is the beginning of the conversation)'}

CURRENT USER QUESTION:
${query}

INSTRUCTIONS FOR YOUR ANSWER:
1. Provide a direct, factually accurate, structured, and helpful response based strictly on the live SkillSpot database above.
2. If the user asks about courses, partner NGOs, admission criteria, open seats, trainers, or certifications, cite the exact names and details from the database.
3. Emphasize that all programs are 100% tuition-free / grant-sponsored.
4. Format with clean markdown headers and bullet points.`;

        let responseText = '';
        const candidateModels = [
          'gemini-2.5-flash',
          'gemini-3.8-flash',
          'gemini-flash-latest',
          'gemini-2.5-flash-lite',
        ];

        for (const modelName of candidateModels) {
          try {
            const result = await aiClientRef.current.models.generateContent({
              model: modelName,
              contents: fullPrompt,
            });
            if (result && result.text && result.text.trim().length > 0) {
              responseText = result.text.trim();
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} call failed, trying next candidate:`, modelErr);
          }
        }

        if (responseText) {
          // Extract local matched action cards and suggestions for rich interactive rendering
          const localSupplement = processLocalQuery(query, ngos, jobs);

          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-ai`,
              sender: 'ai',
              text: responseText,
              actionCards: localSupplement.actionCards,
              suggestions: localSupplement.suggestions,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'gemini',
            },
          ]);
          answered = true;
        }
      } catch (geminiError) {
        console.warn('Gemini API call encountered error, falling back to local engine:', geminiError);
        // Fall back gracefully to local engine
      }
    }

    if (!answered) {
      // Local Smart Dynamic Knowledge Engine (Always free, instant, and reliable)
      setTimeout(() => {
        const localResponse = processLocalQuery(query, ngos, jobs);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            sender: 'ai',
            text: localResponse.text,
            actionCards: localResponse.actionCards,
            suggestions: localResponse.suggestions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'local',
          },
        ]);
        setIsLoading(false);
      }, 350);
      return;
    }

    setIsLoading(false);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `✨ Chat conversation reset. I am live with **${ngos.length} NGOs** and **${totalCourses} vocational courses**.\n\nHow can I help you today?`,
        suggestions: [
          'Explore all courses',
          'Which courses are free?',
          'Show all partner NGOs',
          'Courses with open seats',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local',
      },
    ]);
  };

  const handleNavigateCard = (link?: string) => {
    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  // Helper to render bold text and bullet points cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold tokens (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-gray-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-1 text-gray-700 dark:text-gray-200">
                <span className="text-blue-500 font-bold shrink-0">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-gray-700 dark:text-gray-200">
              {formattedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label="Toggle SkillSpot AI Navigator"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
          )}
        </div>
      </button>

      {/* Main Structured Chatbot Window */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] md:w-[450px] h-[580px] max-h-[82vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col z-50 overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        }`}
      >
        {/* Header with Live Sync Status */}
        <header className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-cyan-200" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-indigo-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-black text-sm tracking-tight text-white">
                  SkillSpot Navigator
                </h3>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-bold text-cyan-100">
                  {activeMode === 'gemini' ? 'Gemini AI' : 'Smart Engine'}
                </span>
              </div>
              <p className="text-[10px] text-blue-100 font-medium flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                <span>Live Sync • {ngos.length} NGOs & {totalCourses} Courses</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleResetChat}
              title="Reset Conversation"
              className="p-1.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close Navigator"
              className="p-1.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Quick Topic Chips Bar */}
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => handleSendMessage('Show all partner NGOs')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <Building2 className="w-3 h-3 text-blue-500" />
            <span>NGOs</span>
          </button>

          <button
            onClick={() => handleSendMessage('Available courses')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <BookOpen className="w-3 h-3 text-emerald-500" />
            <span>Courses</span>
          </button>

          <button
            onClick={() => handleSendMessage('Courses with open seats')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Open Seats</span>
          </button>

          <button
            onClick={() => handleSendMessage('Hiring job opportunities')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <Briefcase className="w-3 h-3 text-purple-500" />
            <span>Jobs</span>
          </button>

          <button
            onClick={() => handleSendMessage('How do I manage my profile and cover page?')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <UserIcon className="w-3 h-3 text-rose-500" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => handleSendMessage('How do I apply and enroll?')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold border border-gray-200 dark:border-gray-600 hover:border-blue-500 flex items-center space-x-1 shrink-0 transition-all hover:bg-blue-50 dark:hover:bg-gray-600"
          >
            <HelpCircle className="w-3 h-3 text-rose-500" />
            <span>How to Apply</span>
          </button>
        </div>

        {/* Message Thread Body */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-gray-400">
                <span className="font-semibold">
                  {msg.sender === 'user' ? 'You' : 'SkillSpot Assistant'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] p-4 rounded-2xl shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                ) : (
                  <div className="space-y-3">
                    {renderFormattedText(msg.text)}

                    {/* Rich Interactive Action Cards */}
                    {msg.actionCards && msg.actionCards.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/80">
                        {msg.actionCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => handleNavigateCard(card.link)}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200/80 dark:border-gray-600/60 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-xs group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                  {card.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                  {card.subtitle}
                                </p>
                              </div>

                              {card.badge && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                                    card.badgeColor === 'emerald'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                      : card.badgeColor === 'amber'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                      : card.badgeColor === 'purple'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                  }`}
                                >
                                  {card.badge}
                                </span>
                              )}
                            </div>

                            {card.details && card.details.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                                {card.details.map((d, dIdx) => (
                                  <span key={dIdx}>• {d}</span>
                                ))}
                              </div>
                            )}

                            <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-600/40 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                              <span>Open Program & Details</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Suggestions Buttons */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-[10.5px] font-medium shadow-2xs transition-all hover:scale-102"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-xs flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <span className="text-[11px] text-gray-400 font-medium pl-1">Consulting live vocational directory...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Footer & Chat Input */}
        <footer className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about NGOs, courses, fees, jobs, or seats..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 placeholder-gray-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Send Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 px-1">
            <span>Powered by live database index</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
              100% Active & Free
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Chatbot;
