// types.ts - Centralized Type Definitions for SkillSpot 2.0

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  deliverable?: string;
  durationHours?: number;
}

export interface CourseScheduleItem {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room: string;
  instructor: string;
  topic: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  trainer: string;
  seatsAvailable: number;
  startDate: string;
  reviews: Review[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  prerequisites?: string[];
  certificationBadge?: string;
  modules?: CourseModule[];
  schedule?: CourseScheduleItem[];
  mode?: string;
  certificationType?: string;
  tuitionFee?: number;
}

export interface Contact {
  email: string;
  phone: string;
  website: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface TenantBranding {
  primaryColor: string;
  accentColor?: string;
  tagline?: string;
  customSlug?: string;
  bannerPattern?: 'gradient' | 'waves' | 'grid' | 'dots' | 'minimal';
  brandFont?: 'sans' | 'serif' | 'mono';
  darkModeAccent?: string;
}

export interface TenantSettings {
  isPublicDirectoryListed?: boolean;
  autoApproveEnrollments?: boolean;
  allowGuestReviews?: boolean;
  defaultCertDesign?: 'classic' | 'modern' | 'gold' | 'tech';
  supportEmail?: string;
  intakeCapacityPerYear?: number;
  targetDemographics?: string[];
}

export interface NGO {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'Community Development' | 'Education' | 'Environmental' | 'Healthcare' | string;
  courses: Course[];
  contact: Contact;
  contactEmail?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  coordinates?: GeoCoordinates;
  address?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  mission?: string;
  establishedYear?: number;
  accreditation?: string;
  branding?: TenantBranding;
  primaryCategories?: string[];
  tenantSettings?: TenantSettings;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'student' | 'employer';
  ngoId?: string;
  companyName?: string;
  avatarUrl?: string;
  bio?: string;
  coverImageUrl?: string;
  tradeSpecialization?: string;
  location?: string;
  headline?: string;
  targetCareer?: string;
  skills?: string[];
  resumeUrl?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export type EnrollmentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface Enrollment {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  ngoId: string;
  status: EnrollmentStatus;
  requestDate: string;
  previousExperience?: string;
  reasonForJoining?: string;
  completedDate?: string;
  certificateId?: string;
  gradeScore?: string;
  userId?: string;
  grade?: string;
  honors?: boolean;
}

export type NotificationType = 'deadline' | 'enrollment' | 'certificate' | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  type?: NotificationType;
  title?: string;
  priority?: 'urgent' | 'high' | 'normal';
  courseName?: string;
  courseId?: string;
  deadlineDate?: string;
  certificateId?: string;
  ngoName?: string;
  actionLabel?: string;
}

export interface WorkshopDeadline {
  id: string;
  courseId: string;
  courseName: string;
  ngoId: string;
  ngoName: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  type: 'project' | 'milestone' | 'safety_quiz' | 'tool_inspection';
  priority: 'urgent' | 'high' | 'normal';
  submissionRequired?: boolean;
}

// -------------------------------------------------------------
// 1. Employment & Career Pathways
// -------------------------------------------------------------
export type JobType = 'Full-time' | 'Apprenticeship' | 'Tool Grant' | 'Paid Internship';

export interface VocationalJob {
  id: string;
  title: string;
  company: string;
  category: string; // e.g., 'Clean Energy', 'Technology', 'Trades & Construction', 'Healthcare'
  type: JobType;
  location: string;
  stipendOrSalary: string;
  description: string;
  requirements: string[];
  toolGrantIncluded?: boolean;
  postedDate: string;
  contactEmail: string;
  applicantsCount: number;
  hourlyWageOrStipend?: string;
  requiredSkills?: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  portfolioLinks?: string[];
  attachedCertificateId?: string;
  coverNote: string;
  appliedDate: string;
}

export interface StudentPortfolioItem {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  completionDate?: string;
  skillsLearned?: string[];
  toolsUsed?: string[];
  externalLink?: string;
  createdAt?: string;
  associatedCourseName?: string;
}

// -------------------------------------------------------------
// 2. Interactive Classroom & Learning Progress
// -------------------------------------------------------------
export interface AssignmentSubmission {
  id: string;
  enrollmentId: string;
  moduleId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  deliverableTitle: string;
  notes: string;
  attachmentUrl?: string;
  deliverableUrl?: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved & Graded' | 'Needs Revisions' | 'Under Review';
  trainerFeedback?: string;
  grade?: string;
}

export interface ForumReply {
  id: string;
  postId?: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'trainer' | 'admin';
  content: string;
  createdAt: string;
  isInstructorSolution?: boolean;
}

export type CourseForumReply = ForumReply;

export interface CourseForumPost {
  id: string;
  courseId: string;
  courseName?: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'trainer' | 'admin';
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  isAnnouncement?: boolean;
  replies: ForumReply[];
}

// -------------------------------------------------------------
// 3. NGO Administration & Sponsor Reporting
// -------------------------------------------------------------
export type EquipmentStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Operational' | 'Needs Maintenance' | 'Under Repair';

export interface WorkshopEquipmentItem {
  id: string;
  ngoId: string;
  name: string;
  category: 'Tool Kit' | 'Machinery' | 'Hardware' | 'Sewing Machine' | 'Solar Kit' | 'Safety Gear';
  serialNumber: string;
  status: EquipmentStatus;
  assignedToStudentId?: string;
  assignedToStudentName?: string;
  assignedDate?: string;
  condition?: 'New' | 'Good' | 'Fair';
  location?: string;
  lastMaintenanceDate?: string;
  notes?: string;
}

export interface BroadcastMessage {
  id: string;
  ngoId?: string;
  senderNgoId?: string;
  courseId?: string;
  courseName?: string;
  targetCourseId?: string;
  title: string;
  message: string;
  urgency: 'Normal' | 'Urgent' | 'Announcement' | 'urgent' | 'alert' | 'info';
  sentAt: string;
  recipientCount: number;
}

// -------------------------------------------------------------
// 4. Accessibility & Inclusion
// -------------------------------------------------------------
export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr' | 'te';

// -------------------------------------------------------------
// 5. AI Trade Career Coach & Mock Interviewer
// -------------------------------------------------------------
export interface MockInterviewQuestion {
  id: string;
  tradeCategory: string;
  scenarioTitle: string;
  difficulty: 'Apprentice' | 'Journeyman' | 'Master Tech';
  question: string;
  context: string;
  keySafetyPoints: string[];
  sampleModelAnswer: string;
}

export interface MockInterviewEvaluation {
  score: number; // 0 - 100
  overallVerdict: string;
  technicalPrecisionScore: number;
  safetyComplianceScore: number;
  communicationScore: number;
  strengths: string[];
  improvementTips: string[];
  modelAnswerAnalysis: string;
}

export interface CoachingChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  audioPrompt?: boolean;
}

export interface TrainingSession {
  id: string;
  userId?: string;
  scenarioId: string;
  scenarioTitle: string;
  tradeCategory: string;
  difficulty: string;
  userAnswer: string;
  coachPersona: 'dave' | 'sarah' | 'marcus';
  secondsRemaining: number;
  timerDuration: number;
  evaluation?: MockInterviewEvaluation | null;
  status: 'draft' | 'in_progress' | 'evaluated' | 'completed';
  conversation: CoachingChatMessage[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VocationalResumeData {
  fullName: string;
  targetTrade: string;
  phone: string;
  email: string;
  location: string;
  verifiedWorkshopHours: number;
  professionalBio: string;
  primaryCenter: string;
  coreCompetencies: string[];
  equipmentProficiencies: string[];
  completedCourses: string[];
  certificateHash?: string;
  capstoneProjects: {
    title: string;
    description: string;
    toolsUsed: string;
  }[];
}

// -------------------------------------------------------------
// 6. Employer Portal & Direct Hiring Pipeline
// -------------------------------------------------------------
export interface EmployerProfile {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  verifiedPartner: boolean;
  activeOpenings: number;
}

export interface InterviewInvitation {
  id: string;
  employerId: string;
  employerName: string;
  studentId: string;
  studentName: string;
  tradeField: string;
  positionTitle: string;
  interviewDate: string;
  message: string;
  status: 'Invited' | 'Accepted' | 'Declined' | 'Pending' | 'Completed';
  sentAt: string;
}

export interface PlacementRecord {
  id: string;
  studentId: string;
  studentName: string;
  tradeCategory: string;
  certificateId: string;
  companyName: string;
  jobTitle: string;
  startingHourlyWage: string;
  startDate: string;
  retentionMilestone: 'Active (Month 1-2)' | '3-Month Retained' | '6-Month Retained' | '1-Year Retained';
  donorReported: boolean;
  notes?: string;
}

// -------------------------------------------------------------
// 7. Workshop & Tool Library Map with Equipment Booking
// -------------------------------------------------------------
export interface WorkshopFacility {
  id: string;
  name: string;
  type: 'Training Center' | 'Public Tool Lending Library' | 'Community Maker Space' | 'Fabrication Lab';
  city: string;
  location: string;
  address: string;
  coordinates: GeoCoordinates;
  specializedMachinery: string[];
  availableToolsCount: number;
  operatingHours: string;
  contactPhone: string;
  contactEmail: string;
  imageUrl: string;
  safetyOrientationRequired: boolean;
}

export interface MachineReservation {
  id: string;
  facilityId: string;
  facilityName: string;
  machineName: string;
  studentId: string;
  studentName: string;
  reservationDate: string;
  timeSlot: 'Morning (9:00 AM - 1:00 PM)' | 'Afternoon (2:00 PM - 6:00 PM)' | 'Evening (6:00 PM - 9:00 PM)';
  purpose: string;
  safetyCertified: boolean;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  bookedAt: string;
}

