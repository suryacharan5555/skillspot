import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import { NGO, Course, TenantBranding, TenantSettings } from '../types';
import { dispatchRealtimeNotification } from '../services/realtimeNotificationService';
import {
  Building2,
  Sparkles,
  Palette,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Check,
  X,
  Eye,
  BookOpen,
  Users,
  Lock,
  ChevronRight,
  Plus,
  Trash2,
  Compass,
  Sun,
  Zap,
  Heart,
  Wrench,
  Cpu,
  Code,
  Flame,
  Utensils,
  BarChart3,
  ExternalLink,
  Copy,
} from 'lucide-react';

interface RegisterNgoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisteredSuccess?: (adminEmail: string, ngoId: string) => void;
  isFullPage?: boolean;
}

// Curated Branding Color Presets
const BRAND_COLOR_PRESETS = [
  { label: 'Electric Blue', hex: '#2563EB', accent: '#10B981', bgGradient: 'from-blue-600 via-indigo-600 to-cyan-500' },
  { label: 'Forest Emerald', hex: '#059669', accent: '#14B8A6', bgGradient: 'from-emerald-600 via-teal-600 to-green-600' },
  { label: 'Royal Amethyst', hex: '#7C3AED', accent: '#EC4899', bgGradient: 'from-purple-600 via-violet-600 to-indigo-600' },
  { label: 'Sunrise Amber', hex: '#D97706', accent: '#F59E0B', bgGradient: 'from-amber-600 via-orange-600 to-yellow-500' },
  { label: 'Crimson Spark', hex: '#E11D48', accent: '#F43F5E', bgGradient: 'from-rose-600 via-pink-600 to-red-600' },
  { label: 'Oceanic Teal', hex: '#0D9488', accent: '#06B6D4', bgGradient: 'from-teal-600 via-cyan-600 to-emerald-500' },
  { label: 'Indigo Midnight', hex: '#4F46E5', accent: '#818CF8', bgGradient: 'from-indigo-700 via-purple-700 to-slate-800' },
  { label: 'Modern Slate', hex: '#334155', accent: '#38BDF8', bgGradient: 'from-slate-700 via-gray-800 to-zinc-900' },
];

// Curated Cover Banner Presets
const PRESET_COVERS = [
  {
    label: 'Modern Tech & Maker Lab',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Clean Energy & Solar PV Center',
    category: 'Clean Energy',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Woodworking & Precision Carpentry',
    category: 'Carpentry',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Clinical Skills & Healthcare Ward',
    category: 'Healthcare',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Robotics & Industrial Automation',
    category: 'Robotics',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Creative Media & Digital Design',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&auto=format&fit=crop&q=80',
  },
];

// Curated Logo Presets
const PRESET_LOGOS = [
  {
    label: 'Technical Academy',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Green Future Lab',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Clinical Health Institute',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Guild of Precision Trades',
    url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Mechatronics Hub',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sustainable Crafts',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80',
  },
];

// Curated Primary Vocational Skill Categories
interface SkillCategoryOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  suggestedCourse: {
    name: string;
    description: string;
    duration: string;
  };
}

