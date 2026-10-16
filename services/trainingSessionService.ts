import { TrainingSession, MockInterviewQuestion } from '../types';
import { supabase } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'skillspot_training_sessions';

// Seed sample session if user hasn't trained yet
export const DEFAULT_SEED_SESSIONS: TrainingSession[] = [
  {
    id: 'session-seed-1',
    scenarioId: 'mock-1',
    scenarioTitle: 'Solar PV Inverter Rapid Shutdown & Fault Troubleshooting',
    tradeCategory: 'Clean Energy & Solar',
    difficulty: 'Journeyman',
    userAnswer:
      'First, I equip full 1000V insulated gloves and Arc Flash eye protection. I proceed to the main DC disconnect switch and verify Lockout/Tagout (LOTO) boundaries. Using a verified CAT IV digital multimeter, I test zero energy across DC and AC leads. I then check the inverter ground-fault detection indicator and measure string open-circuit voltages (Voc) against module specs.',
    coachPersona: 'dave',
    secondsRemaining: 74,
    timerDuration: 120,
    status: 'evaluated',
    evaluation: {
      score: 92,
      overallVerdict: 'Exceptional safety discipline and step-by-step diagnostic sequence. Demonstrates genuine field readiness.',
      technicalPrecisionScore: 94,
      safetyComplianceScore: 95,
      communicationScore: 88,
      strengths: [
        'Mandatory OSHA PPE and CAT IV meter verification explicitly stated.',
        'Proper LOTO isolation verified before approaching high-voltage conductors.',
        'Checked ground-fault indicator and measured open-circuit string voltages against factory specs.',
      ],
      improvementTips: [
        'Mention testing residual capacitor discharge time prior to accessing internal bus bars.',
      ],
      modelAnswerAnalysis: 'Aligns directly with senior solar installation and commissioning protocols under NEC 690.12.',
    },
    conversation: [
      {
        id: 'msg-1',
        sender: 'coach',
        text: "Hey there! Dave here. When you're ready to diagnose that inverter fault, remember to isolate that DC feeder first. What's your first move on the roof?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'I always verify LOTO with a padlocked hasp, and then prove my meter on a known live source first.',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: 'msg-3',
        sender: 'coach',
        text: "That's the three-point check! Live-dead-live. Keep that disciplined habit in your interview and employers will respect your safety instincts.",
        timestamp: new Date(Date.now() - 3200000).toISOString(),
      },
    ],
    notes: 'Journeyman Dave approved the diagnostic procedure. Recommended reviewing NEC 690 rapid shutdown thresholds.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

/**
 * Load all stored training sessions from localStorage and Supabase
 */
export function getLocalTrainingSessions(): TrainingSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading training sessions from localStorage:', err);
  }

  // Save default seed sessions so user has immediate resumption options
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_SESSIONS));
  } catch {
    // Ignore storage quota error
  }
  return DEFAULT_SEED_SESSIONS;
}

/**
 * Save or update a training session in localStorage and optionally Supabase
 */
export async function saveTrainingSession(
  session: TrainingSession
): Promise<{ success: boolean; cloudSynced: boolean; error?: string }> {
  let cloudSynced = false;

  // 1. Save to LocalStorage immediately
  try {
    const existing = getLocalTrainingSessions();
    const updatedIndex = existing.findIndex((s) => s.id === session.id);
    let updatedList: TrainingSession[];

    if (updatedIndex >= 0) {
      updatedList = [...existing];
      updatedList[updatedIndex] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      updatedList = [{ ...session, updatedAt: new Date().toISOString() }, ...existing];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err: any) {
    console.warn('LocalStorage save warning:', err);
  }

  // 2. Try saving to Supabase if connected
  try {
    const { error } = await supabase.from('training_sessions').upsert({
      id: session.id,
      userId: session.userId || null,
      scenarioId: session.scenarioId,
      scenarioTitle: session.scenarioTitle,
      tradeCategory: session.tradeCategory,
      difficulty: session.difficulty,
      userAnswer: session.userAnswer,
      coachPersona: session.coachPersona,
      secondsRemaining: session.secondsRemaining,
      timerDuration: session.timerDuration,
      evaluation: session.evaluation || null,
      status: session.status,
      conversation: session.conversation || [],
      notes: session.notes || null,
      updatedAt: new Date().toISOString(),
    });

    if (!error) {
      cloudSynced = true;
    }
  } catch {
    // Supabase table might not exist or user is offline/anon; local storage handles it smoothly
  }

  return { success: true, cloudSynced };
}

/**
 * Delete a saved training session
 */
export async function deleteTrainingSession(sessionId: string): Promise<boolean> {
  try {
    const existing = getLocalTrainingSessions();
    const filtered = existing.filter((s) => s.id !== sessionId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error deleting training session from local storage:', err);
  }

  try {
    await supabase.from('training_sessions').delete().eq('id', sessionId);
  } catch {
    // Silently ignore remote delete failure
  }

  return true;
}

/**
 * Creates a new blank training session based on a selected scenario
 */
export function createNewTrainingSession(
  scenario: MockInterviewQuestion,
  userId?: string,
  persona: 'dave' | 'sarah' | 'marcus' = 'dave'
): TrainingSession {
  const initialGreeting =
    persona === 'dave'
      ? `Hey there! Dave here. I'm your trade coach today. We are reviewing "${scenario.scenarioTitle}". What's your diagnostic plan?`
      : persona === 'sarah'
      ? `OSHA & Code Compliance Inspector Sarah here. We'll be assessing code adherence on "${scenario.scenarioTitle}". Let me know if you need code references.`
      : `Foreman Marcus here. On my job site, safety and precision come first. Let's hear how you handle "${scenario.scenarioTitle}".`;

  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    scenarioId: scenario.id,
    scenarioTitle: scenario.scenarioTitle,
    tradeCategory: scenario.tradeCategory,
    difficulty: scenario.difficulty,
    userAnswer: '',
    coachPersona: persona,
    secondsRemaining: 120,
    timerDuration: 120,
    evaluation: null,
    status: 'draft',
    conversation: [
      {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: initialGreeting,
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
