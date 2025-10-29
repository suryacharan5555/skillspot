
export type EnrollmentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  trainer: string;
  seatsAvailable: number;
  category: string;
}

export interface NGO {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  location: string;
  category: string;
  type: string;
  description: string;
  missionStatement: string;
  contact: {
    person: string;
    email: string;
    website: string;
  };
  courses: Course[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be optional or not present on client after login
  role: 'admin' | 'student';
  ngoId?: string; // For admins
}

export interface Enrollment {
    enrollmentId: string;
    studentId: string;
    courseId: string;
    ngoId: string;
    status: EnrollmentStatus;
    enrolledAt: string; // ISO date string
}
