// Fix: Create constants.ts to provide initial mock data.
import {
  NGO,
  User,
  Enrollment,
  Notification,
  MockInterviewQuestion,
  EmployerProfile,
  PlacementRecord,
  WorkshopFacility,
  MachineReservation,
  InterviewInvitation,
} from './types';

export const NGOS: NGO[] = [
  {
    id: 'ngo-1',
    name: 'Innovate For Tomorrow',
    description: 'Empowering the next generation with cutting-edge tech skills. We focus on practical, project-based learning to prepare students for the digital economy.',
    location: 'San Francisco, CA',
    address: '555 Mission St, San Francisco, CA 94105',
    type: 'Education',
    coordinates: { lat: 37.7885, lng: -122.4005 },
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    mission: 'Bridging opportunity and high-demand tech skills through hands-on project labs and industry mentorship.',
    establishedYear: 2019,
    accreditation: 'National Apprenticeship Council & IEEE Computer Society Partner',
    branding: {
      primaryColor: '#2563EB',
      accentColor: '#10B981',
      tagline: 'Empowering next-generation technicians with applied software & cloud skills.',
      customSlug: 'innovate-tomorrow',
      bannerPattern: 'gradient',
    },
    primaryCategories: ['Software & Web Engineering', 'Creative Media & Digital Design', 'Data Analytics'],
    tenantSettings: {
      isPublicDirectoryListed: true,
      autoApproveEnrollments: false,
      allowGuestReviews: true,
      intakeCapacityPerYear: 180,
    },
    contact: {
      email: 'contact@innovate.org',
      phone: '415-555-0192',
      website: 'https://innovate.org'
    },
    courses: [
      {
        id: 'course-1-1',
        name: 'Full-Stack Web Development',
        description: 'Master modern frontend and backend technologies to build end-to-end cloud-hosted web applications with React, Node.js, and SQL/NoSQL databases.',
        category: 'Technology',
        duration: '12 Weeks',
        trainer: 'Jane Doe',
        seatsAvailable: 5,
        startDate: '2025-08-01',
        level: 'Intermediate',
        certificationBadge: 'SkillSpot Certified Full-Stack Engineer',
        prerequisites: ['Basic HTML & CSS proficiency', 'Familiarity with foundational programming logic'],
        reviews: [
          { id: 'review-1', studentId: 'stu-1', studentName: 'Alex Mercer', rating: 5, comment: 'Amazing course! The syllabus and hands-on modules completely prepared me for job interviews.', createdAt: '2025-08-25T14:30:00Z' },
          { id: 'review-2', studentId: 'stu-2', studentName: 'Maya Patel', rating: 5, comment: 'Jane is an exceptional mentor. Weekly code reviews and capstone build were invaluable.', createdAt: '2025-08-28T09:15:00Z' }
        ],
        modules: [
          {
            id: 'mod-1-1',
            weekNumber: 1,
            title: 'Modern JavaScript & TypeScript Core',
            description: 'Deep dive into asynchronous JavaScript, Promises, ES6+ features, and TypeScript type systems.',
            topics: ['ESNext syntax', 'Async/Await & Event Loop', 'TypeScript Interfaces & Generics', 'DOM Manipulation'],
            deliverable: 'Interactive API-driven weather & task dashboard',
            durationHours: 15
          },
          {
            id: 'mod-1-2',
            weekNumber: 2,
            title: 'React 19 & State Architecture',
            description: 'Component lifecycles, custom hooks, context state management, and modern component composition patterns.',
            topics: ['Hooks & Memoization', 'Context API vs Zustand', 'Tailwind CSS integration', 'Accessible UI Design'],
            deliverable: 'Modular e-commerce product catalog with shopping cart state',
            durationHours: 20
          },
          {
            id: 'mod-1-3',
            weekNumber: 3,
            title: 'Backend APIs with Node & Express',
            description: 'Designing RESTful APIs, middleware architecture, request validation, and security fundamentals.',
            topics: ['Express.js Routing', 'Middleware & CORS', 'JWT Authentication & Cookies', 'Input Sanitization'],
            deliverable: 'Authenticated REST API service with Swagger documentation',
            durationHours: 18
          },
          {
            id: 'mod-1-4',
            weekNumber: 4,
            title: 'Databases & Relational Schema Design',
            description: 'PostgreSQL & MongoDB schema design, indexing, relationships, and ORMs/query builders.',
            topics: ['Relational vs Document Stores', 'SQL JOINs & Migrations', 'Transactions & Indexing', 'Database Security'],
            deliverable: 'Relational database schema with seeded data and complex analytics queries',
            durationHours: 16
          },
          {
            id: 'mod-1-5',
            weekNumber: 5,
            title: 'Full-Stack Integration & Cloud Deployment',
            description: 'Connecting frontend to backend, CI/CD pipeline automation, Docker containerization, and Cloud deployment.',
            topics: ['Environment Variables & Secrets', 'Docker Containers', 'Cloud Run & Vercel deployment', 'Logging & Monitoring'],
            deliverable: 'Live production URL of an end-to-end full-stack SaaS application',
            durationHours: 22
          },
          {
            id: 'mod-1-6',
            weekNumber: 6,
            title: 'Capstone Project & Industry Portfolio',
            description: 'Collaborative development of an industry-grade project with live code review and portfolio showcase.',
            topics: ['Agile Team Workflows', 'Git Branching & PR Reviews', 'Performance Optimization', 'Technical Interview Prep'],
            deliverable: 'Finished capstone project with public GitHub repository and demo presentation',
            durationHours: 25
          }
        ]
      },
      {
        id: 'course-1-2',
        name: 'Introduction to UX/UI Design',
        description: 'Learn human-centered product design principles, visual hierarchy, user journey mapping, design systems, and Figma prototyping.',
        category: 'Design',
        duration: '6 Weeks',
        trainer: 'John Smith',
        seatsAvailable: 8,
        startDate: '2025-07-15',
        level: 'Beginner',
        certificationBadge: 'SkillSpot Certified Product Designer',
        prerequisites: ['No prior experience required', 'Curiosity and interest in digital product design'],
        reviews: [
          { id: 'review-3', studentId: 'stu-1', studentName: 'Alex Mercer', rating: 5, comment: 'Transformed how I think about user experiences. Completed this course and earned my verified certificate!', createdAt: '2025-08-30T10:00:00Z' }
        ],
        modules: [
          {
            id: 'mod-2-1',
            weekNumber: 1,
            title: 'Foundations of Design & User Empathy',
            description: 'User personas, qualitative research methods, problem statements, and design thinking frameworks.',
            topics: ['Design Thinking Process', 'User Interviews', 'Empathy Maps', 'Competitive Auditing'],
            deliverable: 'User research briefing and validated persona pack',
            durationHours: 12
          },
          {
            id: 'mod-2-2',
            weekNumber: 2,
            title: 'Information Architecture & Wireframing',
            description: 'Site mapping, task flows, low-fidelity paper wireframes, and digital wireframes in Figma.',
            topics: ['Sitemaps & User Flows', 'Card Sorting', 'Low-Fi Wireframing', 'Heuristic Evaluation'],
            deliverable: 'Clickable wireframe prototype of a mobile community portal',
            durationHours: 14
          },
          {
            id: 'mod-2-3',
            weekNumber: 3,
            title: 'Visual Design Systems & Accessibility (WCAG)',
            description: 'Color theory, mathematical typographic scales, layout grids, components, and accessible contrast ratios.',
            topics: ['Color Scales & Neutrals', 'Typography & Vertical Rhythm', 'WCAG AA Compliance', 'Figma Auto-Layout & Variants'],
            deliverable: 'Complete responsive design system with 20+ reusable UI components',
            durationHours: 16
          },
          {
            id: 'mod-2-4',
            weekNumber: 4,
            title: 'Interactive Prototyping & Usability Testing',
            description: 'Advanced micro-interactions, smart animations, interactive prototypes, and conducting moderated usability testing.',
            topics: ['Micro-Interactions', 'Usability Test Scripting', 'Synthesizing Test Insights', 'Design Iteration'],
            deliverable: 'High-fidelity prototype tested with 5 real users and revised accordingly',
            durationHours: 18
          }
        ]
      }
    ]
  },
  {
    id: 'ngo-2',
    name: 'Community Builders United',
    description: 'Focused on vocational training and community empowerment, we equip individuals with practical, market-ready skills for immediate employment.',
    location: 'Chicago, IL',
    address: '224 S Michigan Ave, Chicago, IL 60604',
    type: 'Community Development',
    coordinates: { lat: 41.8789, lng: -87.6245 },
    logoUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=300&auto=format&fit=crop&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    mission: 'Bridging healthcare and essential trade access for urban youth through clinical mentorship and direct placement.',
    establishedYear: 2016,
    accreditation: 'Illinois Department of Public Health Approved Training Sponsor',
    branding: {
      primaryColor: '#059669',
      accentColor: '#10B981',
      tagline: 'Practical healthcare and community trade credentials for high-demand careers.',
      customSlug: 'community-builders',
      bannerPattern: 'waves',
    },
    primaryCategories: ['Healthcare & Nursing Support', 'Community & Workforce Development'],
    tenantSettings: {
      isPublicDirectoryListed: true,
      autoApproveEnrollments: false,
      allowGuestReviews: true,
      intakeCapacityPerYear: 240,
    },
    contact: {
      email: 'info@cbu.org',
      phone: '312-555-0188',
      website: 'https://cbu.org'
    },
    courses: [
      {
        id: 'course-2-1',
        name: 'Certified Nursing Assistant (CNA) Prep',
        description: 'A comprehensive healthcare program preparing students for state licensing, including bedside patient care, medical ethics, and vital signs monitoring.',
        category: 'Healthcare',
        duration: '8 Weeks',
        trainer: 'Emily White, RN',
        seatsAvailable: 0,
        startDate: '2025-09-01',
        level: 'All Levels',
        certificationBadge: 'Certified Nursing Assistant (State Board Exam Ready)',
        prerequisites: ['High school diploma or GED equivalent', 'Basic background check and immunization documentation'],
        reviews: [],
        modules: [
          {
            id: 'mod-3-1',
            weekNumber: 1,
            title: 'Healthcare Systems & Patient Communication',
            description: 'Medical law, HIPAA compliance, patient rights, and empathetic communication techniques.',
            topics: ['HIPAA Privacy Regulations', 'Patient Rights & Dignity', 'De-escalation Skills', 'Infection Control Basics'],
            deliverable: 'Patient intake protocol assessment',
            durationHours: 15
          },
          {
            id: 'mod-3-2',
            weekNumber: 2,
            title: 'Vital Signs & Emergency Preparedness',
            description: 'Blood pressure, pulse, respiration, temperature recording, and Basic Life Support (BLS) training.',
            topics: ['Sphygmomanometer usage', 'BLS CPR Certification', 'Choking Interventions', 'Emergency Protocols'],
            deliverable: 'Clinical vital signs competency practicum',
            durationHours: 20
          },
          {
            id: 'mod-3-3',
            weekNumber: 3,
            title: 'Patient Mobility, Hygiene & Clinical Skills',
            description: 'Assisting with activities of daily living (ADLs), transfer techniques, and bed-making.',
            topics: ['Gait Belt Transfer', 'Pressure Sore Prevention', 'Nutritional Care', 'Restorative Care'],
            deliverable: 'Simulated clinical patient care routine evaluation',
            durationHours: 25
          }
        ]
      },
      {
        id: 'course-2-2',
        name: 'Professional Culinary Arts & Food Safety',
        description: 'From foundational knife skills to industrial kitchen sanitation and banquet cooking, prepare for rewarding culinary careers.',
        category: 'Vocational',
        duration: '10 Weeks',
        trainer: 'Chef David Green',
        seatsAvailable: 4,
        startDate: '2025-08-20',
        level: 'Beginner',
        certificationBadge: 'ServSafe Food Protection Manager Credential',
        prerequisites: ['Passion for cooking and food service hospitality', 'Slip-resistant footwear for commercial kitchen lab'],
        reviews: [],
        modules: [
          {
            id: 'mod-4-1',
            weekNumber: 1,
            title: 'Knife Mechanics & Kitchen Safety',
            description: 'Mastering classical French knife cuts (julienne, brunoise, chiffonade) and kitchen safety protocols.',
            topics: ['Honing & Sharpening', 'Precision Knife Cuts', 'Mise en Place Principles', 'Kitchen Station Setup'],
            deliverable: 'Knife cut proficiency test within timed tolerances',
            durationHours: 16
          },
          {
            id: 'mod-4-2',
            weekNumber: 2,
            title: 'Stocks, Mother Sauces & Soups',
            description: 'The 5 classical mother sauces (Béchamel, Velouté, Espagnole, Hollandaise, Tomato) and reduction techniques.',
            topics: ['White & Brown Stocks', 'Roux Formulation', 'Mother Sauce Derivatives', 'Clear & Pureed Soups'],
            deliverable: '3-course sauce & soup tasting flight evaluation',
            durationHours: 18
          }
        ]
      }
    ]
  },
  {
    id: 'ngo-3',
    name: 'Austin Green Tech & Solar Initiative',
    description: 'Promoting sustainability and green jobs through hands-on technical training in solar photovoltaic installation, energy auditing, and green robotics.',
    location: 'Austin, TX',
    address: '701 Brazos St, Austin, TX 78701',
    type: 'Environmental',
    coordinates: { lat: 30.2693, lng: -97.7404 },
    contact: {
      email: 'hello@austingreentech.org',
      phone: '512-555-0144',
      website: 'https://austingreentech.org'
    },
    courses: [
      {
        id: 'course-3-1',
        name: 'Solar PV Systems Installation & Electrical Safety',
        description: 'Hands-on rooftop installation training, inverter wiring, battery storage configuration, and OSHA 10 safety compliance.',
        category: 'Environmental',
        duration: '8 Weeks',
        trainer: 'Marcus Vance, NABCEP Certified',
        seatsAvailable: 6,
        startDate: '2025-09-10',
        level: 'Intermediate',
        certificationBadge: 'NABCEP Associate PV Installer Credential',
        prerequisites: ['Basic knowledge of electrical circuits (AC/DC)', 'Comfort with ladder safety and outdoor site work'],
        reviews: [],
        modules: [
          {
            id: 'mod-5-1',
            weekNumber: 1,
            title: 'Solar Photovoltaic Principles & Site Assessment',
            description: 'Solar irradiance calculations, roof orientation, shading analysis, and system sizing.',
            topics: ['Azimuth & Tilt Angle', 'Solar Resource Tools', 'Roof Load Calculations', 'Site Feasibility Report'],
            deliverable: 'Residential solar design and production estimate proposal',
            durationHours: 16
          },
          {
            id: 'mod-5-2',
            weekNumber: 2,
            title: 'Racking, Electrical Wiring & Inverter Integration',
            description: 'Mechanical racking installation, conduit bending, string sizing, and grid-tied inverter connection.',
            topics: ['National Electrical Code (NEC Article 690)', 'Microinverters vs String Inverters', 'DC Disconnects', 'Grounding'],
            deliverable: 'Physical mock roof mounting and electrical wiring test',
            durationHours: 20
          }
        ]
      }
    ]
  },
  {
    id: 'ngo-4',
    name: 'Metro Seattle Youth & Tech Haven',
    description: 'Bridging the digital divide for underserved youth with intensive workshops in cloud computing, data analytics, and digital literacy.',
    location: 'Seattle, WA',
    address: '400 Pine St, Seattle, WA 98101',
    type: 'Education',
    coordinates: { lat: 47.6117, lng: -122.3364 },
    contact: {
      email: 'info@seattletechhaven.org',
      phone: '206-555-0128',
      website: 'https://seattletechhaven.org'
    },
    courses: [
      {
        id: 'course-4-1',
        name: 'Data Analytics & Business Intelligence with Python & SQL',
        description: 'Transform raw data into strategic insights using Pandas, SQL queries, Tableau visual dashboards, and storytelling.',
        category: 'Technology',
        duration: '10 Weeks',
        trainer: 'Priya Sharma',
        seatsAvailable: 7,
        startDate: '2025-09-15',
        level: 'Beginner',
        certificationBadge: 'SkillSpot Certified Data Analyst',
        prerequisites: ['Basic spreadsheet familiarity (Excel/Google Sheets)'],
        reviews: [],
        modules: [
          {
            id: 'mod-6-1',
            weekNumber: 1,
            title: 'Data Wrangling & Statistical Foundations',
            description: 'Exploratory data analysis, handling missing values, calculating summary statistics with Python.',
            topics: ['Python Data Types', 'Pandas DataFrame manipulation', 'Summary Metrics', 'Data Cleaning'],
            deliverable: 'Automated data cleaning pipeline script for municipal open data',
            durationHours: 14
          },
          {
            id: 'mod-6-2',
            weekNumber: 2,
            title: 'Advanced SQL Querying & Metrics Aggregation',
            description: 'Window functions, CTEs (Common Table Expressions), nested joins, and cohort analysis.',
            topics: ['SQL Joins & Aggregations', 'Window Functions (ROW_NUMBER, RANK)', 'Subqueries & CTEs', 'Cohort Retention'],
            deliverable: 'Multi-table business intelligence report with automated SQL views',
            durationHours: 18
          }
        ]
      }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Jane Doe',
    email: 'jane@innovate.org',
    phone: '415-555-0192',
    role: 'admin',
    ngoId: 'ngo-1'
  },
  {
    id: 'user-admin-2',
    name: 'Emily White',
    email: 'emily@cbu.org',
    phone: '312-555-0188',
    role: 'admin',
    ngoId: 'ngo-2'
  },
  {
    id: 'stu-1',
    name: 'Alex Mercer',
    email: 'alex.mercer@student.org',
    phone: '415-555-9082',
    role: 'student'
  },
  {
    id: 'stu-2',
    name: 'Maya Patel',
    email: 'maya.patel@student.org',
    phone: '312-555-8831',
    role: 'student'
  },
  {
    id: 'stu-3',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@student.org',
    phone: '512-555-4321',
    role: 'student'
  },
  {
    id: 'stu-4',
    name: 'Samantha Reed',
    email: 'sam.reed@student.org',
    phone: '206-555-7712',
    role: 'student'
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  // Alex: completed UX/UI course with a verifiable certificate
  {
    enrollmentId: 'enr-101',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    courseId: 'course-1-2',
    courseName: 'Introduction to UX/UI Design',
    ngoId: 'ngo-1',
    status: 'Completed',
    requestDate: '2025-07-01T10:00:00Z',
    previousExperience: 'Self-taught graphic design hobbies, eager to learn product design systems.',
    reasonForJoining: 'Transitioning into digital product design to work with mission-driven organizations.',
    completedDate: '2025-08-30T17:00:00Z',
    certificateId: 'CERT-SKILLSPOT-2025-8842',
    gradeScore: 'With Distinction (96%)'
  },
  // Alex: approved in Full-Stack
  {
    enrollmentId: 'enr-102',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    courseId: 'course-1-1',
    courseName: 'Full-Stack Web Development',
    ngoId: 'ngo-1',
    status: 'Approved',
    requestDate: '2025-07-20T11:20:00Z',
    previousExperience: 'Basic JavaScript and HTML/CSS understanding.',
    reasonForJoining: 'Wanted to build real web applications from database to responsive user interface.'
  },
  // Maya: Approved in Full-Stack
  {
    enrollmentId: 'enr-103',
    studentId: 'stu-2',
    studentName: 'Maya Patel',
    courseId: 'course-1-1',
    courseName: 'Full-Stack Web Development',
    ngoId: 'ngo-1',
    status: 'Approved',
    requestDate: '2025-07-22T08:45:00Z',
    previousExperience: 'College computer science introductory courses.',
    reasonForJoining: 'Gain project experience for junior software engineering opportunities.'
  },
  // Maya: Completed CNA prep
  {
    enrollmentId: 'enr-104',
    studentId: 'stu-2',
    studentName: 'Maya Patel',
    courseId: 'course-2-1',
    courseName: 'Certified Nursing Assistant (CNA) Prep',
    ngoId: 'ngo-2',
    status: 'Completed',
    requestDate: '2025-06-15T13:00:00Z',
    previousExperience: 'Volunteer at community clinic.',
    reasonForJoining: 'Pass state CNA licensing exam and help community elders.',
    completedDate: '2025-08-10T16:00:00Z',
    certificateId: 'CERT-SKILLSPOT-2025-4190',
    gradeScore: 'High Honors (98%)'
  },
  // Carlos: Pending in Full-Stack
  {
    enrollmentId: 'enr-105',
    studentId: 'stu-3',
    studentName: 'Carlos Mendez',
    courseId: 'course-1-1',
    courseName: 'Full-Stack Web Development',
    ngoId: 'ngo-1',
    status: 'Pending',
    requestDate: '2025-08-28T14:10:00Z',
    previousExperience: 'Built small static websites using Bootstrap.',
    reasonForJoining: 'Looking to upskill to modern React and full-stack cloud workflows.'
  },
  // Samantha: Pending in UX/UI
  {
    enrollmentId: 'enr-106',
    studentId: 'stu-4',
    studentName: 'Samantha Reed',
    courseId: 'course-1-2',
    courseName: 'Introduction to UX/UI Design',
    ngoId: 'ngo-1',
    status: 'Pending',
    requestDate: '2025-08-30T16:40:00Z',
    previousExperience: 'Freelance copywriting and marketing.',
    reasonForJoining: 'Understand UX wireframing and user research to design better apps.'
  },
  // Carlos: Completed in Solar PV Installation
  {
    enrollmentId: 'enr-107',
    studentId: 'stu-3',
    studentName: 'Carlos Mendez',
    courseId: 'course-3-1',
    courseName: 'Solar PV Systems Installation & Electrical Safety',
    ngoId: 'ngo-3',
    status: 'Completed',
    requestDate: '2025-08-15T12:00:00Z',
    previousExperience: 'Apprentice electrician helper.',
    reasonForJoining: 'Specialize in renewable energy and solar installations.',
    completedDate: '2025-09-01T15:30:00Z',
    certificateId: 'CERT-SKILLSPOT-2025-7140',
    gradeScore: 'NABCEP Associate Ready (94%)'
  },
  // Samantha: Completed in Data Analytics
  {
    enrollmentId: 'enr-108',
    studentId: 'stu-4',
    studentName: 'Samantha Reed',
    courseId: 'course-4-1',
    courseName: 'Data Analytics & Business Intelligence with Python & SQL',
    ngoId: 'ngo-4',
    status: 'Completed',
    requestDate: '2025-07-10T09:00:00Z',
    previousExperience: 'Freelance copywriting and marketing.',
    reasonForJoining: 'Transitioning to quantitative business intelligence and SQL analytics.',
    completedDate: '2025-08-25T11:00:00Z',
    certificateId: 'CERT-SKILLSPOT-2025-9204',
    gradeScore: 'Honors with Distinction (96%)'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'stu-1',
    type: 'deadline',
    title: 'Upcoming Workshop Deadline: Sprint 3 API & Database',
    priority: 'urgent',
    message: 'Sprint 3: REST API & SQL Database Milestone is due in 28 hours. Submit your GitHub repository and test suite to maintain certification eligibility.',
    link: '/student-dashboard',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    courseName: 'Full-Stack Web Development',
    courseId: 'course-1-1',
    actionLabel: 'Submit Milestone',
  },
  {
    id: 'notif-2',
    userId: 'stu-1',
    type: 'certificate',
    title: 'Accredited Certificate Issued!',
    priority: 'high',
    message: '🎉 Congratulations! You have completed "Introduction to UX/UI Design". Your verified certificate is ready to download and share!',
    link: '/student-dashboard',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    courseName: 'Introduction to UX/UI Design',
    courseId: 'course-1-2',
    certificateId: 'CERT-TECH-2026-9042',
    actionLabel: 'View Certificate',
  },
  {
    id: 'notif-3',
    userId: 'stu-1',
    type: 'enrollment',
    title: 'Cohort Enrollment Approved',
    priority: 'normal',
    message: 'Your enrollment for "Full-Stack Web Development" at TechForward Foundation has been Approved. Review syllabus and weekly lab schedule.',
    link: '/student-dashboard',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    courseName: 'Full-Stack Web Development',
    courseId: 'course-1-1',
    ngoName: 'TechForward Foundation',
    actionLabel: 'Open Cohort',
  },
  {
    id: 'notif-4',
    userId: 'user-admin-1',
    type: 'enrollment',
    title: 'New Applicant Pending Verification',
    priority: 'normal',
    message: 'Carlos Mendez submitted an enrollment application for "Full-Stack Web Development". Review candidate qualifications.',
    link: '/admin-dashboard',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    courseName: 'Full-Stack Web Development',
    actionLabel: 'Review Application',
  }
];

export const INITIAL_VOCATIONAL_JOBS: import('./types').VocationalJob[] = [
  {
    id: 'job-1',
    title: 'Solar PV Field Technician Apprentice',
    company: 'Helios Clean Energy Partners',
    category: 'Clean Energy',
    type: 'Apprenticeship',
    location: 'Oakland / Bay Area, CA',
    stipendOrSalary: '$22.50 / hr + Safety Gear Stipend',
    description: 'Join our certified commercial solar crew. Work directly under master electricians installing racking, string inverters, and battery storage banks. Tool kit grant provided upon 90-day review.',
    requirements: [
      'Completion of accredited Solar PV or Electrical basics cohort',
      'Comfortable with heights & outdoor ladder work',
      'OSHA-10 or basic electrical safety knowledge'
    ],
    toolGrantIncluded: true,
    postedDate: '2026-08-20',
    contactEmail: 'careers@heliosenergy.org',
    applicantsCount: 7
  },
  {
    id: 'job-2',
    title: 'Junior Frontend Web Developer',
    company: 'CivicTech Collective',
    category: 'Technology',
    type: 'Full-time',
    location: 'Remote / Hybrid (San Francisco, CA)',
    stipendOrSalary: '$65,000 - $75,000 / yr',
    description: 'We build public interest digital tooling for community mutual aid organizations. Looking for an enthusiastic junior coder with hands-on React and TypeScript project experience.',
    requirements: [
      'SkillSpot Verified Full-Stack or Frontend Certificate',
      'Demonstrated portfolio with GitHub or live deployed links',
      'Eagerness to collaborate in team code reviews'
    ],
    toolGrantIncluded: true,
    postedDate: '2026-08-22',
    contactEmail: 'talent@civictech.io',
    applicantsCount: 14
  },
  {
    id: 'job-3',
    title: 'Architectural Woodworking & Joinery Assistant',
    company: 'Bay Craftsmen Guild',
    category: 'Trades & Construction',
    type: 'Apprenticeship',
    location: 'San Jose, CA',
    stipendOrSalary: '$20.00 / hr + Hand-Tool Starter Kit',
    description: 'Hands-on apprentice role crafting bespoke cabinetry, mortise-and-tenon joints, and timber architectural accents. Mentorship provided by 25-year master carpenter.',
    requirements: [
      'Vocational training certificate in Carpentry or Fabrication',
      'Blueprint reading & tape-measure precision',
      'Dedicated safety mindset with power saws'
    ],
    toolGrantIncluded: true,
    postedDate: '2026-08-25',
    contactEmail: 'guild@baycraftsmen.com',
    applicantsCount: 5
  },
  {
    id: 'job-4',
    title: 'Certified Community Health Navigator',
    company: 'WellSpring Health Network',
    category: 'Healthcare',
    type: 'Full-time',
    location: 'Sacramento, CA',
    stipendOrSalary: '$24.00 / hr + Health Benefits',
    description: 'Assist community members with basic triage intake, vital signs measurement, and patient health literacy in bilingual neighborhoods.',
    requirements: [
      'Certified Medical Assistant or Community Health Worker certification',
      'CPR & First Aid certification',
      'Bilingual proficiency is a strong plus'
    ],
    toolGrantIncluded: false,
    postedDate: '2026-08-28',
    contactEmail: 'hr@wellspringnetwork.org',
    applicantsCount: 9
  },
  {
    id: 'job-5',
    title: 'Commis Pastry & Bakery Apprentice',
    company: 'Artisan Hearth Co-op',
    category: 'Culinary Arts',
    type: 'Paid Internship',
    location: 'Berkeley, CA',
    stipendOrSalary: '$18.50 / hr + Daily Meal Allowance',
    description: 'Learn sourdough levain management, viennoiserie lamination, and commercial oven management in a fast-paced community bakery.',
    requirements: [
      'Culinary arts or food preparation fundamentals certificate',
      'ServSafe Food Handler card',
      'Early morning availability (5:00 AM shifts)'
    ],
    toolGrantIncluded: false,
    postedDate: '2026-08-30',
    contactEmail: 'bakery@artisanhearth.coop',
    applicantsCount: 6
  }
];

export const INITIAL_PORTFOLIO_ITEMS: import('./types').StudentPortfolioItem[] = [
  {
    id: 'port-1',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    title: 'Community Food Bank Inventory System',
    category: 'Technology',
    description: 'Designed and deployed an open-source real-time grocery inventory portal using React, Node.js, and barcode scanning for local non-profit food distribution.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    completionDate: '2025-08-20',
    skillsLearned: ['React Hooks', 'Node/Express REST', 'Database Schemas', 'Responsive Tailwind'],
    associatedCourseName: 'Full-Stack Web Development'
  },
  {
    id: 'port-2',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    title: 'Accessible Mobile Health Clinic Wireframes',
    category: 'Technology',
    description: 'Created WCAG AAA compliant design system and high-fidelity interactive Figma prototype for mobile medical triage tracking in rural areas.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    completionDate: '2025-08-28',
    skillsLearned: ['Figma Prototyping', 'Accessibility Audits', 'User Journey Mapping'],
    associatedCourseName: 'Introduction to UX/UI Design'
  }
];

export const INITIAL_EQUIPMENT: import('./types').WorkshopEquipmentItem[] = [
  {
    id: 'eq-1',
    ngoId: 'ngo-1',
    name: 'ThinkPad T14 Vocational Laptop Kit #1',
    category: 'Hardware',
    serialNumber: 'TP-2025-0041',
    status: 'Assigned',
    assignedToStudentId: 'stu-1',
    assignedToStudentName: 'Alex Mercer',
    assignedDate: '2025-08-01',
    condition: 'Good'
  },
  {
    id: 'eq-2',
    ngoId: 'ngo-1',
    name: 'Arduino & Microcontroller Starter Kit',
    category: 'Tool Kit',
    serialNumber: 'ARD-2025-0108',
    status: 'Available',
    condition: 'New'
  },
  {
    id: 'eq-3',
    ngoId: 'ngo-1',
    name: 'Digital Multimeter & Cable Tester Rig',
    category: 'Tool Kit',
    serialNumber: 'DMM-2024-0012',
    status: 'Available',
    condition: 'Good'
  },
  {
    id: 'eq-4',
    ngoId: 'ngo-1',
    name: 'Soldering Workstation & Fume Extractor',
    category: 'Machinery',
    serialNumber: 'SLD-2025-0034',
    status: 'Maintenance',
    condition: 'Fair'
  }
];

export const INITIAL_FORUM_POSTS: import('./types').CourseForumPost[] = [
  {
    id: 'post-1',
    courseId: 'course-1-1',
    authorId: 'user-admin-1',
    authorName: 'Jane Doe (Trainer)',
    authorRole: 'trainer',
    title: '📌 Welcome to Week 3: RESTful API Best Practices & Live Workshop Link',
    content: 'Hello cohort! This week we are diving into Express middleware and token-based authentication. Please ensure you have cloned the starter repository before Wednesday night workshop.',
    createdAt: '2025-08-20T10:00:00Z',
    upvotes: 8,
    isAnnouncement: true,
    replies: [
      {
        id: 'reply-1',
        authorId: 'stu-1',
        authorName: 'Alex Mercer',
        authorRole: 'student',
        content: 'Cloned and npm installed successfully! Excited for the authentication lab.',
        createdAt: '2025-08-20T11:15:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    courseId: 'course-1-1',
    authorId: 'stu-2',
    authorName: 'Maya Patel',
    authorRole: 'student',
    title: 'Question on asynchronous error handlers in Express routes',
    content: 'When catching an error in an async Express controller, should we pass it to next(err) or handle it inside a global try/catch wrapper? Looking for standard industry patterns.',
    createdAt: '2025-08-22T14:20:00Z',
    upvotes: 4,
    isAnnouncement: false,
    replies: [
      {
        id: 'reply-2',
        authorId: 'user-admin-1',
        authorName: 'Jane Doe (Trainer)',
        authorRole: 'trainer',
        content: 'Great question Maya! In Express 5, errors thrown inside async route handlers are caught automatically. In Express 4, wrapping in express-async-handler or calling next(err) is the cleanest approach.',
        createdAt: '2025-08-22T15:05:00Z'
      }
    ]
  }
];

export const INITIAL_MOCK_INTERVIEW_QUESTIONS: MockInterviewQuestion[] = [
  {
    id: 'mock-1',
    tradeCategory: 'Clean Energy & Solar PV',
    scenarioTitle: 'High-Voltage Solar Inverter Diagnostics & Lockout/Tagout',
    difficulty: 'Journeyman',
    question: 'A commercial customer reports that their 50kW grid-tied string inverter went into ground-fault trip (Isolation Fault error 103). Walk me through your step-by-step diagnostic process, the specific PPE you require, and the OSHA lockout/tagout (LOTO) protocols you must perform before touching any DC cabling.',
    context: 'Field technician role at a solar installation enterprise. Evaluates electrical safety protocols, use of digital multimeters/insulation megohm testers, and knowledge of NFPA 70E standards.',
    keySafetyPoints: [
      'Category III/IV 1000V rated insulated multimeter & arc flash rated face shield with leather-over-rubber gloves',
      'Verify zero voltage (live-dead-live testing method) on both DC and AC disconnects',
      'Execute LOTO on AC breaker and DC rapid shutdown switch',
      'Perform positive-to-ground and negative-to-ground isolation resistance check using Megger'
    ],
    sampleModelAnswer: 'First, I ensure full NFPA 70E compliance by donning Class 0 1000V insulated gloves with leather protectors and safety glasses. I notify the site manager and initiate LOTO on the AC utility disconnect and the main DC disconnect switch. Using a verified CAT III 1000V multimeter, I test a known live source, verify zero energy on the disconnected terminal blocks, and re-test the live source (live-dead-live). Then, I visually inspect for damaged MC4 connectors or water ingress. I disconnect individual PV strings and perform a high-voltage insulation resistance test (Megger test) between positive-to-ground and negative-to-ground to isolate which string has insulation breakdown, ensuring not to reconnect until all faults are cleared and logged.'
  },
  {
    id: 'mock-2',
    tradeCategory: 'Welding & Structural Metal Fabrication',
    scenarioTitle: 'MIG/GMAW Porosity Troubleshooting on Structural Beams',
    difficulty: 'Apprentice',
    question: 'During a quality control inspection of a horizontal fillet weld on structural I-beams, the inspector flags internal and surface porosity along a 6-inch bead. What are the top three root causes of this defect, and how do you remediate the weld to meet AWS D1.1 structural welding code?',
    context: 'Structural steel workshop fabrication assessment. Evaluates understanding of shielding gas coverage, mill scale contamination, and mechanical defect repair.',
    keySafetyPoints: [
      'Shielding gas flow rate verification (25-35 CFH 75/25 Argon/CO2)',
      'Angle grinder surface prep to remove all oil, rust, mill scale within 1 inch of joint',
      'Mechanical grinding to completely excavate porosity cavities down to clean parent metal before re-welding'
    ],
    sampleModelAnswer: 'The three most common causes of porosity in GMAW are shielding gas draft or improper flow rate (leaks, clogged nozzle, or draught blowing away gas), surface contamination like mill scale, moisture, or grease on the parent metal, and excessive torch travel angle or stickout exceeding 1/2 inch. Under AWS D1.1, porosity cannot simply be capped over. I must take an angle grinder with a cutting or gouging wheel and mechanically grind out the entire porous section down to sound base metal, visually inspecting with dye penetrant or magnifying glass to confirm no voids remain. I verify gas flow at 30 CFH, clean the joint 1 inch back with a wire wheel, check wire feed tension, and re-weld with correct pre-heat and gun travel angle.'
  },
  {
    id: 'mock-3',
    tradeCategory: 'Carpentry & Architectural Millwork',
    scenarioTitle: 'Custom Cabinetry Scribe & Non-Plumb Wall Remediation',
    difficulty: 'Journeyman',
    question: 'You are installing a built-in floor-to-ceiling cabinet run in an older historic building where the drywall is out of plumb by 3/4 inch over 8 feet and the hardwood floor has a 1/2 inch dip. How do you accurately level, shim, and scribe the face frames and kickplates so the finished install looks seamless without large caulking gaps?',
    context: 'Finish carpentry interview. Evaluates layout geometry, scribing tool techniques, leveling benchmarks, and client aesthetic standards.',
    keySafetyPoints: [
      'Establish a laser level benchmark line around the entire perimeter before cutting',
      'Shim under carcass base only at structural joist bearing points',
      'Use compass scribe or AccuScribe tool with masking tape to avoid chipping wood veneer'
    ],
    sampleModelAnswer: 'I begin by shooting a 360-degree laser level around the room to find the highest point in the floor. That becomes my reference zero benchmark. I build a separate leveling ladder-frame kickbase, shimming it perfectly level and planar before setting the upper cabinets. For the wall out-of-plumb by 3/4 inch, I leave a 1-inch sacrificial scribe stile on the outermost face frame. I clamp the cabinet dead plumb against the high point of the wall, set my scribe compass to the widest gap (3/4 inch), and trace the exact wall contour down the scribe strip backed with painter tape. Using a block plane, jigsaw with down-cut blade, or track saw beveled slightly inward by 2 degrees for a back-bevel, I cut to the line for an airtight, zero-gap fit against the uneven plaster.'
  },
  {
    id: 'mock-4',
    tradeCategory: 'Software Engineering & Web Systems',
    scenarioTitle: 'Production API Performance Degradation & Memory Leak',
    difficulty: 'Master Tech',
    question: 'A high-traffic Node.js production service begins experiencing CPU spikes up to 98% and response times degrading from 50ms to 4500ms under steady load. How do you systematically triage whether this is a database connection pool exhaustion issue, an unindexed query, or a V8 heap memory leak?',
    context: 'Senior web developer interview. Evaluates observability, heap profiling, SQL query plans, and incident response.',
    keySafetyPoints: [
      'Check APM metrics (p95 latency, event loop lag, RSS memory vs heap total)',
      'Generate V8 heap snapshot and flame graph without taking service offline',
      'Inspect database slow query logs and active connection pool utilization'
    ],
    sampleModelAnswer: 'First, I examine the telemetry metrics across three key signals: V8 event loop lag, process RSS memory versus heap used, and database connection pool saturation. If memory climbs monotonically without garbage collection recovering it, I trigger an on-demand heap snapshot via inspector or clinic.js to identify retained closures or uncleaned event listeners. If heap is healthy but event loop lag is spiking, I inspect slow query logs with EXPLAIN ANALYZE to detect unindexed sequential table scans locking worker threads. Concurrently, I verify connection pool queue times—if requests are waiting 3+ seconds to acquire a connection, I check for unclosed connections in error branches or expand pool capacity while preventing cascading failures with circuit breakers.'
  },
  {
    id: 'mock-5',
    tradeCategory: 'Healthcare & Clinical Nursing Support',
    scenarioTitle: 'Post-Operative Acute Hypotension & Patient Fall Risk',
    difficulty: 'Journeyman',
    question: 'A 68-year-old post-op hip replacement patient presses the call bell complaining of sudden dizziness and cold clammy skin when attempting to stand unassisted. Describe your immediate triage sequence, vital sign verification, communication with the charge nurse, and fall prevention documentation under HIPAA.',
    context: 'Clinical nursing assistant / practical nurse interview. Evaluates clinical instinct, orthostatic hypotension response, and patient safety protocols.',
    keySafetyPoints: [
      'Gently ease patient back to safe supine/semi-Fowler position without pulling on operative hip',
      'Immediate vital signs assessment (manual BP, pulse, pulse oximetry, skin turgor)',
      'Activate emergency call button for charge nurse assistance without leaving bedside',
      'Document objective vitals, time of incident, and incident remediation in EHR'
    ],
    sampleModelAnswer: 'My immediate priority is patient safety and preventing a catastrophic fall. I immediately ease the patient back into bed into a semi-Fowler position with knees slightly flexed to avoid hip dislocation. I hit the emergency call light for the charge nurse while staying at the bedside. I take a manual blood pressure and radial pulse, checking for orthostatic hypotension, along with pulse oximetry to rule out hypoxia. I reassure the patient calmly and elevate the bed rails according to policy. When the RN arrives, I deliver a concise SBAR (Situation, Background, Assessment, Recommendation) handover with exact vitals. Once stabilized, I document the event objectively in the EHR, initiate heightened fall-risk precautions, and re-check vitals every 15 minutes.'
  },
  {
    id: 'mock-6',
    tradeCategory: 'HVAC/R & Climate Control Systems',
    scenarioTitle: 'Heat Pump Refrigerant Circuit Subcooling & TXV Restriction',
    difficulty: 'Journeyman',
    question: 'A commercial multi-split heat pump unit in cooling mode displays low suction pressure, normal-to-high head pressure, and high subcooling (18°F above manufacturer spec) with very high superheat. Walk through your manifold gauge analysis, EPA 608 recovery compliance, and step-by-step diagnosis of a restricted Thermal Expansion Valve (TXV).',
    context: 'HVAC service technician interview. Evaluates thermodynamic cycle understanding, gauge interpretation, and EPA refrigerant handling.',
    keySafetyPoints: [
      'Digital manifold gauge calibration and EPA 608 certified recovery equipment',
      'Verify airflow across evaporator coil and clean filter before refrigerant diagnosis',
      'Insulate sensing bulb and check bulb charge before condemning TXV power head'
    ],
    sampleModelAnswer: 'High subcooling combined with high superheat and low suction pressure is the classic textbook signature of a liquid line restriction rather than a low refrigerant charge. Because subcooling is elevated, the condenser is stacking liquid refrigerant that cannot pass through the metering device. First, I verify that the evaporator air filter and blower wheel are clean to eliminate airflow starvation. Next, I inspect the liquid line filter drier for a temperature drop across the inlet and outlet using a calibrated dual-clamp digital thermometer; an unprompted temperature drop greater than 2°F indicates a clogged drier. If the drier is clear, the restriction is at the TXV screen or power head. I inspect the TXV sensing bulb to ensure it is tightly clamped at the 10 or 2 o clock position on a clean horizontal suction line and insulated. If the bulb has lost charge, I recover the refrigerant into a certified EPA 608 recovery cylinder, pull a deep vacuum to under 500 microns, replace the TXV and filter drier, weigh in the virgin charge to factory nameplate specs, and verify subcooling within 10-12°F.'
  },
  {
    id: 'mock-7',
    tradeCategory: 'Automotive Technology & EV Powertrains',
    scenarioTitle: 'High-Voltage Traction Battery Manual Service Disconnect (MSD)',
    difficulty: 'Master Tech',
    question: 'A customer brings in a battery electric vehicle (BEV) following a minor undercarriage impact with an illuminated high-voltage isolation fault on the dash. What is the mandatory step-by-step de-energization procedure, 1000V PPE protocol, and proof of zero electrical potential before you drop the battery pack for inspection?',
    context: 'Electric vehicle master technician interview. Evaluates NFPA 70E / SAE J2344 EV safety protocols and high-voltage isolation.',
    keySafetyPoints: [
      'Class 0 1000V rated insulated electrical safety gloves with outer leather work protectors',
      'Removal and physical padlock containment of the Manual Service Disconnect (MSD) plug',
      'Allow minimum 10-minute capacitor bleed-off period for inverter DC link',
      'Live-Dead-Live probe verification at high-voltage test ports under 12V threshold'
    ],
    sampleModelAnswer: 'High-voltage electric vehicle packs carry 400V to 800V DC which is lethal. Before touching the vehicle, I cordon off a 3-meter safety perimeter with high-voltage warning cones. I inspect my Class 0 1000V gloves with an air-leak test and don full arc-rated eye and face protection. I turn off the ignition, remove the key fob 15 meters away, and disconnect the 12V auxiliary battery negative terminal to disable high-voltage contactor closing logic. Then I access and remove the Manual Service Disconnect (MSD) plug and lock it inside a designated LOTO lockout box in my possession. I wait a mandatory 10 minutes for the inverter capacitor discharge circuit to bleed off residual DC link energy. Using a CAT IV 1000V meter verified against a known test bench, I test between high-voltage positive and chassis ground, negative and chassis ground, and positive to negative—confirming voltage is strictly 0V (under 12V standard). Only then is the pack safe for mechanical hoist unbolting.'
  },
  {
    id: 'mock-8',
    tradeCategory: 'Trade Leadership & Job Site Management',
    scenarioTitle: 'General Contractor Schedule Acceleration & Safety Dispute',
    difficulty: 'Journeyman',
    question: 'On a commercial high-rise site, the general contractor demands your electrical crew pull feeders through a wet underground conduit corridor while overhead drywallers are working without catch nets, threatening penalty back-charges if you delay the milestone. How do you handle this site conflict, protect your apprentice crew, and document OSHA Stop-Work Authority while keeping client relations constructive?',
    context: 'Journeyman foreman / project lead interview. Evaluates OSHA Stop-Work Authority, legal compliance, de-escalation, and written change documentation.',
    keySafetyPoints: [
      'Exercise immediate OSHA Stop-Work Authority regarding active overhead drop hazards',
      'De-escalate verbally by focusing on shared liability and risk prevention rather than blame',
      'Propose alternative sequenced work areas so progress continues without safety violations',
      'Issue formal written Notice of Delay / Site Hazard condition to general contractor superintendent'
    ],
    sampleModelAnswer: 'Under OSHA Section 5(a)(1) General Duty Clause and company policy, as foreman I have a non-negotiable legal and moral obligation to exercise Stop-Work Authority whenever an imminent hazard exists. Having my apprentices work directly under overhead drywallers without toe-boards, catch nets, or hardhat drop zones is an unacceptable struck-by hazard, compounded by standing water near electrical pulls. I speak directly with the GC superintendent away from the crew. I de-escalate by saying: "We both want this phase delivered on schedule and without an OSHA shutdown or worker injury that halts the entire job. Let us protect both our companies." I propose an immediate productive solution: I redirect my crew to dress the distribution panels in the dry electrical vault for the next four hours while the drywall crew finishes and nets the corridor. Concurrently, I send a polite, factual written email and daily site log detailing the hazard condition, the temporary reassignment, and the exact revised timeline to prevent frivolous liquidated damages.'
  }
];

export const INITIAL_EMPLOYER_PROFILES: EmployerProfile[] = [
  {
    id: 'emp-1',
    companyName: 'Apex Solar & Clean Energy Grid',
    industry: 'Clean Energy & Electrical',
    location: 'Austin, TX & San Francisco, CA',
    website: 'https://apexsolargrid.com',
    contactPerson: 'David Vance (Talent Lead)',
    contactEmail: 'careers@apexsolargrid.com',
    verifiedPartner: true,
    activeOpenings: 6,
  },
  {
    id: 'emp-2',
    companyName: 'Ironclad Metal Works & Structural Fab',
    industry: 'Welding & Metallurgy',
    location: 'Chicago, IL',
    website: 'https://ironcladfab.org',
    contactPerson: 'Elena Rostova (Shop Superintendent)',
    contactEmail: 'hiring@ironcladfab.org',
    verifiedPartner: true,
    activeOpenings: 4,
  },
  {
    id: 'emp-3',
    companyName: 'TimberCraft Architectural Millwork',
    industry: 'Carpentry & Construction',
    location: 'Portland, OR',
    website: 'https://timbercraftmill.com',
    contactPerson: 'Marcus Thorne (Master Carpenter)',
    contactEmail: 'join@timbercraftmill.com',
    verifiedPartner: true,
    activeOpenings: 3,
  },
  {
    id: 'emp-4',
    companyName: 'NextWave Cloud Systems',
    industry: 'Software & Information Technology',
    location: 'Remote / Seattle, WA',
    website: 'https://nextwavesystems.io',
    contactPerson: 'Sarah Jenkins (VP Engineering)',
    contactEmail: 'recruiting@nextwavesystems.io',
    verifiedPartner: true,
    activeOpenings: 5,
  }
];

export const INITIAL_PLACEMENT_RECORDS: PlacementRecord[] = [
  {
    id: 'plc-1',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    tradeCategory: 'Technology',
    certificateId: 'CERT-INNOVATE-001',
    companyName: 'NextWave Cloud Systems',
    jobTitle: 'Junior Cloud Application Developer',
    startingHourlyWage: '$34.50 / hr',
    startDate: '2025-09-15',
    retentionMilestone: '6-Month Retained',
    donorReported: true,
    notes: 'Promoted to mid-level sprint contributor after stellar Q4 performance.'
  },
  {
    id: 'plc-2',
    studentId: 'stu-2',
    studentName: 'Maya Patel',
    tradeCategory: 'Clean Energy',
    certificateId: 'CERT-GREEN-002',
    companyName: 'Apex Solar & Clean Energy Grid',
    jobTitle: 'Commercial PV Commissioning Specialist',
    startingHourlyWage: '$29.00 / hr',
    startDate: '2025-10-01',
    retentionMilestone: '3-Month Retained',
    donorReported: true,
    notes: 'Surpassed 100kW installation milestone with zero OSHA safety incidents.'
  },
  {
    id: 'plc-3',
    studentId: 'stu-3',
    studentName: 'Devon Clarke',
    tradeCategory: 'Welding & Metal',
    certificateId: 'CERT-ECOBUILD-003',
    companyName: 'Ironclad Metal Works',
    jobTitle: 'Structural GMAW Apprentice',
    startingHourlyWage: '$26.50 / hr',
    startDate: '2025-11-10',
    retentionMilestone: 'Active (Month 1-2)',
    donorReported: false,
    notes: 'Awarded shop starter safety award during first monthly review.'
  }
];

export const INITIAL_WORKSHOP_FACILITIES: WorkshopFacility[] = [
  {
    id: 'fac-1',
    name: 'San Francisco Tech & Fabrication Commons',
    type: 'Community Maker Space',
    city: 'San Francisco, CA',
    location: 'SoMa Innovation District',
    address: '555 Mission St, San Francisco, CA 94105',
    coordinates: { lat: 37.7885, lng: -122.4005 },
    specializedMachinery: [
      'Formlabs SLA 3D Resin Printers',
      'Epilog Fusion Pro 48 Laser Cutter (120W)',
      'SMD Hot Air Rework Stations',
      'Dual-Trace 200MHz Digital Oscilloscopes'
    ],
    availableToolsCount: 140,
    operatingHours: 'Mon - Sat: 8:00 AM - 9:00 PM',
    contactPhone: '415-555-0192',
    contactEmail: 'makerlab@innovate.org',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    safetyOrientationRequired: true,
  },
  {
    id: 'fac-2',
    name: 'Austin Clean Energy & Electrical Lab',
    type: 'Training Center',
    city: 'Austin, TX',
    location: 'East Austin Vocational Park',
    address: '1024 E 7th St, Austin, TX 78702',
    coordinates: { lat: 30.2672, lng: -97.7331 },
    specializedMachinery: [
      '50kW Solar Inverter Training Test Bench',
      'Lithium Iron Phosphate Battery Storage Rack',
      'Level-2 Commercial EV Charger Diagnostic Bay',
      'Megger High-Voltage Insulation Tester'
    ],
    availableToolsCount: 95,
    operatingHours: 'Mon - Fri: 7:30 AM - 7:00 PM, Sat: 9:00 AM - 2:00 PM',
    contactPhone: '512-555-4821',
    contactEmail: 'solarbay@greenvocational.org',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500',
    safetyOrientationRequired: true,
  },
  {
    id: 'fac-3',
    name: 'Chicago Heavy Metal & Structural Forge',
    type: 'Fabrication Lab',
    city: 'Chicago, IL',
    location: 'Pilsen Industrial Corridor',
    address: '1840 S Blue Island Ave, Chicago, IL 60608',
    coordinates: { lat: 41.8569, lng: -87.6622 },
    specializedMachinery: [
      'Miller Multimatic 220 AC/DC TIG & MIG Rig',
      'Hypertherm Powermax 45 Plasma Cutter',
      'Scotchman 50-Ton Hydraulic Ironworker',
      'PEXTO 48-Inch Sheet Metal Slip Roller'
    ],
    availableToolsCount: 180,
    operatingHours: 'Tue - Sun: 9:00 AM - 8:00 PM',
    contactPhone: '312-555-7319',
    contactEmail: 'forge@ecobuildtrades.org',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500',
    safetyOrientationRequired: true,
  },
  {
    id: 'fac-4',
    name: 'Portland Community Tool Lending Library',
    type: 'Public Tool Lending Library',
    city: 'Portland, OR',
    location: 'Central Eastside',
    address: '615 SE Alder St, Portland, OR 97214',
    coordinates: { lat: 45.5175, lng: -122.6593 },
    specializedMachinery: [
      'Powermatic 15-Inch Heavy Duty Wood Planer',
      'SawStop Industrial 5HP Cabinet Table Saw',
      'Laguna 1412 Woodworking Bandsaw',
      'Festool Domino Tenon Joiner System'
    ],
    availableToolsCount: 310,
    operatingHours: 'Wed - Sun: 10:00 AM - 6:00 PM',
    contactPhone: '503-555-9204',
    contactEmail: 'borrow@portlandtoollibrary.org',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500',
    safetyOrientationRequired: false,
  }
];

export const INITIAL_MACHINE_RESERVATIONS: MachineReservation[] = [
  {
    id: 'res-1',
    facilityId: 'fac-1',
    facilityName: 'San Francisco Tech & Fabrication Commons',
    machineName: 'Epilog Fusion Pro 48 Laser Cutter (120W)',
    studentId: 'stu-1',
    studentName: 'Alex Mercer',
    reservationDate: '2025-09-12',
    timeSlot: 'Morning (9:00 AM - 1:00 PM)',
    purpose: 'Cutting acrylic faceplates and enclosures for IoT sensor capstone.',
    safetyCertified: true,
    status: 'Confirmed',
    bookedAt: '2025-09-02T10:30:00Z'
  },
  {
    id: 'res-2',
    facilityId: 'fac-2',
    facilityName: 'Austin Clean Energy & Electrical Lab',
    machineName: '50kW Solar Inverter Training Test Bench',
    studentId: 'stu-2',
    studentName: 'Maya Patel',
    reservationDate: '2025-09-15',
    timeSlot: 'Afternoon (2:00 PM - 6:00 PM)',
    purpose: 'Simulating grid frequency fluctuation and battery islanding scenarios.',
    safetyCertified: true,
    status: 'Confirmed',
    bookedAt: '2025-09-03T14:15:00Z'
  }
];

export const INITIAL_INTERVIEW_INVITATIONS: InterviewInvitation[] = [
  {
    id: 'inv-1',
    employerId: 'emp-1',
    employerName: 'Apex Solar & Clean Energy Grid',
    studentId: 'stu-2',
    studentName: 'Maya Patel',
    tradeField: 'Clean Energy',
    positionTitle: 'Commercial PV Commissioning Specialist',
    interviewDate: '2025-09-20',
    message: 'Hello Maya, your capstone inverter project and 96% honors score caught our eye. We would love to interview you for our Austin solar commissioning crew.',
    status: 'Accepted',
    sentAt: '2025-09-04T09:00:00Z'
  }
];
