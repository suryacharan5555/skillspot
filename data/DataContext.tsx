import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  NGO,
  User,
  Enrollment,
  Notification,
  VocationalJob,
  JobApplication,
  StudentPortfolioItem,
  WorkshopEquipmentItem,
  CourseForumPost,
  AssignmentSubmission,
  BroadcastMessage,
  MockInterviewQuestion,
  EmployerProfile,
  PlacementRecord,
  WorkshopFacility,
  MachineReservation,
  InterviewInvitation,
} from '../types';
import {
  NGOS as initialNgos,
  INITIAL_USERS as initialUsers,
  INITIAL_ENROLLMENTS as initialEnrollments,
  INITIAL_NOTIFICATIONS as initialNotifications,
  INITIAL_VOCATIONAL_JOBS as initialJobs,
  INITIAL_PORTFOLIO_ITEMS as initialPortfolio,
  INITIAL_EQUIPMENT as initialEquipment,
  INITIAL_FORUM_POSTS as initialForumPosts,
  INITIAL_MOCK_INTERVIEW_QUESTIONS as initialMockQuestions,
  INITIAL_EMPLOYER_PROFILES as initialEmployerProfiles,
  INITIAL_PLACEMENT_RECORDS as initialPlacements,
  INITIAL_WORKSHOP_FACILITIES as initialFacilities,
  INITIAL_MACHINE_RESERVATIONS as initialReservations,
  INITIAL_INTERVIEW_INVITATIONS as initialInvitations,
} from '../constants';
import { subscribeToRealtimeNotifications } from '../services/realtimeNotificationService';

const STORAGE_KEYS = {
  NGOS: 'skillspot_ngos_v3',
  USERS: 'skillspot_users_v2',
  ENROLLMENTS: 'skillspot_enrollments_v2',
  NOTIFICATIONS: 'skillspot_notifications_v2',
  JOBS: 'skillspot_jobs_v2',
  APPLICATIONS: 'skillspot_job_apps_v2',
  PORTFOLIO: 'skillspot_portfolio_v2',
  EQUIPMENT: 'skillspot_equipment_v2',
  FORUMS: 'skillspot_forums_v2',
  ASSIGNMENTS: 'skillspot_assignments_v2',
  BROADCASTS: 'skillspot_broadcasts_v2',
  MOCK_QUESTIONS: 'skillspot_mock_questions_v2',
  EMPLOYERS: 'skillspot_employers_v2',
  PLACEMENTS: 'skillspot_placements_v2',
  FACILITIES: 'skillspot_facilities_v2',
  RESERVATIONS: 'skillspot_reservations_v2',
  INVITATIONS: 'skillspot_invitations_v2',
};