const DEFAULT_SKILL_CATEGORIES: SkillCategoryOption[] = [
  {
    id: 'tech-software',
    name: 'Software & Web Engineering',
    icon: '💻',
    description: 'Full-stack web apps, cloud architecture, TypeScript, and modern backend services.',
    suggestedCourse: {
      name: 'Full-Stack Web Development & Cloud Services',
      description: 'Hands-on training in modern React, Node.js, RESTful APIs, and cloud deployments.',
      duration: '12 Weeks',
    },
  },
  {
    id: 'clean-energy',
    name: 'Clean Energy & Solar PV Technologies',
    icon: '⚡',
    description: 'Solar PV installation, microinverters, battery energy storage, and NEC electrical codes.',
    suggestedCourse: {
      name: 'Commercial Solar PV & Battery Storage Specialist',
      description: 'Comprehensive electrical theory, rooftop solar mounting, inverter wiring, and grid interconnection.',
      duration: '10 Weeks',
    },
  },
  {
    id: 'healthcare-trades',
    name: 'Healthcare & Clinical Nursing Support',
    icon: '🏥',
    description: 'Patient care, vitals measurement, HIPAA compliance, phlebotomy, and state board licensing.',
    suggestedCourse: {
      name: 'Certified Nursing Assistant (CNA) & Clinical Foundations',
      description: 'Patient bedside techniques, infection control, medical ethics, and clinical externship prep.',
      duration: '8 Weeks',
    },
  },
  {
    id: 'precision-carpentry',
    name: 'Precision Carpentry & Sustainable Construction',
    icon: '🛠️',
    description: 'Blueprint reading, framing, architectural joinery, tool calibration, and green building standards.',
    suggestedCourse: {
      name: 'Precision Carpentry & Commercial Framing Lab',
      description: 'Master structural framing, custom cabinetry, material estimation, and job-site safety.',
      duration: '8 Weeks',
    },
  },
  {
    id: 'robotics-automation',
    name: 'Industrial Robotics & CNC Automation',
    icon: '🤖',
    description: 'PLC programming, CNC multi-axis milling, industrial sensor integration, and predictive maintenance.',
    suggestedCourse: {
      name: 'Industrial Robotics & Automated Manufacturing Technician',
      description: 'G-Code scripting, robotic arm articulation, pneumatics, and real-time factory sensors.',
      duration: '12 Weeks',
    },
  },
  {
    id: 'electrical-trades',
    name: 'Electrical Wiring & Smart Building Automation',
    icon: '🔌',
    description: 'Commercial conduit bending, low-voltage cabling, smart breaker panels, and safety protocols.',
    suggestedCourse: {
      name: 'Commercial Electrical Wiring & Smart Building Systems',
      description: 'Hands-on conduit bending, three-phase power, smart building IoT controls, and OSHA certification.',
      duration: '10 Weeks',
    },
  },
  {
    id: 'creative-design',
    name: 'Creative Media, UI/UX & Digital Design',
    icon: '🎨',
    description: 'Design systems, Figma auto-layout, 3D product prototyping, and user experience research.',
    suggestedCourse: {
      name: 'Digital Product Design (UI/UX) & Prototyping Masterclass',
      description: 'Learn user journey mapping, high-fidelity interaction design, usability testing, and design systems.',
      duration: '8 Weeks',
    },
  },
  {
    id: 'automotive-mobility',
    name: 'Automotive Systems & Electric Mobility',
    icon: '🚗',
    description: 'Electric vehicle powertrains, regenerative braking, OBD-II diagnostics, and battery management.',
    suggestedCourse: {
      name: 'Electric Vehicle (EV) Powertrain & Diagnostic Specialist',
      description: 'High-voltage safety protocols, EV battery diagnostic scanning, inverter testing, and suspension.',
      duration: '12 Weeks',
    },
  },
  {
    id: 'culinary-hospitality',
    name: 'Commercial Culinary & Food Operations',
    icon: '🍳',
    description: 'Professional kitchen brigade, ServSafe management, knife mastery, and culinary chemistry.',
    suggestedCourse: {
      name: 'Professional Culinary Arts & Kitchen Brigade Operations',
      description: 'Production kitchen workflows, sanitation compliance, food cost estimation, and knife skills.',
      duration: '8 Weeks',
    },
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics & Business Intelligence',
    icon: '📊',
    description: 'SQL queries, business dashboard modeling, ETL pipelines, and statistical analysis.',
    suggestedCourse: {
      name: 'Practical Business Intelligence & Data Modeling',
      description: 'SQL database querying, automated dashboard creation with modern BI tools, and data reporting.',
      duration: '8 Weeks',
    },
  },
];

const TARGET_DEMOGRAPHIC_OPTIONS = [
  'Underserved & At-Risk Youth',
  'Career Transitioners & Adult Learners',
  'High School & Vocational Graduates',
  'Military Veterans & Spouses',
  'Women in Non-Traditional Trades',
  'Displaced Industrial Workers',
];

