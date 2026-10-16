import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { MockInterviewQuestion, MockInterviewEvaluation, VocationalResumeData, TrainingSession, CoachingChatMessage } from '../types';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Clock,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Zap,
  Filter,
  Search,
  PlusCircle,
  Timer,
  Play,
  Square,
  Star,
  Check,
  Download,
  History,
  Save,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from '@google/genai';
import { AiEvaluationGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import {
  getLocalTrainingSessions,
  saveTrainingSession,
  deleteTrainingSession,
  createNewTrainingSession,
} from '../services/trainingSessionService';
import { TradeCoachingChatPanel } from '../components/TradeCoachingChatPanel';
import { TrainingSessionModal } from '../components/TrainingSessionModal';

export const CareerCoachPage: React.FC = () => {
  const { user } = useAuth();
  const { mockQuestions: initialMockQuestions, enrollments, portfolioItems, ngos } = useData();

  const [activeTab, setActiveTab] = useState<'interview' | 'resume'>('interview');

  // Dynamic list of scenarios (includes user-generated custom scenarios)
  const [questionsList, setQuestionsList] = useState<MockInterviewQuestion[]>(initialMockQuestions);

  // -------------------------------------------------------------
  // Session Persistence State & Saved Sessions
  // -------------------------------------------------------------
  const [savedSessions, setSavedSessions] = useState<TrainingSession[]>(() =>
    getLocalTrainingSessions()
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const existing = getLocalTrainingSessions();
    return existing[0]?.id || `session-${Date.now()}`;
  });
  const [coachingChat, setCoachingChat] = useState<CoachingChatMessage[]>(() => {
    const existing = getLocalTrainingSessions();
    return existing[0]?.conversation || [];
  });
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState<boolean>(false);
  const [sessionSaveState, setSessionSaveState] = useState<'saved' | 'saving'>('saved');
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [isCoachDialogueOpen, setIsCoachDialogueOpen] = useState<boolean>(true);

  // -------------------------------------------------------------
  // Mock Interview State & Filters
  // -------------------------------------------------------------
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    initialMockQuestions[0]?.id || 'mock-1'
  );
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<MockInterviewEvaluation | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Advanced Coach Features
  const [coachPersona, setCoachPersona] = useState<'dave' | 'sarah' | 'marcus'>('dave');
  const [isStarAssistantOpen, setIsStarAssistantOpen] = useState<boolean>(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isEvaluationSpeaking, setIsEvaluationSpeaking] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [customTradeInput, setCustomTradeInput] = useState<string>('');
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);

  // Live Safety & Compliance Keyword Tracker (updates live as student writes)
  const liveSafetyChecklist = useMemo(() => {
    const text = userAnswer.toLowerCase();
    return {
      ppe: /ppe|glove|glasses|shield|boot|earplugs|respirator|arc flash|helmet/i.test(text),
      loto: /loto|lockout|tagout|disconnect|isolate|breaker|switch|de-energiz|padlock/i.test(text),
      meter: /meter|multimeter|cat-iv|cat-iii|gauge|oscilloscope|voltmeter|ammeter|manometer|three-point|live-dead-live|reading/i.test(text),
      code: /osha|nec|nfpa|aws|epa|code|standard|tolerance|spec|ansi|tuv|article/i.test(text),
      verify: /verify|verif|test|sign-off|log|document|inspect|checklist|clearance|check/i.test(text),
    };
  }, [userAnswer]);

  const TRADE_CHEAT_SHEET_ITEMS = [
    { label: 'OSHA 1910.147 (LOTO)', snippet: 'Mandatory OSHA 1910.147 energy control (Lockout/Tagout) with primary padlocked hasp' },
    { label: 'NFPA 70E Arc Flash', snippet: 'NFPA 70E standard for electrical safety in the workplace with CAT-IV rated protective boundaries' },
    { label: 'Three-Point Meter Test', snippet: 'Three-point meter test protocol (Live-Dead-Live) using a calibrated CAT-IV digital multimeter' },
    { label: 'NEC Article 690', snippet: 'National Electrical Code (NEC Article 690) rapid shutdown and DC ground-fault detection specifications' },
    { label: 'EPA Section 608', snippet: 'EPA Section 608 certified refrigerant recovery, vacuum decay testing down to 500 microns' },
    { label: 'AWS D1.1 Welding Code', snippet: 'AWS D1.1 structural welding code specifications with multi-pass preheat and non-destructive testing' },
  ];

  // Interview Pressure Timer State
  const [timerDuration, setTimerDuration] = useState<number>(120); // 120 seconds default
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const handleSpeakEvaluation = () => {
    if (!evaluation || !('speechSynthesis' in window)) return;
    if (isEvaluationSpeaking) {
      window.speechSynthesis.cancel();
      setIsEvaluationSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const personaPrefix =
      coachPersona === 'dave'
        ? 'Hey, Dave here with your score review: '
        : coachPersona === 'sarah'
        ? 'Official OSHA Examiner Evaluation Report: '
        : 'Foreman Marcus grading your shift scenario: ';
    const textToSpeak = `${personaPrefix}Overall verdict: ${evaluation.overallVerdict}. Technical score: ${evaluation.technicalPrecisionScore} percent. Safety and compliance: ${evaluation.safetyComplianceScore} percent. Key coaching tip: ${evaluation.improvementTips[0] || 'Keep adhering to strict trade standards.'}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
    utterance.onstart = () => setIsEvaluationSpeaking(true);
    utterance.onend = () => setIsEvaluationSpeaking(false);
    utterance.onerror = () => setIsEvaluationSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Ensure questionsList tracks initialMockQuestions if they load later
  useEffect(() => {
    if (initialMockQuestions.length > 0 && questionsList.length <= initialMockQuestions.length) {
      setQuestionsList((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        const merged = [...prev];
        initialMockQuestions.forEach((q) => {
          if (!existingIds.has(q.id)) {
            merged.push(q);
          }
        });
        return merged;
      });
    }
  }, [initialMockQuestions]);

  const activeQuestion = useMemo(() => {
    return questionsList.find((q) => q.id === selectedQuestionId) || questionsList[0];
  }, [questionsList, selectedQuestionId]);

  // Unique trade categories for filtering
  const allCategories = useMemo(() => {
    const cats = new Set(questionsList.map((q) => q.tradeCategory));
    return ['All', ...Array.from(cats)];
  }, [questionsList]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questionsList.filter((q) => {
      const matchCat = categoryFilter === 'All' || q.tradeCategory === categoryFilter;
      const matchDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      const matchSearch =
        !searchFilter.trim() ||
        q.scenarioTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
        q.tradeCategory.toLowerCase().includes(searchFilter.toLowerCase()) ||
        q.question.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchDiff && matchSearch;
    });
  }, [questionsList, categoryFilter, difficultyFilter, searchFilter]);

  // Timer Countdown Logic
  useEffect(() => {
    if (isTimerActive && secondsRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerActive, secondsRemaining]);

  const handleStartTimer = () => {
    setSecondsRemaining(timerDuration);
    setIsTimerActive(true);
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
    clearInterval(timerIntervalRef.current);
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setSecondsRemaining(timerDuration);
    clearInterval(timerIntervalRef.current);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      setSpeechError(
        'Speech recognition is not supported in this browser window. Please type your response.'
      );
      return;
    }
    setSpeechError(null);
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        if (!isTimerActive && secondsRemaining === timerDuration) {
          handleStartTimer();
        }
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Text to Speech with Persona customization
  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const personaPrefix =
      coachPersona === 'dave'
        ? "Hey there, Dave here. Let's walk through this field situation: "
        : coachPersona === 'sarah'
        ? 'Official OSHA and Safety Examination Question: '
        : "Foreman Marcus speaking. Here is today's job site scenario: ";

    const utterance = new SpeechSynthesisUtterance(personaPrefix + activeQuestion.question);

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

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Insert STAR scaffolding into answer
  const handleApplyStarTemplate = () => {
    const starTemplate = `[SITUATION]: Describe the job site condition, equipment type, and initial hazard.\n- \n\n[TASK]: What specific diagnostic check, code standard, or repair was required?\n- \n\n[ACTION]: Step-by-step procedure: mandatory PPE, LOTO isolation, diagnostic meters, and repair steps:\n- \n\n[RESULT]: Verified outcome: zero residual voltage, verified pressure/tolerances, customer sign-off:\n- `;
    setUserAnswer((prev) => (prev ? prev + '\n\n' + starTemplate : starTemplate));
    setIsStarAssistantOpen(false);
  };

  // Generate Custom AI Trade Scenario with Gemini
  const handleGenerateCustomScenario = async () => {
    if (!customTradeInput.trim()) return;
    setIsGeneratingScenario(true);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a master trade vocational curriculum director.
Generate a realistic, high-stakes trade interview scenario for the following trade specialization: "${customTradeInput.trim()}".

Respond with a single raw JSON object matching this structure (no markdown fences, just pure JSON):
{
  "id": "mock-custom-${Date.now()}",
  "tradeCategory": "${customTradeInput.trim()}",
  "scenarioTitle": "<Concise 4-7 word descriptive title of the technical challenge>",
  "difficulty": "Journeyman",
  "question": "<A detailed, practical 2-3 sentence interview question placing the candidate directly on a job site with a specific malfunction, inspection standard, or safety dilemma>",
  "context": "<1-2 sentence context on what hiring managers or inspectors are evaluating in this question>",
  "keySafetyPoints": [
    "<Key safety point 1 mentioning PPE, LOTO, code standard, or diagnostic tool>",
    "<Key safety point 2 mentioning tolerances, measurement standard, or procedure>",
    "<Key safety point 3 mentioning verification, testing, or documentation>"
  ],
  "sampleModelAnswer": "<A master journeyman level answer demonstrating step-by-step diagnostic sequence, exact tool references, code numbers, and verification>"
}`;

        let raw = '';
        const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
        for (const m of candidateModels) {
          try {
            const res = await ai.models.generateContent({
              model: m,
              contents: prompt,
            });
            if (res?.text) {
              raw = res.text;
              break;
            }
          } catch (_) {}
        }
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const generated = JSON.parse(cleaned);

        setQuestionsList((prev) => [generated, ...prev]);
        setSelectedQuestionId(generated.id);
        setIsGenerateModalOpen(false);
        setCustomTradeInput('');
        setIsGeneratingScenario(false);
        confetti({ particleCount: 40, spread: 60 });
        return;
      } catch (err) {
        console.warn('Custom scenario generation error:', err);
      }
    }

    // Heuristic Fallback Custom Scenario
    const fallbackScenario: MockInterviewQuestion = {
      id: `mock-custom-${Date.now()}`,
      tradeCategory: customTradeInput.trim(),
      scenarioTitle: `${customTradeInput.trim()} Diagnostic Inspection & Protocol`,
      difficulty: 'Journeyman',
      question: `You are dispatched to troubleshoot a critical fault in a commercial ${customTradeInput.trim()} installation where the control system indicates intermittent operational failure under peak load. How do you isolate the sub-assembly, verify safety boundaries, and confirm full recovery?`,
      context: `Vocational field interview evaluating diagnostic sequencing, LOTO procedures, and documentation for ${customTradeInput.trim()}.`,
      keySafetyPoints: [
        'Mandatory OSHA PPE inspection and primary power lock out / tag out',
        'Systematic component isolation using calibrated diagnostic instruments',
        'Verification of manufacturer operating tolerances and written sign-off',
      ],
      sampleModelAnswer: `First, I inspect the work area and verify that all personnel are clear before establishing a lock-out/tag-out boundary on the primary power feed. I inspect the schematic to identify the highest-probability failure point under thermal expansion. Using my calibrated digital diagnostic tools, I test each stage sequentially. Once the defective component is replaced to factory torque specifications, I perform a staged startup test, verify baseline telemetry, and log the incident in the site maintenance registry.`,
    };

    setQuestionsList((prev) => [fallbackScenario, ...prev]);
    setSelectedQuestionId(fallbackScenario.id);
    setIsGenerateModalOpen(false);
    setCustomTradeInput('');
    setIsGeneratingScenario(false);
  };

  // Evaluate Response
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    setEvaluation(null);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a certified master vocational trade instructor, OSHA safety examiner, and senior trade recruiter.
Evaluate this student's response to the following trade interview scenario:

