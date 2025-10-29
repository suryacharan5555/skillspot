import { NGO } from './types';

export const NGOS: NGO[] = [
  {
    id: 'hope-foundation',
    name: 'Hope Foundation',
    logoUrl: 'https://picsum.photos/seed/hope/200',
    bannerUrl: 'https://picsum.photos/seed/hope-banner/1200/400',
    location: 'Mumbai, India',
    category: 'Digital Literacy',
    type: 'Women Empowerment',
    description: 'Empowering underprivileged women with essential digital skills for a brighter future.',
    missionStatement: 'To bridge the digital divide by providing quality education and skill development opportunities to women from marginalized communities.',
    contact: {
      person: 'Aisha Sharma',
      email: 'contact@hopefoundation.org',
      website: 'hopefoundation.org',
    },
    courses: [
      { id: 'hf-01', name: 'Basic Computer Skills', description: 'Learn the fundamentals of computer operation, MS Office, and internet usage.', duration: '6 Weeks', trainer: 'Ravi Kumar', seatsAvailable: 15, category: 'Technical' },
      { id: 'hf-02', name: 'Introduction to Graphic Design', description: 'Explore the basics of design principles and tools like Canva.', duration: '8 Weeks', trainer: 'Priya Mehta', seatsAvailable: 10, category: 'Creative' },
      { id: 'hf-03', name: 'Digital Marketing Essentials', description: 'Understand social media marketing, SEO, and content creation.', duration: '10 Weeks', trainer: 'Amit Singh', seatsAvailable: 5, category: 'Marketing' },
    ],
  },
  {
    id: 'gram-vikas',
    name: 'Gram Vikas',
    logoUrl: 'https://picsum.photos/seed/gram/200',
    bannerUrl: 'https://picsum.photos/seed/gram-banner/1200/400',
    location: 'Bhubaneswar, Odisha',
    category: 'Rural Upskilling',
    type: 'Rural Upskilling',
    description: 'Fostering sustainable livelihoods in rural communities through vocational training.',
    missionStatement: 'To empower rural communities with practical skills and knowledge, enabling them to achieve economic self-sufficiency and sustainable development.',
    contact: {
      person: 'Suresh Patnaik',
      email: 'info@gramvikas.net',
      website: 'gramvikas.net',
    },
    courses: [
      { id: 'gv-01', name: 'Organic Farming Techniques', description: 'Learn sustainable and profitable organic farming methods.', duration: '12 Weeks', trainer: 'Meena Das', seatsAvailable: 25, category: 'Vocational' },
      { id: 'gv-02', name: 'Handicrafts & Weaving', description: 'Master traditional weaving techniques to create marketable products.', duration: '16 Weeks', trainer: 'Arjun Gowda', seatsAvailable: 8, category: 'Vocational' },
      { id: 'gv-03', name: 'Solar Panel Installation', description: 'Training on installing and maintaining solar energy systems for rural homes.', duration: '8 Weeks', trainer: 'Sunita Reddy', seatsAvailable: 12, category: 'Technical' },
    ],
  },
  {
    id: 'tech-for-all',
    name: 'Tech for All',
    logoUrl: 'https://picsum.photos/seed/tech/200',
    bannerUrl: 'https://picsum.photos/seed/tech-banner/1200/400',
    location: 'Bangalore, Karnataka',
    category: 'IT Skills',
    type: 'Digital Literacy',
    description: 'Providing free coding and IT education to aspiring youth from all backgrounds.',
    missionStatement: 'To create a new generation of tech leaders by making high-quality IT education accessible to everyone, regardless of their financial background.',
    contact: {
      person: 'Vikram Iyer',
      email: 'reach@techforall.io',
      website: 'techforall.io',
    },
    courses: [
      { id: 'tfa-01', name: 'Web Development Bootcamp', description: 'A comprehensive course on HTML, CSS, JavaScript, and React.', duration: '24 Weeks', trainer: 'Deepika Rao', seatsAvailable: 7, category: 'Technical' },
      { id: 'tfa-02', name: 'Python for Data Science', description: 'Learn Python programming for data analysis and visualization.', duration: '18 Weeks', trainer: 'Anand Krishnan', seatsAvailable: 0, category: 'Technical' },
      { id: 'tfa-03', name: 'Cloud Computing with AWS', description: 'Get certified with foundational knowledge of Amazon Web Services.', duration: '12 Weeks', trainer: 'Fatima Khan', seatsAvailable: 9, category: 'Technical' },
    ],
  },
  {
    id: 'kala-kendra',
    name: 'Kala Kendra',
    logoUrl: 'https://picsum.photos/seed/kala/200',
    bannerUrl: 'https://picsum.photos/seed/kala-banner/1200/400',
    location: 'Jaipur, Rajasthan',
    category: 'Vocational',
    type: 'Art & Craft',
    description: 'Preserving and promoting traditional Indian arts and crafts through skill training.',
    missionStatement: 'To be a center of excellence for traditional arts, empowering artisans with the skills and market access needed to sustain their craft for generations.',
    contact: {
      person: 'Rajeshwari Singh',
      email: 'connect@kalakendra.org',
      website: 'kalakendra.org',
    },
    courses: [
      { id: 'kk-01', name: 'Pottery and Ceramics', description: 'From clay preparation to wheel throwing and glazing techniques.', duration: '10 Weeks', trainer: 'Om Prakash', seatsAvailable: 10, category: 'Creative' },
      { id: 'kk-02', name: 'Block Printing', description: 'Learn the art of traditional Rajasthani block printing on textiles.', duration: '6 Weeks', trainer: 'Gita Devi', seatsAvailable: 15, category: 'Creative' },
      { id: 'kk-03', name: 'Jewelry Making', description: 'Craft beautiful jewelry using traditional methods and materials.', duration: '12 Weeks', trainer: 'Karan Soni', seatsAvailable: 4, category: 'Creative' },
    ],
  }
];

export const NGO_TYPES = Array.from(new Set(NGOS.map(ngo => ngo.type)));
export const LOCATIONS = Array.from(new Set(NGOS.map(ngo => ngo.location)));
export const COURSE_CATEGORIES = ['Technical', 'Vocational', 'Creative', 'Marketing'];