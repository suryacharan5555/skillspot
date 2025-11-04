// Fix: Create types.ts to define all shared types.

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  trainer: string;
  seatsAvailable: number;
  startDate: string; // New field for course start date
  reviews: Review[];
}

export interface Contact {
  email: string;
  phone: string;
  website: string;
}

export interface NGO {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'Community Development' | 'Education' | 'Environmental' | 'Healthcare';
  courses: Course[];
  contact?: Contact;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'student';
  ngoId?: string;
}

export type EnrollmentStatus = 'Pending' | 'Approved' | 'Rejected';

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
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}