TRADE CATEGORY: ${activeQuestion.tradeCategory}
SCENARIO: ${activeQuestion.scenarioTitle}
QUESTION: ${activeQuestion.question}
REQUIRED SAFETY/KEY POINTS: ${
          Array.isArray(activeQuestion?.keySafetyPoints)
            ? activeQuestion.keySafetyPoints.join(', ')
            : ''
        }

STUDENT'S ANSWER:
"${userAnswer}"

Please evaluate strictly and return a JSON object with this EXACT structure (no markdown fences, just pure JSON):
{
  "score": <number between 40 and 100>,
  "overallVerdict": "<Brief 1-2 sentence overall summary of candidate readiness>",
  "technicalPrecisionScore": <number between 40 and 100>,
  "safetyComplianceScore": <number between 40 and 100>,
  "communicationScore": <number between 40 and 100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvementTips": ["<actionable tip 1>", "<actionable tip 2>"],
  "modelAnswerAnalysis": "<Comparison of what the candidate answered versus what a senior journeyman would do>"
}`;

        let rawText = '';
        const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
        for (const m of candidateModels) {
          try {
            const res = await ai.models.generateContent({
              model: m,
              contents: prompt,
            });
            if (res?.text) {
              rawText = res.text;
              break;
            }
          } catch (_) {}
        }
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setEvaluation(parsed);
        if (parsed.score >= 80) {
          confetti({ particleCount: 60, spread: 70 });
        }
        setIsEvaluating(false);
        return;
      } catch (e) {
        console.warn('Gemini evaluation fallback engaged:', e);
      }
    }

    // Heuristic Vocational Evaluator Fallback
    setTimeout(() => {
      const lowerAnswer = userAnswer.toLowerCase();
      let matchedSafety = 0;
      activeQuestion.keySafetyPoints.forEach((point) => {
        const words = point.toLowerCase().split(' ');
        const matches = words.filter((w) => w.length > 3 && lowerAnswer.includes(w));
        if (matches.length >= 1) matchedSafety++;
      });

      const lengthScore = Math.min(25, Math.floor(userAnswer.split(' ').length / 3));
      const safetyRatio = matchedSafety / Math.max(1, activeQuestion.keySafetyPoints.length);
      const safetyScore = Math.min(100, Math.round(50 + safetyRatio * 50));
      const techScore = Math.min(
        100,
        Math.round(55 + lengthScore + (safetyRatio > 0.5 ? 20 : 5))
      );
      const commScore = Math.min(100, Math.round(60 + (userAnswer.length > 100 ? 30 : 15)));
      const overall = Math.round((techScore + safetyScore + commScore) / 3);

      const strengths: string[] = [];
      const tips: string[] = [];

      if (safetyScore >= 75) {
        strengths.push('Demonstrated solid OSHA safety awareness and protective equipment protocols.');
      } else {
        tips.push(
          `Explicitly mention primary PPE and Lockout/Tagout (LOTO) procedures: ${
            activeQuestion.keySafetyPoints[0] || 'Verify zero energy'
          }.`
        );
      }

      if (userAnswer.length > 120) {
        strengths.push('Structured response logically, following step-by-step diagnostic sequence.');
      } else {
        tips.push('Expand your explanation to specify diagnostic tools, measurements, or tolerance limits.');
      }

      tips.push(
        `Review key workshop code: AWS / NFPA / National Building standards relevant to ${activeQuestion.tradeCategory}.`
      );

      setEvaluation({
        score: overall,
        overallVerdict:
          overall >= 80
            ? 'Strong, work-ready response demonstrating disciplined technical understanding and workshop safety compliance.'
            : 'Good fundamental understanding. Adding specific diagnostic instrument readings and OSHA protocols will elevate your interview score.',
        technicalPrecisionScore: techScore,
        safetyComplianceScore: safetyScore,
        communicationScore: commScore,
        strengths,
        improvementTips: tips,
        modelAnswerAnalysis:
          'Your answer addressed practical aspects of the scenario. Compare with the model answer to integrate specific measurement tolerances and standards.',
      });

      if (overall >= 80) {
        confetti({ particleCount: 60, spread: 70 });
      }
      setIsEvaluating(false);
    }, 900);
  };

  // -------------------------------------------------------------
  // Auto-Save & Session Persistence Integration
  // -------------------------------------------------------------
  useEffect(() => {
    if (!activeQuestion) return;
    setSessionSaveState('saving');
    const timer = setTimeout(async () => {
      const currentSession: TrainingSession = {
        id: activeSessionId,
        userId: user?.id,
        scenarioId: selectedQuestionId,
        scenarioTitle: activeQuestion.scenarioTitle,
        tradeCategory: activeQuestion.tradeCategory,
        difficulty: activeQuestion.difficulty,
        userAnswer,
        coachPersona,
        secondsRemaining,
        timerDuration,
        evaluation,
        status: evaluation ? 'evaluated' : userAnswer.trim() ? 'in_progress' : 'draft',
        conversation: coachingChat,
        createdAt:
          savedSessions.find((s) => s.id === activeSessionId)?.createdAt ||
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveTrainingSession(currentSession);
      setSavedSessions(getLocalTrainingSessions());
      setSessionSaveState('saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [
    activeSessionId,
    selectedQuestionId,
    userAnswer,
    coachPersona,
    secondsRemaining,
    timerDuration,
    evaluation,
    coachingChat,
    activeQuestion,
  ]);

  const handleManualSaveSession = async () => {
    if (!activeQuestion) return;
    setSessionSaveState('saving');
    const currentSession: TrainingSession = {
      id: activeSessionId,
      userId: user?.id,
      scenarioId: selectedQuestionId,
      scenarioTitle: activeQuestion.scenarioTitle,
      tradeCategory: activeQuestion.tradeCategory,
      difficulty: activeQuestion.difficulty,
      userAnswer,
      coachPersona,
      secondsRemaining,
      timerDuration,
      evaluation,
      status: evaluation ? 'evaluated' : userAnswer.trim() ? 'in_progress' : 'draft',
      conversation: coachingChat,
      createdAt:
        savedSessions.find((s) => s.id === activeSessionId)?.createdAt ||
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await saveTrainingSession(currentSession);
    setSavedSessions(getLocalTrainingSessions());
    setSessionSaveState('saved');
    setSessionNotice(
      res.cloudSynced
        ? 'Session saved and synchronized to Cloud & Local Storage!'
        : 'Session saved locally in your browser!'
    );
    setTimeout(() => setSessionNotice(null), 3500);
  };

  const handleResumeSession = (session: TrainingSession) => {
    setActiveSessionId(session.id);
    setSelectedQuestionId(session.scenarioId);
    setUserAnswer(session.userAnswer || '');
    setCoachPersona(session.coachPersona || 'dave');
    setSecondsRemaining(session.secondsRemaining || 120);
    setTimerDuration(session.timerDuration || 120);
    setEvaluation(session.evaluation || null);
    setCoachingChat(session.conversation || []);
    setIsTimerActive(false);
    setSessionNotice(`Resumed training session: "${session.scenarioTitle}"`);
    setTimeout(() => setSessionNotice(null), 4000);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteTrainingSession(sessionId);
    const updated = getLocalTrainingSessions();
    setSavedSessions(updated);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        handleResumeSession(updated[0]);
      } else {
        handleStartNewSession();
      }
    }
  };

  const handleStartNewSession = () => {
    if (!activeQuestion) return;
    const newSession = createNewTrainingSession(activeQuestion, user?.id, coachPersona);
    setActiveSessionId(newSession.id);
    setUserAnswer('');
    setEvaluation(null);
    setSecondsRemaining(120);
    setTimerDuration(120);
    setCoachingChat(newSession.conversation);
    setIsTimerActive(false);
    saveTrainingSession(newSession);
    setSavedSessions(getLocalTrainingSessions());
    setSessionNotice(`Started new training session for "${activeQuestion.scenarioTitle}"`);
    setTimeout(() => setSessionNotice(null), 4000);
  };

  const handleSendCoachMessage = async (messageText: string) => {
    const userMsg: CoachingChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setCoachingChat((prev) => [...prev, userMsg]);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const personaSystem =
          coachPersona === 'dave'
            ? 'You are Dave Henderson, a friendly 25-year veteran Master Journeyman mentor. You offer practical field wisdom, step-by-step diagnostic sequences, safety tips, and encourage the apprentice with warmth.'
            : coachPersona === 'sarah'
            ? 'You are Sarah Chen, a meticulous OSHA safety director and vocational code examiner. You focus on code compliance (NEC/NFPA/OSHA/EPA), lockout/tagout, PPE, and technical precision.'
            : 'You are Marcus Vance, a demanding but fair Union General Foreman. You focus on job-site pace, high standards, clear communication, and practical troubleshooting under real shift pressure.';

        const prompt = `${personaSystem}