export const RegisterNgoModal: React.FC<RegisterNgoModalProps> = ({
  isOpen,
  onClose,
  onRegisteredSuccess,
  isFullPage = false,
}) => {
  const navigate = useNavigate();
  const { setNgos, setUsers, fetchNgos, fetchUsers } = useData();
  const { login } = useAuth();

  // Wizard Step State (1: Organization & Subdomain, 2: Tenant Branding, 3: Skill Categories, 4: Admin Account, 5: Starter Program, 6: Launch)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Organization & Subdomain
  const [ngoName, setNgoName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [ngoType, setNgoType] = useState<string>('Education');
  const [ngoDescription, setNgoDescription] = useState('');
  const [mission, setMission] = useState('');
  const [ngoLocation, setNgoLocation] = useState('');
  const [ngoAddress, setNgoAddress] = useState('');
  const [establishedYear, setEstablishedYear] = useState('2022');
  const [accreditation, setAccreditation] = useState(
    'National Apprenticeship Council & Industry Verified Sponsor'
  );

  // Step 2: Custom Tenant Branding
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [coverImageUrl, setCoverImageUrl] = useState(PRESET_COVERS[0].url);
  const [bannerPattern, setBannerPattern] = useState<'gradient' | 'waves' | 'grid' | 'dots' | 'minimal'>('gradient');

  // Step 3: Primary Skill Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Software & Web Engineering',
  ]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [targetDemographics, setTargetDemographics] = useState<string[]>([
    'Underserved & At-Risk Youth',
    'Career Transitioners & Adult Learners',
  ]);
  const [intakeCapacityPerYear, setIntakeCapacityPerYear] = useState<number>(150);

  // Step 4: Administrator Account & Governance
  const [adminName, setAdminName] = useState('');
  const [adminTitle, setAdminTitle] = useState('Director of Vocational Training');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWebsite, setContactWebsite] = useState('');
  const [isPublicDirectoryListed, setIsPublicDirectoryListed] = useState(true);
  const [autoApproveEnrollments, setAutoApproveEnrollments] = useState(false);
  const [allowGuestReviews, setAllowGuestReviews] = useState(true);

  // Step 5: Starter Program (Launch Accelerator)
  const [createInitialCourse, setCreateInitialCourse] = useState(true);
  const [courseName, setCourseName] = useState('Full-Stack Web Development & Cloud Services');
  const [courseCategory, setCourseCategory] = useState('Technology');
  const [courseDuration, setCourseDuration] = useState('10 Weeks');
  const [courseSeats, setCourseSeats] = useState<number>(20);
  const [courseDescription, setCourseDescription] = useState(
    'Intensive vocational apprenticeship focusing on hands-on practical skills, real-world portfolio deliverables, and job placement readiness.'
  );

  // Execution & Feedback State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newNgoId, setNewNgoId] = useState('');
  const [createdAdminProfile, setCreatedAdminProfile] = useState<any>(null);

  // Auto-generate slug when name changes (unless manually edited)
  const handleNameChange = (val: string) => {
    setNgoName(val);
    if (!isSlugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setCustomSlug(generated);
    }
  };

  // Toggle Category Selection
  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length <= 1) {
        setError('Please select at least 1 primary skill category.');
        return;
      }
      setSelectedCategories((prev) => prev.filter((c) => c !== catName));
    } else {
      setSelectedCategories((prev) => [...prev, catName]);
      // Update suggested starter course if appropriate
      const matched = DEFAULT_SKILL_CATEGORIES.find((c) => c.name === catName);
      if (matched && (!courseName || courseName === 'Full-Stack Web Development & Cloud Services')) {
        setCourseName(matched.suggestedCourse.name);
        setCourseDescription(matched.suggestedCourse.description);
        setCourseDuration(matched.suggestedCourse.duration);
        setCourseCategory(matched.name.split(' ')[0]);
      }
    }
    setError('');
  };

  // Add Custom Category
  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (selectedCategories.includes(trimmed)) {
      setError('This category is already added.');
      return;
    }
    setSelectedCategories((prev) => [...prev, trimmed]);
    setCustomCategoryInput('');
    setError('');
  };

  // Toggle Demographic
  const toggleDemographic = (demo: string) => {
    setTargetDemographics((prev) =>
      prev.includes(demo) ? prev.filter((d) => d !== demo) : [...prev, demo]
    );
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setNgoName('');
    setCustomSlug('');
    setIsSlugManual(false);
    setNgoType('Education');
    setNgoDescription('');
    setMission('');
    setNgoLocation('');
    setNgoAddress('');
    setPrimaryColor('#2563EB');
    setAccentColor('#10B981');
    setTagline('');
    setLogoUrl(PRESET_LOGOS[0].url);
    setCoverImageUrl(PRESET_COVERS[0].url);
    setSelectedCategories(['Software & Web Engineering']);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminConfirmPassword('');
    setContactPhone('');
    setContactWebsite('');
    setCreateInitialCourse(true);
    setError('');
    setIsLoading(false);
    setIsSuccess(false);
    setNewNgoId('');
    setCreatedAdminProfile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validations per step
  const validateStep1 = () => {
    if (!ngoName.trim()) {
      setError('Please provide the official organization or vocational center name.');
      return false;
    }
    if (!customSlug.trim()) {
      setError('Please provide a unique tenant portal slug (e.g. "apex-skills").');
      return false;
    }
    if (!ngoLocation.trim()) {
      setError('Please enter the primary city and state/region of your training center.');
      return false;
    }
    if (!ngoDescription.trim()) {
      setError('Please provide a brief description of your organization and operational facilities.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!primaryColor) {
      setError('Please choose a primary brand color theme.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least 1 primary vocational skill category.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep4 = () => {
    if (!adminName.trim()) {
      setError('Please provide the administrator full name.');
      return false;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setError('Please enter a valid administrator work email address.');
      return false;
    }
    if (adminPassword.length < 6) {
      setError('Administrator password must be at least 6 characters long.');
      return false;
    }
    if (adminPassword !== adminConfirmPassword) {
      setError('Administrator passwords do not match. Please re-type.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep5 = () => {
    if (createInitialCourse) {
      if (!courseName.trim()) {
        setError('Please enter a program title for your initial vocational cohort.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
    else if (currentStep === 4 && validateStep4()) setCurrentStep(5);
    else if (currentStep === 5 && validateStep5()) setCurrentStep(6);
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Provisioning & Tenant Registration
  const handleLaunchTenant = async () => {
    setError('');
    if (!validateStep1() || !validateStep3() || !validateStep4()) return;

    setIsLoading(true);

    const cleanSlug = customSlug
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueSuffix = Date.now().toString().slice(-4);
    const finalNgoId = `ngo-${cleanSlug || 'center'}-${uniqueSuffix}`;

    // Build initial course list
    const initialCourses: Course[] = [];
    if (createInitialCourse && courseName.trim()) {
      initialCourses.push({
        id: `course-${finalNgoId}-1`,
        name: courseName.trim(),
        description:
          courseDescription.trim() ||
          `Official vocational program by ${ngoName.trim()} focused on ${courseCategory}.`,
        category: courseCategory || 'Technology',
        duration: courseDuration || '8 Weeks',
        trainer: adminName.trim(),
        seatsAvailable: Number(courseSeats) || 20,
        startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        level: 'All Levels',
        certificationBadge: `SkillSpot Certified - ${courseName.trim()}`,
        prerequisites: ['Commitment to attending cohort hands-on sessions'],
        reviews: [],
        modules: [
          {
            id: `mod-${finalNgoId}-1`,
            weekNumber: 1,
            title: 'Core Fundamentals & Safety Orientation',
            description: 'Introduction to foundational trade skills, safety guidelines, and laboratory tools.',
            topics: ['Safety Protocols', 'Core Terminology', 'Hands-on Equipment Setup'],
            deliverable: 'Orientation Skills & Lab Safety Assessment',
            durationHours: 12,
          },
          {
            id: `mod-${finalNgoId}-2`,
            weekNumber: 2,
            title: 'Applied Practical Implementation',
            description: 'Instructor-guided practical exercises and applied workflows.',
            topics: ['Practical Techniques', 'Quality Assurance', 'Troubleshooting'],
            deliverable: 'Midterm Milestone Practical Proof',
            durationHours: 16,
          },
        ],
      });
    }

    const brandingData: TenantBranding = {
      primaryColor: primaryColor || '#2563EB',
      accentColor: accentColor || '#10B981',
      tagline: tagline.trim() || `Empowering tomorrow's workforce with applied skills.`,
      customSlug: cleanSlug,
      bannerPattern,
    };

    const tenantSettingsData: TenantSettings = {
      isPublicDirectoryListed,
      autoApproveEnrollments,
      allowGuestReviews,
      intakeCapacityPerYear: Number(intakeCapacityPerYear) || 150,
      targetDemographics,
      supportEmail: adminEmail.trim(),
    };

    const newNgo: NGO = {
      id: finalNgoId,
      name: ngoName.trim(),
      description: ngoDescription.trim(),
      location: ngoLocation.trim(),
      address: ngoAddress.trim() || ngoLocation.trim(),
      type: ngoType,
      logoUrl: logoUrl || PRESET_LOGOS[0].url,
      coverImageUrl: coverImageUrl || PRESET_COVERS[0].url,
      mission: mission.trim() || `Equip every student with verified real-world practical skills.`,
      establishedYear: Number(establishedYear) || 2022,
      accreditation: accreditation.trim() || 'SkillSpot Verified Apprenticeship Partner',
      branding: brandingData,
      primaryCategories: selectedCategories,
      tenantSettings: tenantSettingsData,
      contact: {
        email: adminEmail.trim(),
        phone: contactPhone.trim() || 'N/A',
        website: contactWebsite.trim() || `https://skillspot.org/o/${cleanSlug}`,
      },
      courses: initialCourses,
      coordinates: {
        lat: 37.7749 + (Math.random() - 0.5) * 4,
        lng: -122.4194 + (Math.random() - 0.5) * 4,
      },
    };

    const newAdminProfile = {
      id: `admin-${Date.now()}`,
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      phone: contactPhone.trim(),
      role: 'admin' as const,
      ngoId: finalNgoId,
      bio: `${adminTitle.trim()} at ${ngoName.trim()}`,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    try {
      // 1. Supabase Auth Sign Up (graceful fallback)
      try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: adminEmail.trim(),
          password: adminPassword,
        });
        if (!signUpError && authData.user) {
          newAdminProfile.id = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase Auth sign up fallback:', authErr);
      }

      // 2. Supabase Database insert
      try {
        await supabase.from('ngos').insert(newNgo);
        await supabase.from('users').insert(newAdminProfile);
        await Promise.all([fetchNgos(), fetchUsers()]);
      } catch (dbErr) {
        console.warn('Supabase insert fallback, saving locally:', dbErr);
      }

      // 3. Update React context state
      setNgos((prev) => [newNgo, ...prev.filter((n) => n.id !== newNgo.id)]);
      setUsers((prev) => [newAdminProfile, ...prev.filter((u) => u.email !== newAdminProfile.email)]);

      // 4. Cache credentials for instant test sign-in
      try {
        const customAdmins = JSON.parse(
          localStorage.getItem('skillspot_registered_admins') || '[]'
        );
        customAdmins.push({
          ...newAdminProfile,
          password: adminPassword,
        });
        localStorage.setItem('skillspot_registered_admins', JSON.stringify(customAdmins));
      } catch (storageErr) {
        console.warn('LocalStorage admin store warning:', storageErr);
      }

      // 5. Dispatch real-time notification
      try {
        dispatchRealtimeNotification({
          userId: 'public',
          type: 'enrollment',
          title: `🎉 New Training Partner Registered!`,
          message: `${ngoName.trim()} has joined the SkillSpot network specializing in ${(selectedCategories || []).slice(0, 2).join(', ')}.`,
          link: `/ngo/${finalNgoId}`,
        });
      } catch (notifErr) {
        console.warn('Notification dispatch non-critical:', notifErr);
      }

      setNewNgoId(finalNgoId);
      setCreatedAdminProfile(newAdminProfile);
      setIsSuccess(true);

      if (onRegisteredSuccess) {
        onRegisteredSuccess(adminEmail.trim(), finalNgoId);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Launch into Admin Studio directly
  const handleLaunchAdminStudio = () => {
    if (createdAdminProfile) {
      login(createdAdminProfile);
      handleClose();
      navigate('/admin-dashboard');
    } else {
      handleClose();
      navigate('/login');
    }
  };

  // View newly created Public Profile
  const handleViewPublicPage = () => {
    handleClose();
    navigate(`/ngo/${newNgoId}`);
  };

  if (!isOpen) return null;

  const inputClasses =
    'w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all shadow-xs';
  const labelClasses =
    'block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5';

  const stepsList = [
    { step: 1, label: 'Organization', shortLabel: 'Org' },
    { step: 2, label: 'Custom Branding', shortLabel: 'Brand' },
    { step: 3, label: 'Skill Categories', shortLabel: 'Skills' },
    { step: 4, label: 'Admin Account', shortLabel: 'Admin' },
    { step: 5, label: 'Starter Program', shortLabel: 'Course' },
    { step: 6, label: 'Review & Launch', shortLabel: 'Launch' },
  ];

  const modalContainer = isFullPage
    ? 'w-full max-w-5xl mx-auto py-6'
    : 'fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto';

  const cardContainer = isFullPage
    ? 'bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col'
    : 'bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200';

  return (
    <div className={modalContainer}>
      <div className={cardContainer}>
        {/* WIZARD HEADER */}
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800">
          <div className="flex items-center space-x-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold text-xl transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Tenant Setup Wizard
                </span>
                <span className="text-xs text-gray-400">• Step {currentStep} of 6</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-0.5">
                Register Training Center & Tenant Profile
              </h2>
            </div>
          </div>
          {!isFullPage && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close wizard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* STEP PROGRESS BAR */}
        {!isSuccess && (
          <div className="px-6 pt-3.5 pb-2 bg-gray-50/80 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              {stepsList.map((s) => (
                <div key={s.step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === s.step
                        ? 'text-white shadow-sm ring-4 ring-blue-100 dark:ring-blue-900/40 scale-105'
                        : currentStep > s.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                    style={{
                      backgroundColor: currentStep === s.step ? primaryColor : undefined,
                    }}
                  >
                    {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold text-center truncate max-w-[80px] hidden sm:block ${
                      currentStep === s.step
                        ? 'text-gray-900 dark:text-white font-bold'
                        : currentStep > s.step
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress line */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentStep - 1) / 5) * 100}%`,
                  backgroundColor: primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {/* STEP CONTENT BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-start space-x-2.5 animate-shake">
              <span className="font-bold text-base leading-none">⚠️</span>
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* CELEBRATION / SUCCESS STATE */}
          {isSuccess ? (
            <div className="text-center py-8 px-4 max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
              <div
                className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl animate-bounce"
                style={{ backgroundColor: primaryColor }}
              >
                🎉
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tenant Provisioned Successfully</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  Welcome, {ngoName}!
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your organization profile, custom branding, and primary skill categories have been published to the SkillSpot network.
                </p>
              </div>

              {/* Tenant URL & Credentials Card */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 text-left text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Tenant Portal Address:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>skillspot.org/o/{customSlug}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    Primary Administrator
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {adminName} ({adminTitle})
                  </p>
                  <p className="font-mono text-gray-600 dark:text-gray-300 text-[11px]">{adminEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Specialized Skill Tracks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-[11px] border border-gray-200 dark:border-gray-600"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchAdminStudio}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Launch Admin Management Studio</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewPublicPage}
                  className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-600 transition-all flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>View Public Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 1: ORGANIZATION FUNDAMENTALS & TENANT DOMAIN */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>1. Organization Identity & Subdomain Portal</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Enter the formal details of your vocational institute, trade academy, or non-profit center.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Official NGO / Center Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Renewable & Vocational Institute"
                        value={ngoName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    {/* Subdomain Slug generator */}
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-blue-950 dark:text-blue-300">
                          Tenant Subdomain & Portal URL *
                        </label>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          Custom portal address
                        </span>
                      </div>
                      <div className="flex items-center rounded-xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs">
                        <span className="text-gray-400 font-mono select-none">https://skillspot.org/o/</span>
                        <input
                          type="text"
                          value={customSlug}
                          onChange={(e) => {
                            setIsSlugManual(true);
                            setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                          }}
                          placeholder="your-org-slug"
                          className="bg-transparent text-blue-600 dark:text-blue-400 font-bold font-mono focus:outline-hidden flex-1 ml-1"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Learners and employers can access your branded public directory and verification center via this link.
                      </p>
                    </div>

                    <div>
                      <label className={labelClasses}>Primary Institutional Focus *</label>
                      <select
                        value={ngoType}
                        onChange={(e) => setNgoType(e.target.value)}
                        className={inputClasses}
                      >
                        <option value="Education">Technical & Vocational Education (TVET)</option>
                        <option value="Environmental">Clean Energy & Climate Technologies</option>
                        <option value="Healthcare">Healthcare & Clinical Trades</option>
                        <option value="Community Development">Community & Workforce Development</option>
                        <option value="Advanced Manufacturing">Advanced Manufacturing & Robotics</option>
                        <option value="Digital Arts">Digital Arts & Creative Media</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClasses}>Operational City & State *</label>
                      <input
                        type="text"
                        placeholder="e.g. Austin, TX or Chicago, IL"
                        value={ngoLocation}
                        onChange={(e) => setNgoLocation(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Physical Facility / Campus Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 742 Evergreen Terrace, Suite 400, Austin, TX 78701"
                        value={ngoAddress}
                        onChange={(e) => setNgoAddress(e.target.value)}
                        className={inputClasses}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Mission Statement & Scope *</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your vocational goals, facilities, hands-on workshops, and who you train..."
                        value={ngoDescription}
                        onChange={(e) => setNgoDescription(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Year Established</label>
                      <input
                        type="number"
                        placeholder="2022"
                        value={establishedYear}
                        onChange={(e) => setEstablishedYear(e.target.value)}
                        className={inputClasses}
                        min="1950"
                        max="2026"
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Accreditation & Industry Affiliations</label>
                      <input
                        type="text"
                        placeholder="e.g. National Apprenticeship Council & OSHA Authorized"
                        value={accreditation}
                        onChange={(e) => setAccreditation(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CUSTOM TENANT BRANDING & LIVE CARD PREVIEW */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-purple-600" />
                      <span>2. Custom Tenant Branding & Visual Identity</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Tailor your organization's color palette, logo, cover hero banner, and tenant tagline.
                    </p>
                  </div>

                  {/* Primary Color Palette Presets & Hex Picker */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className={labelClasses}>Primary Brand Color Theme *</label>
                      <span className="text-[11px] font-mono font-bold text-gray-500">{primaryColor}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {BRAND_COLOR_PRESETS.map((p) => {
                        const isSelected = primaryColor.toLowerCase() === p.hex.toLowerCase();
                        return (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(p.hex);
                              setAccentColor(p.accent);
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                              isSelected
                                ? 'border-gray-900 dark:border-white shadow-md ring-2 ring-gray-900/10 dark:ring-white/20 bg-gray-50 dark:bg-gray-700'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-lg shrink-0 shadow-inner flex items-center justify-center text-white text-[10px]"
                              style={{ backgroundColor: p.hex }}
                            >
                              {isSelected && '✓'}
                            </span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                              {p.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Hex Picker */}
                    <div className="flex items-center space-x-3 pt-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Or Custom Hex:
                      </label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-28 px-2.5 py-1.5 text-xs font-mono border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className={labelClasses}>Tenant Tagline / Motto</label>
                    <input
                      type="text"
                      placeholder="e.g. Empowering tomorrow's electricians and solar technicians through hands-on labs"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  {/* Logo Picker */}
                  <div className="space-y-2">
                    <label className={labelClasses}>Organization Logo Icon</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_LOGOS.map((logo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLogoUrl(logo.url)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                            logoUrl === logo.url
                              ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={logo.url}
                            alt={logo.label}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-[9px] font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">
                            {logo.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Or paste custom logo image URL..."
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Cover Header Presets */}
                  <div className="space-y-2">
                    <label className={labelClasses}>Hero Banner & Workshop Background</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_COVERS.map((cover, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCoverImageUrl(cover.url)}
                          className={`relative h-16 rounded-xl overflow-hidden border transition-all ${
                            coverImageUrl === cover.url
                              ? 'ring-3 ring-blue-500 border-white'
                              : 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={cover.url}
                            alt={cover.label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white truncate drop-shadow">
                              {cover.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LIVE INTERACTIVE BRANDING PREVIEW CARD */}
                  <div className="pt-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>Live Branding Preview</span>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-800">
                      {/* Banner */}
                      <div
                        className="h-24 relative p-4 flex justify-between items-start text-white overflow-hidden"
                        style={{
                          background: coverImageUrl
                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${coverImageUrl}) center/cover`
                            : primaryColor,
                        }}
                      >
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          <span>Verified Training Partner</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                          skillspot.org/o/{customSlug || 'your-org'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 pt-0">
                        <div className="flex items-end space-x-3 -mt-6 mb-2">
                          <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-800 shadow-md overflow-hidden shrink-0">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white font-black text-sm"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {(ngoName || 'SS').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">
                              {ngoName || 'Apex Vocational Institute'}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {tagline || 'Hands-on practical training & apprenticeships'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PRIMARY SKILL CATEGORIES & TARGET AUDIENCE */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>3. Primary Skill Categories & Vocational Disciplines</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Select the primary technical trades and vocational disciplines your organization teaches.
                    </p>
                  </div>

                  {/* Selected Categories Summary */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Selected Primary Categories ({selectedCategories.length})
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {selectedCategories.length > 0 ? '✓ Ready' : 'Select at least 1'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800 shadow-2xs"
                        >
                          <span>{cat}</span>
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="hover:text-red-500 ml-1"
                            title="Remove category"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEFAULT_SKILL_CATEGORIES.map((category) => {
                      const isSelected = selectedCategories.includes(category.name);
                      return (
                        <div
                          key={category.id}
                          onClick={() => toggleCategory(category.name)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="text-2xl shrink-0 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl">
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                                {category.name}
                              </h4>
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {isSelected && '✓'}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Category input */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex flex-col sm:flex-row gap-2 items-center">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Add proprietary / custom skill category (e.g. Drone Piloting & Surveying)"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                        }}
                        className={inputClasses}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  {/* Target Demographics */}
                  <div className="space-y-2 pt-2">
                    <label className={labelClasses}>Primary Learner Demographics</label>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_DEMOGRAPHIC_OPTIONS.map((demo) => {
                        const isSelected = targetDemographics.includes(demo);
                        return (
                          <button
                            key={demo}
                            type="button"
                            onClick={() => toggleDemographic(demo)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {demo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Intake Capacity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClasses}>Estimated Annual Learner Intake</label>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {intakeCapacityPerYear} learners / year
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="600"
                      step="10"
                      value={intakeCapacityPerYear}
                      onChange={(e) => setIntakeCapacityPerYear(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: ADMINISTRATOR ACCOUNT & GOVERNANCE */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>4. Administrator Account & Tenant Governance</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Create your organization's primary director account and configure enrollment policies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Administrator Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Marcus Vance"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Job Title / Administrative Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Director of Vocational Training"
                        value={adminTitle}
                        onChange={(e) => setAdminTitle(e.target.value)}
                        className={inputClasses}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClasses}>Official Administrator Email (Login ID) *</label>
                      <input
                        type="email"
                        placeholder="admin@yourorganization.org"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Password (min. 6 characters) *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Confirm Password *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Contact Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. (512) 555-0199"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>Official Website</label>
                      <input
                        type="url"
                        placeholder="https://yourorganization.org"
                        value={contactWebsite}
                        onChange={(e) => setContactWebsite(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Tenant Policy Toggles */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Tenant Directory & Application Policies
                    </h4>

                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPublicDirectoryListed}
                        onChange={(e) => setIsPublicDirectoryListed(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          Feature in SkillSpot Public Marketplace & Map
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                          Allow prospective learners to discover your training center in directory searches.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoApproveEnrollments}
                        onChange={(e) => setAutoApproveEnrollments(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          Instant Auto-Approval for Open Cohorts
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                          Automatically confirm seat reservations without manual review.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowGuestReviews}
                        onChange={(e) => setAllowGuestReviews(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          Enable Verified Alumni & Employer Endorsements
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                          Allow certificate holders and employer partners to leave public ratings.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: STARTER PROGRAM / COHORT */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>5. Starter Vocational Cohort (Launch Accelerator)</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Launch with an active starter course pre-configured from your primary skill categories.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="starterCourseToggle"
                      checked={createInitialCourse}
                      onChange={(e) => setCreateInitialCourse(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 mt-1 cursor-pointer"
                    />
                    <label htmlFor="starterCourseToggle" className="cursor-pointer">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block">
                        Publish starter vocational program immediately
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                        Enables your organization to start receiving student applications as soon as registration finishes.
                      </span>
                    </label>
                  </div>

                  {createInitialCourse && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className={labelClasses}>Program Title *</label>
                        <input
                          type="text"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          className={inputClasses}
                          placeholder="e.g. Commercial Solar PV Installation & Storage"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={labelClasses}>Primary Track</label>
                          <select
                            value={courseCategory}
                            onChange={(e) => setCourseCategory(e.target.value)}
                            className={inputClasses}
                          >
                            {selectedCategories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClasses}>Duration</label>
                          <select
                            value={courseDuration}
                            onChange={(e) => setCourseDuration(e.target.value)}
                            className={inputClasses}
                          >
                            <option value="6 Weeks">6 Weeks (Intensive)</option>
                            <option value="8 Weeks">8 Weeks (Standard)</option>
                            <option value="10 Weeks">10 Weeks (Specialist)</option>
                            <option value="12 Weeks">12 Weeks (Comprehensive)</option>
                            <option value="16 Weeks">16 Weeks (Apprenticeship)</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClasses}>Cohort Seats</label>
                          <input
                            type="number"
                            min="5"
                            max="60"
                            value={courseSeats}
                            onChange={(e) => setCourseSeats(Number(e.target.value))}
                            className={inputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Curriculum Overview & Practical Scope</label>
                        <textarea
                          rows={3}
                          value={courseDescription}
                          onChange={(e) => setCourseDescription(e.target.value)}
                          className={inputClasses}
                          placeholder="Describe hands-on projects, tools used, and certification badge..."
                        />
                      </div>

                      {/* Initial Syllabus preview */}
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 text-xs">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-2">
                          Standard 2-Module Syllabus Seeded:
                        </span>
                        <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                          <li className="flex items-center space-x-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                              1
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">Week 1:</span>
                            <span>Core Fundamentals, Laboratory Safety & Orientation</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                              2
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">Week 2:</span>
                            <span>Applied Practical Techniques & Hands-on Quality Assurance</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: REVIEW, CONTRACT & PROVISIONING */}
              {currentStep === 6 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>6. Review Organization & Launch Tenant</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Review all configuration parameters before provisioning your organization onto the SkillSpot decentralized network.
                    </p>
                  </div>

                  {/* Executive Summary Card */}
                  <div className="rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md bg-white dark:bg-gray-800">
                    {/* Header with custom branding */}
                    <div
                      className="p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative overflow-hidden"
                      style={{
                        background: coverImageUrl
                          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${coverImageUrl}) center/cover`
                          : primaryColor,
                      }}
                    >
                      <div className="flex items-center space-x-3.5 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden shadow-md shrink-0 border-2 border-white">
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black">{ngoName}</h4>
                          <p className="text-xs text-white/90">
                            {tagline || `Specializing in ${(selectedCategories || []).slice(0, 2).join(', ')}`}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md font-mono">
                          skillspot.org/o/{customSlug}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md font-bold">
                          {ngoType}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Operational Campus
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {ngoLocation} • {ngoAddress || 'Main Campus Facility'}
                        </p>
                        <p className="text-gray-500 text-[11px]">{accreditation}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Administrator Credentials
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {adminName} ({adminTitle})
                        </p>
                        <p className="font-mono text-gray-600 dark:text-gray-400 text-[11px]">{adminEmail}</p>
                      </div>

                      <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Primary Skill Categories Registered ({selectedCategories.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCategories.map((c) => (
                            <span
                              key={c}
                              className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                            >
                              ✓ {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {createInitialCourse && (
                        <div className="sm:col-span-2 space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            Starter Vocational Program Seeded
                          </span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {courseName} ({courseDuration} • {courseSeats} Seats)
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                            {courseDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms & Certification Acknowledgment */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                    <span className="font-bold text-sm">📜</span>
                    <p>
                      By launching this tenant, you verify that your organization provides genuine vocational training, adheres to safety standards, and issues authentic credentials verified by SkillSpot.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* WIZARD FOOTER CONTROLS */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                Step {currentStep} of 6
              </span>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 shadow-md hover:opacity-95 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchTenant}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Tenant...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Launch Tenant Organization</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterNgoModal;