interface DataContextType {
  ngos: NGO[];
  users: User[];
  enrollments: Enrollment[];
  notifications: Notification[];
  jobs: VocationalJob[];
  jobApplications: JobApplication[];
  portfolioItems: StudentPortfolioItem[];
  equipment: WorkshopEquipmentItem[];
  forumPosts: CourseForumPost[];
  assignmentSubmissions: AssignmentSubmission[];
  broadcasts: BroadcastMessage[];
  mockQuestions: MockInterviewQuestion[];
  employerProfiles: EmployerProfile[];
  placementRecords: PlacementRecord[];
  workshopFacilities: WorkshopFacility[];
  machineReservations: MachineReservation[];
  interviewInvitations: InterviewInvitation[];
  loading: boolean;
  error: string | null;
  isUsingLocalFallback: boolean;
  fetchNgos: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  setNgos: React.Dispatch<React.SetStateAction<NGO[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setJobs: React.Dispatch<React.SetStateAction<VocationalJob[]>>;
  setJobApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  setPortfolioItems: React.Dispatch<React.SetStateAction<StudentPortfolioItem[]>>;
  setEquipment: React.Dispatch<React.SetStateAction<WorkshopEquipmentItem[]>>;
  setForumPosts: React.Dispatch<React.SetStateAction<CourseForumPost[]>>;
  setAssignmentSubmissions: React.Dispatch<React.SetStateAction<AssignmentSubmission[]>>;
  setBroadcasts: React.Dispatch<React.SetStateAction<BroadcastMessage[]>>;
  setMockQuestions: React.Dispatch<React.SetStateAction<MockInterviewQuestion[]>>;
  setEmployerProfiles: React.Dispatch<React.SetStateAction<EmployerProfile[]>>;
  setPlacementRecords: React.Dispatch<React.SetStateAction<PlacementRecord[]>>;
  setWorkshopFacilities: React.Dispatch<React.SetStateAction<WorkshopFacility[]>>;
  setMachineReservations: React.Dispatch<React.SetStateAction<MachineReservation[]>>;
  setInterviewInvitations: React.Dispatch<React.SetStateAction<InterviewInvitation[]>>;
  addNotification: (notification: Notification) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ngos, setNgos] = useState<NGO[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NGOS) || localStorage.getItem('skillspot_ngos_v2');
      if (saved) {
        const parsed: NGO[] = JSON.parse(saved);
        // Exclude unwanted/extraneous added NGOs (ngo-5 to ngo-13)
        const removedIds = new Set(['ngo-5', 'ngo-6', 'ngo-7', 'ngo-8', 'ngo-9', 'ngo-10', 'ngo-11', 'ngo-12', 'ngo-13']);
        const cleaned = parsed.filter((n) => !removedIds.has(n.id));
        
        // Ensure canonical initial NGOs are present
        const existingIds = new Set(cleaned.map((n) => n.id));
        const missingInitial = initialNgos.filter((n) => !existingIds.has(n.id));
        const merged = [...cleaned, ...missingInitial];
        localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(merged));
        return merged;
      }
      return initialNgos;
    } catch {
      return initialNgos;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return saved ? JSON.parse(saved) : initialEnrollments;
    } catch {
      return initialEnrollments;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [jobs, setJobs] = useState<VocationalJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
      return saved ? JSON.parse(saved) : initialJobs;
    } catch {
      return initialJobs;
    }
  });

  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [portfolioItems, setPortfolioItems] = useState<StudentPortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      return saved ? JSON.parse(saved) : initialPortfolio;
    } catch {
      return initialPortfolio;
    }
  });

  const [equipment, setEquipment] = useState<WorkshopEquipmentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      return saved ? JSON.parse(saved) : initialEquipment;
    } catch {
      return initialEquipment;
    }
  });

  const [forumPosts, setForumPosts] = useState<CourseForumPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORUMS);
      return saved ? JSON.parse(saved) : initialForumPosts;
    } catch {
      return initialForumPosts;
    }
  });

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'sub-1',
          enrollmentId: 'enr-101',
          moduleId: 'mod-1-1',
          studentId: 'stu-1',
          studentName: 'Alex Mercer',
          courseId: 'course-1-1',
          deliverableTitle: 'Weather & Task Dashboard',
          notes: 'Built interactive single-page app with full TypeScript interfaces and localStorage caching.',
          submittedAt: '2025-08-08T18:00:00Z',
          status: 'Approved & Graded',
          trainerFeedback: 'Clean type definitions and intuitive UI! Approved with Honors.',
          grade: 'A'
        }
      ];
    } catch {
      return [];
    }
  });

  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BROADCASTS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'bc-1',
          ngoId: 'ngo-1',
          courseName: 'Full-Stack Web Development',
          title: 'Guest Lecture: Open Source & Git Workflows',
          message: 'This Thursday at 6 PM, guest speaker Sarah Lin from GitHub will host an exclusive workshop on production branching and CI/CD.',
          urgency: 'Announcement',
          sentAt: '2026-08-25T10:00:00Z',
          recipientCount: 12
        }
      ];
    } catch {
      return [];
    }
  });

  const [mockQuestions, setMockQuestions] = useState<MockInterviewQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOCK_QUESTIONS);
      return saved ? JSON.parse(saved) : initialMockQuestions;
    } catch {
      return initialMockQuestions;
    }
  });

  const [employerProfiles, setEmployerProfiles] = useState<EmployerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYERS);
      return saved ? JSON.parse(saved) : initialEmployerProfiles;
    } catch {
      return initialEmployerProfiles;
    }
  });

  const [placementRecords, setPlacementRecords] = useState<PlacementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLACEMENTS);
      return saved ? JSON.parse(saved) : initialPlacements;
    } catch {
      return initialPlacements;
    }
  });

  const [workshopFacilities, setWorkshopFacilities] = useState<WorkshopFacility[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      return saved ? JSON.parse(saved) : initialFacilities;
    } catch {
      return initialFacilities;
    }
  });

  const [machineReservations, setMachineReservations] = useState<MachineReservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : initialReservations;
    } catch {
      return initialReservations;
    }
  });

  const [interviewInvitations, setInterviewInvitations] = useState<InterviewInvitation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
      return saved ? JSON.parse(saved) : initialInvitations;
    } catch {
      return initialInvitations;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingLocalFallback, setIsUsingLocalFallback] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(ngos));
    } catch (e) {
      console.warn('Failed to save NGOs to localStorage', e);
    }
  }, [ngos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save Users to localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    } catch (e) {
      console.warn('Failed to save Enrollments to localStorage', e);
    }
  }, [enrollments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save Notifications to localStorage', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Failed to save Jobs to localStorage', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(jobApplications));
    } catch (e) {
      console.warn('Failed to save Job Applications to localStorage', e);
    }
  }, [jobApplications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolioItems));
    } catch (e) {
      console.warn('Failed to save Portfolio to localStorage', e);
    }
  }, [portfolioItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    } catch (e) {
      console.warn('Failed to save Equipment to localStorage', e);
    }
  }, [equipment]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORUMS, JSON.stringify(forumPosts));
    } catch (e) {
      console.warn('Failed to save Forum Posts to localStorage', e);
    }
  }, [forumPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignmentSubmissions));
    } catch (e) {
      console.warn('Failed to save Assignments to localStorage', e);
    }
  }, [assignmentSubmissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts));
    } catch (e) {
      console.warn('Failed to save Broadcasts to localStorage', e);
    }
  }, [broadcasts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_QUESTIONS, JSON.stringify(mockQuestions));
    } catch (e) {
      console.warn('Failed to save Mock Questions to localStorage', e);
    }
  }, [mockQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(employerProfiles));
    } catch (e) {
      console.warn('Failed to save Employer Profiles to localStorage', e);
    }
  }, [employerProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLACEMENTS, JSON.stringify(placementRecords));
    } catch (e) {
      console.warn('Failed to save Placement Records to localStorage', e);
    }
  }, [placementRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(workshopFacilities));
    } catch (e) {
      console.warn('Failed to save Facilities to localStorage', e);
    }
  }, [workshopFacilities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(machineReservations));
    } catch (e) {
      console.warn('Failed to save Machine Reservations to localStorage', e);
    }
  }, [machineReservations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(interviewInvitations));
    } catch (e) {
      console.warn('Failed to save Invitations to localStorage', e);
    }
  }, [interviewInvitations]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ngosRes, usersRes, enrollmentsRes, notificationsRes] = await Promise.all([
        supabase.from('ngos').select('*'),
        supabase.from('users').select('*'),
        supabase.from('enrollments').select('*'),
        supabase.from('notifications').select('*'),
      ]);

      if (ngosRes.error || usersRes.error || enrollmentsRes.error || notificationsRes.error) {
        throw ngosRes.error || usersRes.error || enrollmentsRes.error || notificationsRes.error;
      }

      if (ngosRes.data && ngosRes.data.length > 0) setNgos(ngosRes.data);
      if (usersRes.data && usersRes.data.length > 0) setUsers(usersRes.data);
      if (enrollmentsRes.data && enrollmentsRes.data.length > 0) setEnrollments(enrollmentsRes.data);
      if (notificationsRes.data && notificationsRes.data.length > 0) setNotifications(notificationsRes.data);

      setIsUsingLocalFallback(false);
    } catch (err: any) {
      console.warn(
        'Supabase offline or table schema in fallback mode. Leveraging persistent local workspace cache.',
        err
      );
      setIsUsingLocalFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time notification synchronization: Cross-tab broadcast bus + Supabase channel
  useEffect(() => {
    const unsubscribeBus = subscribeToRealtimeNotifications((incomingNotif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incomingNotif.id)) return prev;
        return [incomingNotif, ...prev];
      });
    });

    let supabaseChannel: any = null;
    try {
      supabaseChannel = supabase
        .channel('public_notifications_feed')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload: any) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const incoming = payload.new as Notification;
              setNotifications((prev) => {
                if (prev.some((n) => n.id === incoming.id)) return prev;
                return [incoming, ...prev];
              });
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updated = payload.new as Notification;
              setNotifications((prev) =>
                prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
              );
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime subscription not connected; using local broadcast fallback', err);
    }

    return () => {
      unsubscribeBus();
      if (supabaseChannel) {
        try {
          supabase.removeChannel(supabaseChannel);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const value = {
    ngos,
    setNgos,
    users,
    setUsers,
    enrollments,
    setEnrollments,
    notifications,
    setNotifications,
    jobs,
    setJobs,
    jobApplications,
    setJobApplications,
    portfolioItems,
    setPortfolioItems,
    equipment,
    setEquipment,
    forumPosts,
    setForumPosts,
    assignmentSubmissions,
    setAssignmentSubmissions,
    broadcasts,
    setBroadcasts,
    mockQuestions,
    setMockQuestions,
    employerProfiles,
    setEmployerProfiles,
    placementRecords,
    setPlacementRecords,
    workshopFacilities,
    setWorkshopFacilities,
    machineReservations,
    setMachineReservations,
    interviewInvitations,
    setInterviewInvitations,
    loading,
    error,
    isUsingLocalFallback,
    fetchNgos: async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('ngos').select('*');
        if (!fetchErr && data && data.length > 0) setNgos(data);
      } catch (e) {
        console.warn('Local fallback active for fetchNgos', e);
      }
    },
    fetchUsers: async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('users').select('*');
        if (!fetchErr && data && data.length > 0) setUsers(data);
      } catch (e) {
        console.warn('Local fallback active for fetchUsers', e);
      }
    },
    fetchEnrollments: async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('enrollments').select('*');
        if (!fetchErr && data && data.length > 0) setEnrollments(data);
      } catch (e) {
        console.warn('Local fallback active for fetchEnrollments', e);
      }
    },
    fetchNotifications: async () => {
      try {
        const { data, error: fetchErr } = await supabase.from('notifications').select('*');
        if (!fetchErr && data && data.length > 0) setNotifications(data);
      } catch (e) {
        console.warn('Local fallback active for fetchNotifications', e);
      }
    },
    addNotification: (notification: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