The student is practicing for a vocational trade interview in the category: "${activeQuestion.tradeCategory}".
Scenario: "${activeQuestion.scenarioTitle}"
Interview Question: "${activeQuestion.question}"
Student's draft answer so far: "${userAnswer || '(none typed yet)'}"

Student's message to coach: "${messageText}"

Respond concisely (2-3 sentences max) directly in character to guide the student with actionable vocational expertise.`;

        let reply = '';
        const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
        for (const m of candidateModels) {
          try {
            const res = await ai.models.generateContent({
              model: m,
              contents: prompt,
            });
            if (res?.text) {
              reply = res.text.trim();
              break;
            }
          } catch (_) {}
        }
        if (reply) {
          const coachMsg: CoachingChatMessage = {
            id: `msg-${Date.now()}-c`,
            sender: 'coach',
            text: reply,
            timestamp: new Date().toISOString(),
          };
          setCoachingChat((prev) => [...prev, coachMsg]);
          return;
        }
      } catch (err) {
        console.warn('AI coach chat error:', err);
      }
    }

    // Heuristic persona response fallback
    setTimeout(() => {
      let fallbackText = '';
      if (coachPersona === 'dave') {
        fallbackText = `Good question! On the job site, I always teach apprentices: verify zero energy first with your meter, isolate the circuit, and don't rush. For ${activeQuestion.tradeCategory}, hiring managers want to know you won't take dangerous shortcuts.`;
      } else if (coachPersona === 'sarah') {
        fallbackText = `From an OSHA compliance perspective, verify that you cite standard PPE and Lockout/Tagout protocols. For this scenario, ensure your answer references calibrated test equipment and documentation standards.`;
      } else {
        fallbackText = `In a real interview, be confident and structured. State your diagnostic sequence clearly, explain what tools you're grabbing, and confirm how you verify the fix before packing up.`;
      }

      const coachMsg: CoachingChatMessage = {
        id: `msg-${Date.now()}-c`,
        sender: 'coach',
        text: fallbackText,
        timestamp: new Date().toISOString(),
      };
      setCoachingChat((prev) => [...prev, coachMsg]);
    }, 600);
  };

  // -------------------------------------------------------------
  // Vocational Resume State & Logic
  // -------------------------------------------------------------
  const [resumeData, setResumeData] = useState<VocationalResumeData>(() => {
    const studentEnrollment = enrollments.find((e) => e.status === 'Completed') || enrollments[0];
    const studentNgo = ngos.find((n) => n.id === studentEnrollment?.ngoId) || ngos[0];

    return {
      fullName: user?.name || 'Alex Mercer',
      targetTrade: studentEnrollment?.courseName || 'Clean Energy & Solar PV Specialist',
      phone: '(415) 555-0188',
      email: user?.email || 'alex.mercer@trade-pro.net',
      location: 'San Francisco Bay Area, CA',
      verifiedWorkshopHours: 360,
      professionalBio:
        'Certified vocational technician with 360+ hours of accredited hands-on workshop training. Proficient in diagnostic testing, OSHA safety compliance, and practical field installations.',
      primaryCenter: studentNgo?.name || 'SkillSpot Vocational Training Center',
      coreCompetencies: [
        'Lockout / Tagout (LOTO)',
        'CAT-III/IV Multimeter Diagnostics',
        'Blueprint & Schematic Reading',
        'Preventative Maintenance',
        'NFPA 70E / OSHA 10 Compliance',
      ],
      equipmentProficiencies: [
        'Digital Clamp Meters',
        'Torque Wrenches & Precision Calipers',
        'Auto-Darkening Welding Rigs',
        'Laser Level Benchmark Systems',
      ],
      completedCourses: enrollments
        .filter((e) => e.status === 'Completed' || e.status === 'Approved')
        .map((e) => e.courseName),
      certificateHash: studentEnrollment?.certificateId || 'CERT-INNOVATE-001',
      capstoneProjects:
        portfolioItems.length > 0
          ? portfolioItems.map((p) => ({
              title: p.title || 'Workshop Practical Milestone',
              description: p.description || '',
              toolsUsed: Array.isArray(p.toolsUsed)
                ? p.toolsUsed.join(', ')
                : Array.isArray(p.skillsLearned)
                ? p.skillsLearned.join(', ')
                : typeof p.toolsUsed === 'string'
                ? p.toolsUsed
                : 'Specialized workshop tools',
            }))
          : [
              {
                title: '50kW Grid-Tied Inverter Simulation & Storage Array',
                description:
                  'Configured rapid shutdown DC disconnects, tested ground fault isolation resistance, and verified balanced three-phase AC output.',
                toolsUsed: 'CAT IV Multimeter, Megger 1000V Tester, Torque Drivers',
              },
            ],
    };
  });

  const [newCompetency, setNewCompetency] = useState('');

  const handleAddCompetency = () => {
    if (!newCompetency.trim()) return;
    if (!resumeData.coreCompetencies.includes(newCompetency.trim())) {
      setResumeData((prev) => ({
        ...prev,
        coreCompetencies: [...prev.coreCompetencies, newCompetency.trim()],
      }));
    }
    setNewCompetency('');
  };

  const handleRemoveCompetency = (item: string) => {
    setResumeData((prev) => ({
      ...prev,
      coreCompetencies: prev.coreCompetencies.filter((c) => c !== item),
    }));
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Trade Career Accelerator & Mock Interview Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Trade Coach & Voice Interview Simulator
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Master real-world workshop scenarios, practice spoken technical interviews with live AI evaluation, practice with timed pressure mode, and generate an ATS-ready trade resume.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-start shrink-0">
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'interview'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Mic className="w-4 h-4 text-blue-600" />
              <span>Mock Interviewer</span>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'resume'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Vocational Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Voice & Text Trade Mock Interviewer */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          {/* Notification Toast */}
          {sessionNotice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">{sessionNotice}</span>
              </div>
              <button
                onClick={() => setSessionNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Session Persistence & Quick Actions Ribbon */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Active Session: {activeQuestion.scenarioTitle}
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sessionSaveState === 'saving'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        sessionSaveState === 'saving'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{sessionSaveState === 'saving' ? 'Syncing...' : 'Auto-Saved'}</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Ongoing mock interview answers, coach dialogues, and evaluations are continuously saved in local state & Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsSessionsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                title="View saved sessions and resume training"
              >
                <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Resume / Saved ({savedSessions.length})</span>
              </button>

              <button
                onClick={handleManualSaveSession}
                className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center space-x-1.5 transition-all"
                title="Manually trigger session save"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Now</span>
              </button>

              <button
                onClick={handleStartNewSession}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                title="Start a fresh training session"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scenario Search, Filters & Scenario List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Trade Scenarios
                  </span>
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
                  title="Generate a custom trade interview scenario with Gemini"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>AI Generator</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search scenarios or trades..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-1.5 text-[11px] font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="p-1.5 text-[11px] font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    <option value="All">All Levels</option>
                    <option value="Apprentice">Apprentice</option>
                    <option value="Journeyman">Journeyman</option>
                    <option value="Master Tech">Master Tech</option>
                  </select>
                </div>
              </div>

              {/* Scenarios Scrollable List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredQuestions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No scenarios match your filter.
                  </p>
                ) : (
                  filteredQuestions.map((q) => {
                    const isSelected = q.id === selectedQuestionId;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setEvaluation(null);
                          setShowModelAnswer(false);
                          handleResetTimer();
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-xs ring-1 ring-blue-300'
                            : 'bg-gray-50/50 dark:bg-gray-700/30 border-transparent hover:bg-gray-100/70 dark:hover:bg-gray-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 truncate max-w-[170px]">
                            {q.tradeCategory}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              q.difficulty === 'Apprentice'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : q.difficulty === 'Journeyman'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                          {q.scenarioTitle}
                        </h4>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Safety & Compliance Checklist */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/30 rounded-3xl p-5 border border-amber-200 dark:border-amber-800/40 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  OSHA & Code Checkpoints
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                Recruiters look for explicit mention of these mandatory trade criteria:
              </p>
              <ul className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                {activeQuestion.keySafetyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Scenario Detail, Pressure Timer, Voice Input & AI Feedback */}
          <div className="lg:col-span-8 space-y-6">
            {/* Scenario Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
              {/* Header with Persona & Audio controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {activeQuestion.tradeCategory} • {activeQuestion.difficulty} Level
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                    {activeQuestion.scenarioTitle}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Persona Selector */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-[10px] text-gray-500 hidden sm:inline">Voice:</span>
                    <select
                      value={coachPersona}
                      onChange={(e: any) => setCoachPersona(e.target.value)}
                      className="text-[11px] font-bold px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    >
                      <option value="dave">Journeyman Dave</option>
                      <option value="sarah">Inspector Sarah</option>
                      <option value="marcus">Foreman Marcus</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSpeakQuestion}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      isSpeaking
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                    title="Listen to scenario prompt"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-blue-500" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                  </button>
                </div>
              </div>

              {/* Context & Question Prompt */}
              <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Interview Scenario:</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  "{activeQuestion.question}"
                </p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-blue-100/50 dark:border-blue-900/30">
                  <span className="font-semibold">Context & Objective:</span> {activeQuestion.context}
                </div>
              </div>

              {/* Interview Pressure Timer Bar */}
              <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Interview Timer:
                  </span>
                  <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5 text-[11px]">
                    {[60, 120, 180].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          setTimerDuration(sec);
                          setSecondsRemaining(sec);
                          setIsTimerActive(false);
                        }}
                        className={`px-2 py-0.5 rounded font-bold ${
                          timerDuration === sec
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-lg ${
                      secondsRemaining <= 15
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {Math.floor(secondsRemaining / 60)}:
                    {(secondsRemaining % 60).toString().padStart(2, '0')}
                  </div>

                  <div className="flex items-center space-x-1">
                    {!isTimerActive ? (
                      <button
                        onClick={handleStartTimer}
                        className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                        title="Start timer"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleStopTimer}
                        className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                        title="Pause timer"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleResetTimer}
                      className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                      title="Reset timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Response Area */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <span>Your Answer (Speak or Type)</span>
                    {isRecording && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        <span>Listening Live...</span>
                      </span>
                    )}
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* STAR Framework Helper Button */}
                    <button
                      onClick={() => {
                        setIsStarAssistantOpen(!isStarAssistantOpen);
                        if (!isStarAssistantOpen) setIsCheatSheetOpen(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>STAR Framework</span>
                    </button>

                    {/* Trade Terminology & Code Standards Quick Cheat Sheet */}
                    <button
                      onClick={() => {
                        setIsCheatSheetOpen(!isCheatSheetOpen);
                        if (!isCheatSheetOpen) setIsStarAssistantOpen(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 flex items-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Codes & Tools</span>
                    </button>

                    <button
                      onClick={handleToggleRecord}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      <span>{isRecording ? 'Stop Mic' : 'Speak Answer'}</span>
                    </button>

                    {userAnswer && (
                      <button
                        onClick={() => setUserAnswer('')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Clear answer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Trade Terminology & Standards Drawer */}
                {isCheatSheetOpen && (
                  <div className="bg-teal-50/80 dark:bg-teal-950/40 p-4 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-900 dark:text-teal-200 flex items-center space-x-1.5">
                        <Wrench className="w-3.5 h-3.5 text-teal-600" />
                        <span>Master Trade Codes & Terminology Cheat Sheet (Click to insert)</span>
                      </span>
                      <button
                        onClick={() => setIsCheatSheetOpen(false)}
                        className="text-[10px] text-teal-600 hover:underline font-bold"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {TRADE_CHEAT_SHEET_ITEMS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setUserAnswer((prev) => (prev ? prev + ' ' + item.snippet : item.snippet));
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-teal-200/70 dark:border-teal-800/60 hover:border-teal-400 text-left transition-all shadow-2xs group"
                        >
                          <div className="font-bold text-teal-800 dark:text-teal-300 text-[11px] group-hover:text-teal-600">
                            + {item.label}
                          </div>
                          <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.snippet}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STAR Assistant Dropdown Card */}
                {isStarAssistantOpen && (
                  <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">
                        STAR Trade Interview Structure
                      </span>
                      <button
                        onClick={handleApplyStarTemplate}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700"
                      >
                        Insert Scaffold into Textarea
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                      <div>
                        <strong>Situation:</strong> Job site setting, machine condition, initial hazard.
                      </div>
                      <div>
                        <strong>Task:</strong> Your exact responsibility and relevant code standard.
                      </div>
                      <div>
                        <strong>Action:</strong> Step-by-step diagnostic sequence, PPE, tools, and remediation.
                      </div>
                      <div>
                        <strong>Result:</strong> Verification tests, zero residual hazard, client sign-off.
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Safety & Standards Inspector Badges */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-gray-500 uppercase text-[10px] mr-1">Live Criteria:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 transition-all ${
                      liveSafetyChecklist.ppe
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>{liveSafetyChecklist.ppe ? '✓' : '○'}</span>
                    <span>PPE Inspected</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 transition-all ${
                      liveSafetyChecklist.loto
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>{liveSafetyChecklist.loto ? '✓' : '○'}</span>
                    <span>LOTO Isolation</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 transition-all ${
                      liveSafetyChecklist.meter
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>{liveSafetyChecklist.meter ? '✓' : '○'}</span>
                    <span>Calibrated Meter</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 transition-all ${
                      liveSafetyChecklist.code
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>{liveSafetyChecklist.code ? '✓' : '○'}</span>
                    <span>Trade Code Cites</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 transition-all ${
                      liveSafetyChecklist.verify
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>{liveSafetyChecklist.verify ? '✓' : '○'}</span>
                    <span>Verification & Log</span>
                  </span>
                </div>

                {speechError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {speechError}
                  </p>
                )}

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Example: 'First, I ensure proper PPE including 1000V rated gloves. Next, I verify lockout/tagout on the disconnect switch before testing zero voltage with a verified meter...'"
                  rows={6}
                  className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-white"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-gray-400 space-x-2">
                    <span>
                      Words: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0}
                    </span>
                    <span>•</span>
                    <span>
                      Pace:{' '}
                      {userAnswer.trim().split(/\s+/).length > 80
                        ? 'Detailed Journeyman Answer'
                        : 'Concise Summary'}
                    </span>
                  </div>

                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isEvaluating ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                        <span>Evaluating with AI Trade Coach...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>Evaluate Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Evaluation Loading Shimmer Skeleton */}
            {isEvaluating && <AiEvaluationGlassSkeleton />}

            {/* AI Evaluation Results Card */}
            {evaluation && !isEvaluating && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        AI Coach Performance Evaluation
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {evaluation.overallVerdict}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSpeakEvaluation}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isEvaluationSpeaking
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                      title="Listen to AI coach evaluation audio"
                    >
                      {isEvaluationSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>{isEvaluationSpeaking ? 'Stop Audio' : 'Listen to Verdict'}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center space-x-1.5"
                      title="Print or export evaluation score report"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500" />
                      <span>Print Scorecard</span>
                    </button>

                    <div className="text-right pl-2 border-l border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Readiness Score
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          evaluation.score >= 80
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : evaluation.score >= 70
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {evaluation.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Criterion Metric Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Technical Precision</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {evaluation.technicalPrecisionScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.technicalPrecisionScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">OSHA Safety & LOTO</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {evaluation.safetyComplianceScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.safetyComplianceScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Clarity & Sequence</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {evaluation.communicationScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.communicationScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Observed Strengths:</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      {evaluation.strengths.map((str, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Coaching & Remediation Tips:</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      {evaluation.improvementTips.map((tip, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expandable Model Answer Comparison */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1.5"
                  >
                    <span>{showModelAnswer ? 'Hide' : 'Reveal'} Senior Journeyman Model Answer</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        showModelAnswer ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showModelAnswer && (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Benchmark Response for this scenario:
                      </p>
                      <p className="italic leading-relaxed">
                        "{activeQuestion.sampleModelAnswer}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 1-on-1 AI Trade Coaching Dialogue Panel */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    1-on-1 AI Trade Coach Dialogue & Question Lab
                  </h3>
                </div>
                <button
                  onClick={() => setIsCoachDialogueOpen(!isCoachDialogueOpen)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isCoachDialogueOpen ? 'Collapse Chat' : 'Expand Chat'}
                </button>
              </div>

              {isCoachDialogueOpen && (
                <TradeCoachingChatPanel
                  scenario={activeQuestion}
                  coachPersona={coachPersona}
                  conversation={coachingChat}
                  onSendMessage={handleSendCoachMessage}
                  isEvaluating={isEvaluating}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AI CUSTOM SCENARIO GENERATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Generate Custom Trade Scenario
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter any trade specialization, machine, or site condition. The AI coach will instantly build a realistic interview scenario with safety checkpoints and model answers.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Trade Specialty or Equipment:
              </label>
              <input
                type="text"
                value={customTradeInput}
                onChange={(e) => setCustomTradeInput(e.target.value)}
                placeholder="e.g. Industrial Automation PLC, Aircraft Avionics, Commercial Refrigeration..."
                className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />

              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Substation Lineman',
                  'Heavy Equipment Diesel',
                  'Industrial Robotics',
                  'Commercial PEX Plumbing',
                  'Solar Inverter Islanding',
                ].map((sugg) => (
                  <button
                    key={sugg}
                    onClick={() => setCustomTradeInput(sugg)}
                    className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold hover:bg-gray-200"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomScenario}
                disabled={!customTradeInput.trim() || isGeneratingScenario}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isGeneratingScenario ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Synthesizing Scenario...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Scenario</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Vocational Resume & Bio Generator */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Edit Resume Details */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Resume Customizer
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Live sync</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Target Vocational Trade Title
                </label>
                <input
                  type="text"
                  value={resumeData.targetTrade}
                  onChange={(e) => setResumeData({ ...resumeData, targetTrade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                    Workshop Hours
                  </label>
                  <input
                    type="number"
                    value={resumeData.verifiedWorkshopHours}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        verifiedWorkshopHours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={resumeData.professionalBio}
                  onChange={(e) =>
                    setResumeData({ ...resumeData, professionalBio: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Core Competencies Tagging */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Core Trade Competencies
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {resumeData.coreCompetencies.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(c)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    placeholder="e.g. Arc Flash Safety, Tig Welding..."
                    className="flex-grow p-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompetency();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCompetency}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable 1-Page Trade Resume */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Recruiter-Ready Preview
              </span>
              <button
                onClick={handlePrintResume}
                className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

            {/* Resume Sheet Container */}
            <div
              id="printable-trade-resume"
              className="bg-white text-gray-900 p-8 sm:p-10 rounded-3xl shadow-lg border border-gray-200 space-y-6 font-sans text-xs"
            >
              {/* Top Header */}
              <div className="border-b-2 border-gray-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                    {resumeData.fullName}
                  </h2>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {resumeData.targetTrade}
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                  <p>{resumeData.email}</p>
                  <p>{resumeData.phone}</p>
                  <p>{resumeData.location}</p>
                </div>
              </div>

              {/* Verified Training Badge */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Accredited Vocational Center
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {resumeData.primaryCenter}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    Verified Hours
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {resumeData.verifiedWorkshopHours} Practical Hrs
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Professional Profile
                </h4>
                <p className="text-[11.5px] text-gray-700 leading-relaxed">
                  {resumeData.professionalBio}
                </p>
              </div>

              {/* Competencies */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Core Technical Competencies & Safety
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.coreCompetencies.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 rounded text-[11px] font-medium text-gray-800"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capstone Projects */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Verified Capstone Workshop Projects
                </h4>
                <div className="space-y-2.5">
                  {resumeData.capstoneProjects.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-600">{p.description}</p>
                      <p className="text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-700">Tools & Standards:</span>{' '}
                        {p.toolsUsed}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credentials Verification Link */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    SkillSpot Public Credential Ledger ID:{' '}
                    <strong className="text-gray-800">{resumeData.certificateHash}</strong>
                  </span>
                </div>
                <span>Digitally Verified by Training Instructor</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Sessions & Resume Modal */}
      <TrainingSessionModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        sessions={savedSessions}
        activeSessionId={activeSessionId}
        onResumeSession={handleResumeSession}
        onDeleteSession={handleDeleteSession}
        onStartNewSession={handleStartNewSession}
      />
    </div>
  );
};

export default CareerCoachPage;
