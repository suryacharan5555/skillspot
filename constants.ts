// Fix: Create constants.ts to provide initial mock data.
import { NGO } from './types';

export const NGOS: NGO[] = [
  {
    id: 'ngo-1',
    name: 'Innovate For Tomorrow',
    description: 'Empowering the next generation with cutting-edge tech skills. We focus on practical, project-based learning to prepare students for the digital economy.',
    location: 'San Francisco, CA',
    type: 'Education',
    contact: {
      email: 'contact@innovate.org',
      phone: '123-456-7890',
      website: 'https://innovate.org'
    },
    courses: [
      {
        id: 'course-1-1',
        name: 'Full-Stack Web Development',
        description: 'Master front-end and back-end technologies to build complete web applications. Covers React, Node.js, databases, and deployment.',
        category: 'Technology',
        duration: '12 Weeks',
        trainer: 'Jane Doe',
        seatsAvailable: 5,
        startDate: '2025-08-01',
        reviews: [
          { id: 'review-1', studentId: 'stu-1', studentName: 'Alex', rating: 5, comment: 'Amazing course, learned a lot!', createdAt: new Date().toISOString() },
        ],
      },
      {
        id: 'course-1-2',
        name: 'Introduction to UX/UI Design',
        description: 'Learn the principles of user-centric design, from wireframing and prototyping to creating visually appealing interfaces.',
        category: 'Design',
        duration: '6 Weeks',
        trainer: 'John Smith',
        seatsAvailable: 10,
        startDate: '2025-07-15',
        reviews: [],
      },
    ],
  },
  {
    id: 'ngo-2',
    name: 'Community Builders United',
    description: 'Focused on vocational training and community support, we help individuals gain practical skills for immediate employment and personal growth.',
    location: 'Chicago, IL',
    type: 'Community Development',
    contact: {
      email: 'info@cbu.org',
      phone: '234-567-8901',
      website: 'https://cbu.org'
    },
    courses: [
      {
        id: 'course-2-1',
        name: 'Certified Nursing Assistant (CNA) Prep',
        description: 'A comprehensive program preparing students for the CNA certification exam, including both theoretical knowledge and hands-on practice.',
        category: 'Healthcare',
        duration: '8 Weeks',
        trainer: 'Emily White',
        seatsAvailable: 0,
        startDate: '2025-09-01',
        reviews: [],
      },
      {
        id: 'course-2-2',
        name: 'Professional Culinary Arts',
        description: 'From basic knife skills to advanced pastry techniques, this course prepares aspiring chefs for a career in the food industry.',
        category: 'Vocational',
        duration: '16 Weeks',
        trainer: 'David Green',
        seatsAvailable: 3,
        startDate: '2025-08-20',
        reviews: [],
      },
    ],
  },
];