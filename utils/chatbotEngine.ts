import { NGO, Course, VocationalJob } from '../types';

export interface BotActionCard {
  type: 'ngo' | 'course' | 'job' | 'feature';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple';
  details?: string[];
  link?: string;
}

export interface BotResponse {
  text: string;
  actionCards?: BotActionCard[];
  suggestions?: string[];
}

/**
 * Builds dynamic context string for Gemini API with live platform data
 */
export function buildDynamicPromptContext(
  ngos: NGO[],
  jobs: VocationalJob[]
): string {
  const ngoData = (ngos || []).map((ngo) => ({
    id: ngo.id,
    name: ngo?.name || 'Organization',
    mission: ngo?.mission || ngo?.description || '',
    location: ngo?.location || '',
    address: ngo?.address || '',
    type: ngo?.type || 'Vocational',
    rating: ngo?.rating || 4.9,
    contact: {
      email: ngo?.contact?.email || (ngo as any)?.contactEmail || '',
      phone: ngo?.contact?.phone || (ngo as any)?.phone || '',
      website: ngo?.contact?.website || (ngo as any)?.website || '',
    },
    coursesCount: ngo?.courses?.length || 0,
    courses: (ngo?.courses || []).map((c) => ({
      id: c.id,
      name: c?.name || 'Program',
      description: c?.description || '',
      category: c?.category || 'General',
      duration: c?.duration || '8 Weeks',
      trainer: c?.trainer || 'Accredited Instructor',
      level: c?.level || 'All Levels',
      seatsAvailable: c?.seatsAvailable || 0,
      startDate: c?.startDate || 'Rolling Cohorts',
      prerequisites: c?.prerequisites || ['None'],
      certificationBadge: c?.certificationBadge || 'Accredited Certificate',
      tuition: '100% Free / Sponsored Foundation Grant',
    })),
  }));

  const jobData = (jobs || []).map((j) => ({
    id: j.id,
    title: j?.title || 'Position',
    company: j?.company || 'Employer',
    location: j?.location || '',
    wage: j?.hourlyWageOrStipend || (j as any)?.stipendOrSalary || '$28.00/hr',
    category: j?.category || 'General',
    skills: j?.requiredSkills || (j as any)?.requirements || [],
  }));

  return `You are the friendly, intelligent, and highly knowledgeable AI Navigator for SkillSpot 2.0.
Your mission is to guide learners, job seekers, employers, and training providers across vocational education, accredited skill programs, job placements, and verifiable certifications.

CRITICAL INSTRUCTIONS:
- Base all answers strictly on the dynamic database below.
- Always provide clear, direct, and factually accurate answers to the user's specific questions.
- Use clean formatting: bold titles, concise bullet points, and actionable next steps.
- Highlight that 100% of featured courses are tuition-free / grant-sponsored for enrolled students.
- When asked about courses, mention the specific partner NGO name, location, instructor/trainer, program duration, and open seat counts.
- When asked about employers, explain the Employer Portal where verified graduates can be browsed and invited to interviews.
- When asked about certificates, explain the public credential verification registry at #/verify.
- When asked about workshops, explain the equipment booking system at #/workshops.
- When asked about mock interviews, mention the AI Trade Coach at #/coach.

LIVE PLATFORM DATABASE:
${JSON.stringify({ ngos: ngoData, jobs: jobData }, null, 2)}`;
}

/**
 * Intelligent Semantic Knowledge Engine
 * Completely free, instant, zero external API key required.
 * Dynamically queries the live NGOs and Jobs state with rich answers and actionable navigation cards.
 */
export function processLocalQuery(
  rawQuery: string,
  ngos: NGO[],
  jobs: VocationalJob[]
): BotResponse {
  const query = rawQuery.trim().toLowerCase();

  // Helper to collect all courses
  const allCourses: { ngo: NGO; course: Course }[] = [];
  (ngos || []).forEach((n) => {
    (n?.courses || []).forEach((c) => {
      allCourses.push({ ngo: n, course: c });
    });
  });

  // 1. GREETINGS & WHAT IS SKILLSPOT
  if (
    query === 'hi' ||
    query === 'hello' ||
    query === 'hey' ||
    query.startsWith('hello') ||
    query.startsWith('hi ') ||
    query.includes('who are you') ||
    query.includes('what can you do') ||
    query.includes('what is skillspot') ||
    query.includes('how does skillspot work')
  ) {
    return {
      text: `👋 **Welcome to the SkillSpot 2.0 AI Navigator!**\n\nSkillSpot 2.0 is a decentralized vocational ecosystem connecting ambitious learners with verified community NGOs, hands-on workshop training, and real-world employment pipelines.\n\n**Currently Active on the Platform:**\n• 🏢 **${(ngos || []).length} Certified Partner NGOs** across major metropolitan hubs\n• 📚 **${allCourses.length} Accredited Vocational Programs** in high-demand trades\n• 💼 **${(jobs || []).length} Industry Job & Apprentice Openings** with verified wages\n• 📜 **Instant QR Credential Verification** for all graduated students\n\n**How can I assist your career journey today?**`,
      suggestions: [
        'Explore all courses',
        'Which courses are free?',
        'Courses with open seats',
        'Show all partner NGOs',
        'Hiring job opportunities',
      ],
    };
  }

  // 2. ALL COURSES / EXPLORE PROGRAMS
  if (
    query.includes('all course') ||
    query.includes('available course') ||
    query.includes('list course') ||
    query.includes('show course') ||
    query.includes('explore course') ||
    query.includes('what course') ||
    query === 'courses' ||
    query === 'programs'
  ) {
    const actionCards: BotActionCard[] = allCourses.slice(0, 5).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Open`,
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration} (${course.level || 'All Levels'})`,
        `Trainer: ${course.trainer}`,
        `Certificate: ${course.certificationBadge || 'Verified Credential'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `📚 **Accredited Vocational Programs Available Now (${allCourses.length} total):**\n\nHere are our top accredited training programs. Every course includes practical workshop hours, industry mentorship, and an official verified certificate upon graduation:\n\n${allCourses.map((item, idx) => `${idx + 1}. **${item.course.name}** (${item.course.category}) — Offered by *${item.ngo.name}* in ${item.ngo.location} [${item.course.duration}, ${item.course.seatsAvailable} seats available]`).join('\n')}\n\n*Click any course card below to view syllabus details and apply!*`,
      actionCards,
      suggestions: [
        'Which courses are free?',
        'Courses with open seats',
        'Solar technician program',
        'Web development course',
      ],
    };
  }

  // 3. SOLAR / CLEAN ENERGY TRADE
  if (
    query.includes('solar') ||
    query.includes('clean energy') ||
    query.includes('renewable') ||
    query.includes('photovoltaic') ||
    query.includes('pv') ||
    query.includes('green') ||
    query.includes('heat pump')
  ) {
    const solarMatches = allCourses.filter((item) => {
      const text = `${item.course.name} ${item.course.description} ${item.course.category}`.toLowerCase();
      return text.includes('solar') || text.includes('clean energy') || text.includes('photovoltaic') || text.includes('renewable') || text.includes('environmental');
    });

    const actionCards: BotActionCard[] = solarMatches.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: course.seatsAvailable > 0 ? `${course.seatsAvailable} Seats Available` : 'Waitlist Active',
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Credential: ${course.certificationBadge || 'NABCEP Associate PV Installer'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `☀️ **Solar PV Systems Installation & Renewable Energy:**\n\n**Featured Program:** Solar PV Systems Installation & Electrical Safety\n• **Training Center:** Austin Green Tech & Solar Initiative (Austin, TX)\n• **Instructor:** Marcus Vance (NABCEP Certified Specialist)\n• **Duration:** 8 Weeks (Intermediate Level)\n• **Curriculum Highlights:** Rooftop mechanical racking, inverter wiring, lithium battery storage configurations, NEC Article 690, and OSHA 10 electrical safety.\n• **Certification Awarded:** NABCEP Associate PV Installer Credential\n• **Seats Available:** 6 cohort openings\n• **Tuition:** 100% Free / Sponsored Foundation Grant`,
      actionCards,
      suggestions: [
        'How to apply',
        'Hiring job opportunities',
        'Explore all courses',
      ],
    };
  }

  // 4. WEB DEVELOPMENT / SOFTWARE / CODING
  if (
    query.includes('web') ||
    query.includes('software') ||
    query.includes('coding') ||
    query.includes('programming') ||
    query.includes('full-stack') ||
    query.includes('full stack') ||
    query.includes('react') ||
    query.includes('developer')
  ) {
    const techMatches = allCourses.filter((item) => {
      const text = `${item.course.name} ${item.course.description} ${item.course.category}`.toLowerCase();
      return text.includes('web') || text.includes('full-stack') || text.includes('software') || text.includes('coding');
    });

    const actionCards: BotActionCard[] = techMatches.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Available`,
      badgeColor: 'blue',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Badge: ${course.certificationBadge || 'Certified Engineer'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `💻 **Full-Stack Web Engineering Program:**\n\n**Featured Program:** Full-Stack Web Development\n• **Training Center:** Innovate For Tomorrow (San Francisco, CA)\n• **Instructor:** Jane Doe\n• **Duration:** 12 Weeks (Intermediate Level)\n• **Curriculum Highlights:** Modern TypeScript & React 19 architecture, REST API design with Node.js & Express, PostgreSQL & database indexing, Docker containerization, and cloud deployment pipelines.\n• **Certification Awarded:** SkillSpot Certified Full-Stack Engineer\n• **Seats Available:** 5 cohort seats remaining\n• **Tuition:** 100% Tuition-Free for enrolled apprentices`,
      actionCards,
      suggestions: [
        'How to apply',
        'UX/UI Design course',
        'Data analytics program',
      ],
    };
  }

  // 5. UX / UI / PRODUCT DESIGN
  if (
    query.includes('design') ||
    query.includes('ux') ||
    query.includes('ui') ||
    query.includes('figma') ||
    query.includes('wireframe') ||
    query.includes('user experience')
  ) {
    const designMatches = allCourses.filter((item) => {
      const text = `${item.course.name} ${item.course.description} ${item.course.category}`.toLowerCase();
      return text.includes('design') || text.includes('ux') || text.includes('ui');
    });

    const actionCards: BotActionCard[] = designMatches.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Available`,
      badgeColor: 'purple',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Credential: ${course.certificationBadge || 'Product Designer'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🎨 **Introduction to UX/UI Product Design:**\n\n**Featured Program:** Introduction to UX/UI Design\n• **Training Center:** Innovate For Tomorrow (San Francisco, CA)\n• **Instructor:** John Smith\n• **Duration:** 6 Weeks (Beginner Level — No Prior Experience Required)\n• **Curriculum Highlights:** Human-centered design principles, empathy mapping, user personas, wireframing in Figma, accessible WCAG 2.1 design systems, and moderated usability testing.\n• **Certification Awarded:** SkillSpot Certified Product Designer\n• **Seats Available:** 8 cohort openings\n• **Tuition:** Fully Sponsored`,
      actionCards,
      suggestions: [
        'How to apply',
        'Full-Stack Web Development',
        'Show all partner NGOs',
      ],
    };
  }

  // 6. HEALTHCARE / CNA / NURSING
  if (
    query.includes('health') ||
    query.includes('cna') ||
    query.includes('nurs') ||
    query.includes('medical') ||
    query.includes('hospital') ||
    query.includes('caregiver')
  ) {
    const healthMatches = allCourses.filter((item) => {
      const text = `${item.course.name} ${item.course.description} ${item.course.category}`.toLowerCase();
      return text.includes('health') || text.includes('cna') || text.includes('nurs');
    });

    const actionCards: BotActionCard[] = healthMatches.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Available`,
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Certification: State-Accredited CNA Licensing Prep`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🏥 **Certified Nursing Assistant (CNA) Prep:**\n\n**Featured Program:** Certified Nursing Assistant (CNA) Prep\n• **Training Center:** Community Builders United (Chicago, IL)\n• **Instructor:** Marcus Johnson, RN\n• **Duration:** 8 Weeks (Beginner Level)\n• **Curriculum Highlights:** Vital signs monitoring, patient hygiene & mobility, basic pharmacology, infection control, and supervised clinical practicum hours preparing for state board licensure.\n• **Certification Awarded:** State-Accredited CNA Licensing & BLS/CPR Credential\n• **Seats Available:** 10 cohort seats open\n• **Tuition:** 100% Free / CSR Healthcare Trust Grant`,
      actionCards,
      suggestions: [
        'How to apply',
        'Hiring job opportunities',
        'Show all partner NGOs',
      ],
    };
  }

  // 7. DATA ANALYTICS & PYTHON & SQL
  if (
    query.includes('data') ||
    query.includes('analytics') ||
    query.includes('python') ||
    query.includes('sql') ||
    query.includes('bi') ||
    query.includes('tableau')
  ) {
    const dataMatches = allCourses.filter((item) => {
      const text = `${item.course.name} ${item.course.description} ${item.course.category}`.toLowerCase();
      return text.includes('data') || text.includes('python') || text.includes('sql');
    });

    const actionCards: BotActionCard[] = dataMatches.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Available`,
      badgeColor: 'blue',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Badge: ${course.certificationBadge || 'Certified Data Analyst'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `📊 **Data Analytics & Business Intelligence:**\n\n**Featured Program:** Data Analytics & BI with Python & SQL\n• **Training Center:** Metro Seattle Youth & Tech Haven (Seattle, WA)\n• **Instructor:** Priya Sharma\n• **Duration:** 10 Weeks (Beginner Level)\n• **Curriculum Highlights:** Pandas data wrangling, advanced SQL window functions & CTE aggregations, exploratory statistics, and Tableau dashboard storytelling.\n• **Certification Awarded:** SkillSpot Certified Data Analyst\n• **Seats Available:** 7 cohort openings\n• **Tuition:** Fully Sponsored`,
      actionCards,
      suggestions: [
        'How to apply',
        'Job opportunities',
        'Explore all courses',
      ],
    };
  }

  // 8. FREE / COST / TUITION QUERIES
  if (
    query.includes('free') ||
    query.includes('cost') ||
    query.includes('fee') ||
    query.includes('tuition') ||
    query.includes('scholarship') ||
    query.includes('sponsored') ||
    query.includes('how much')
  ) {
    const actionCards: BotActionCard[] = allCourses.slice(0, 4).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: '100% Free / Sponsored',
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Seats: ${course.seatsAvailable} open`,
        `Trainer: ${course.trainer}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🎉 **100% Free & Sponsored Vocational Programs:**\n\n**Zero Tuition Middlemen Policy:**\nSkillSpot 2.0 partners exclusively with non-profit community organizations funded by civic grants, donor trusts, and industry hiring partners.\n\n• **Tuition Cost:** $0.00 (All programs are free for qualified applicants)\n• **Materials & Labs:** Hands-on workshop facilities, tools, and computers are provided at zero cost.\n• **Certification Fees:** Exam and credential issuance costs are 100% covered upon passing.\n\nHere are highlighted free vocational programs ready for enrollment:`,
      actionCards,
      suggestions: [
        'Courses with open seats',
        'How to apply',
        'Explore all courses',
      ],
    };
  }

  // 9. OPEN SEATS & ADMISSIONS CAPACITY
  if (
    query.includes('open seat') ||
    query.includes('seats available') ||
    query.includes('seat') ||
    query.includes('available now') ||
    query.includes('vacan') ||
    query.includes('capacity') ||
    query.includes('intake')
  ) {
    const openSeatCourses = allCourses.filter((item) => item.course.seatsAvailable > 0);

    const actionCards: BotActionCard[] = openSeatCourses.map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Open`,
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Category: ${course.category}`,
        `Level: ${course.level || 'All Levels'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `⚡ **Courses with Immediate Open Seats:**\n\nWe currently have **${openSeatCourses.reduce((sum, item) => sum + item.course.seatsAvailable, 0)} total open seats** across our active cohorts:\n\n${openSeatCourses.map((item) => `• **${item.course.name}** at *${item.ngo.name}* (${item.ngo.location}): **${item.course.seatsAvailable} seats open**`).join('\n')}\n\n*Apply early to secure your seat before intake closes!*`,
      actionCards,
      suggestions: [
        'How to apply',
        'Which courses are free?',
        'Hiring job opportunities',
      ],
    };
  }

  // 10. HOW TO APPLY & ENROLLMENT STEPS
  if (
    query.includes('how to apply') ||
    query.includes('how to enroll') ||
    query.includes('apply') ||
    query.includes('admission') ||
    query.includes('enroll') ||
    query.includes('requirements') ||
    query.includes('prerequisites')
  ) {
    return {
      text: `📝 **Step-by-Step Guide: How to Apply & Enroll**\n\n1. **Browse Vocational Courses:** Choose a program matching your trade interest (Solar, Healthcare, Software, UX/UI, Data).\n2. **Check Prerequisites:** Most beginner programs require no prior experience, only dedication and basic literacy.\n3. **Click "Apply for Course":** On any NGO profile page, select your desired course and fill out the simple application form.\n4. **NGO Review:** The training center staff reviews your application. You will receive real-time notification alerts.\n5. **Cohort Onboarding:** Once approved, you gain full access to the Student Dashboard to track modules, reserve workshop tools, and take mock interviews.`,
      suggestions: [
        'Explore all courses',
        'Which courses are free?',
        'Courses with open seats',
      ],
    };
  }

  // 11. PARTNER NGO CENTERS (ALL OR BY NAME)
  if (
    query.includes('ngo') ||
    query.includes('center') ||
    query.includes('organization') ||
    query.includes('partner') ||
    query.includes('institute') ||
    query.includes('innovate') ||
    query.includes('community builder') ||
    query.includes('austin green') ||
    query.includes('seattle')
  ) {
    // Check if matching specific NGO
    const specificNgo = (ngos || []).find((n) => {
      const q = query.toLowerCase();
      const name = n.name.toLowerCase();
      const loc = n.location.toLowerCase();
      return q.includes(name) || name.includes(q) || (q.includes('austin') && loc.includes('austin')) || (q.includes('seattle') && loc.includes('seattle')) || (q.includes('chicago') && loc.includes('chicago')) || (q.includes('san francisco') && loc.includes('san francisco'));
    });

    if (specificNgo) {
      const actionCards: BotActionCard[] = (specificNgo.courses || []).map((c) => ({
        type: 'course',
        id: c.id,
        title: c.name,
        subtitle: `${specificNgo.name} • ${c.duration}`,
        badge: `${c.seatsAvailable} Seats Available`,
        badgeColor: 'emerald',
        details: [
          `Category: ${c.category}`,
          `Trainer: ${c.trainer}`,
          `Credential: ${c.certificationBadge || 'Verified Certificate'}`,
        ],
        link: `/ngo/${specificNgo.id}`,
      }));

      return {
        text: `🏢 **${specificNgo.name}**\n\n📍 **Location:** ${specificNgo.location} (${specificNgo.address})\n⭐ **Rating:** ${specificNgo.rating || 4.9} / 5.0\n🎯 **Focus Trade:** ${specificNgo.type}\n\n**Mission & Impact:**\n${specificNgo.mission || specificNgo.description}\n\n**Official Contact:**\n• 📧 Email: ${specificNgo.contact?.email || (specificNgo as any).contactEmail}\n• 📞 Phone: ${specificNgo.contact?.phone || (specificNgo as any).phone}\n• 🌐 Website: ${specificNgo.contact?.website || (specificNgo as any).website}\n\n**Offered Programs (${(specificNgo.courses || []).length}):**`,
        actionCards,
        suggestions: [
          'How to apply',
          'Show all partner NGOs',
          'Explore all courses',
        ],
      };
    }

    const actionCards: BotActionCard[] = (ngos || []).map((n) => ({
      type: 'ngo',
      id: n.id,
      title: n.name,
      subtitle: `${n.location} • ${n.type}`,
      badge: `${(n.courses || []).length} Programs`,
      badgeColor: 'blue',
      details: [
        `Contact: ${n.contact?.email || (n as any).contactEmail}`,
        `Phone: ${n.contact?.phone || (n as any).phone}`,
      ],
      link: `/ngo/${n.id}`,
    }));

    return {
      text: `🏢 **Certified Partner NGO Training Centers (${(ngos || []).length} Verified Partners):**\n\n${(ngos || []).map((n, idx) => `${idx + 1}. **${n.name}** (${n.location}) — Specializing in *${n.type}* with ${(n.courses || []).length} active cohorts. Contact: ${n.contact?.email || (n as any).contactEmail}`).join('\n')}\n\n*Click on any center card to browse their campus and apply for programs!*`,
      actionCards,
      suggestions: [
        'Explore all courses',
        'Courses with open seats',
        'How to apply',
      ],
    };
  }

  // 12. JOBS & HIRING PLACEMENTS
  if (
    query.includes('job') ||
    query.includes('hiring') ||
    query.includes('placement') ||
    query.includes('salary') ||
    query.includes('wage') ||
    query.includes('career') ||
    query.includes('stipend') ||
    query.includes('work') ||
    query.includes('employer')
  ) {
    const actionCards: BotActionCard[] = (jobs || []).slice(0, 4).map((j) => ({
      type: 'job',
      id: j.id,
      title: j.title,
      subtitle: `${j.company} • ${j.location}`,
      badge: j.hourlyWageOrStipend || (j as any).stipendOrSalary || '$28.00 / hr',
      badgeColor: 'purple',
      details: [
        `Category: ${j.category}`,
        `Required Skills: ${(j.requiredSkills || (j as any).requirements || ['Trade certification']).slice(0, 3).join(', ')}`,
      ],
      link: `/jobs`,
    }));

    return {
      text: `💼 **Vocational Job Board & Industry Placements:**\n\nSkillSpot 2.0 partners directly with employers seeking certified graduates:\n\n${(jobs || []).map((j) => `• **${j.title}** at *${j.company}* (${j.location}): Starting at **${j.hourlyWageOrStipend || (j as any).stipendOrSalary || '$28.00/hr'}**`).join('\n')}\n\n*Visit the Job Board to review job grants, apprenticeships, and direct hiring openings!*`,
      actionCards,
      suggestions: [
        'Explore all courses',
        'How to verify certificate',
        'Show all partner NGOs',
      ],
    };
  }

  // 13. CERTIFICATE VERIFICATION & CREDENTIALS
  if (
    query.includes('certif') ||
    query.includes('verify') ||
    query.includes('credential') ||
    query.includes('qr') ||
    query.includes('diploma') ||
    query.includes('graduat')
  ) {
    return {
      text: `📜 **Verifiable Certificate & Credential System:**\n\n• **Instant Online Verification:** Every student who successfully completes a program receives a cryptographically authenticated certificate ID.\n• **QR Code & Public Registry:** Employers and licensing bodies can verify credentials instantly at **#/verify** or by scanning the certificate QR code.\n• **Accredited Badges:** Certificates list accredited skills, instructor signatures, workshop practical hours, and distinction grade scores.\n• **Try Sample ID:** Check sample certificate \`CERT-SKILLSPOT-2025-8842\` in the verification portal!`,
      actionCards: [
        {
          type: 'feature',
          id: 'verify-page',
          title: 'Certificate Verification Registry',
          subtitle: 'SkillSpot Public Credential Ledger',
          badge: 'Live QR Registry',
          badgeColor: 'emerald',
          details: ['Cryptographically verifiable', 'Instant employer lookup'],
          link: '/verify',
        },
      ],
      suggestions: [
        'Explore all courses',
        'Courses with open seats',
        'Hiring job opportunities',
      ],
    };
  }

  // 14. WORKSHOPS & MACHINE RESERVATIONS
  if (
    query.includes('workshop') ||
    query.includes('machine') ||
    query.includes('equipment') ||
    query.includes('reservation') ||
    query.includes('tool') ||
    query.includes('lab')
  ) {
    return {
      text: `🛠️ **Workshop Facilities & Equipment Booking:**\n\nEnrolled students and trainees enjoy hands-on access to vocational labs:\n• **Machine Reservations:** Reserve CNC routers, solar diagnostic analyzers, SMAW/GMAW welding rigs, and 3D prototyping bays.\n• **Interactive Map:** Explore campus facilities and workshop centers on the Workshop Map page.\n• **Safety First:** Machine usage is supervised by OSHA-certified instructors.`,
      actionCards: [
        {
          type: 'feature',
          id: 'workshops-page',
          title: 'Interactive Workshop Facilities Map',
          subtitle: 'Equipment booking & campus maker labs',
          badge: 'Hands-on Labs',
          badgeColor: 'blue',
          details: ['Real-time equipment availability', 'Instant time slot reservation'],
          link: '/workshops',
        },
      ],
      suggestions: [
        'Explore all courses',
        'How to apply',
        'AI Trade Coach',
      ],
    };
  }

  // 15. AI TRADE COACH & MOCK INTERVIEW
  if (
    query.includes('coach') ||
    query.includes('mock interview') ||
    query.includes('interview') ||
    query.includes('trade coach') ||
    query.includes('practice')
  ) {
    return {
      text: `🎙️ **AI Trade Coach & Interactive Mock Interviews:**\n\nPrepare for real-world job site interviews with our specialized AI Trade Coach:\n• **Persona Coaching:** Practice with Dave (Master Electrician), Sarah (Safety Inspector), or Marcus (Commercial Project Lead).\n• **Voice & Audio Practice:** Full speech synthesis support for spoken interview practice.\n• **Rubric Scoring:** Instant feedback on technical diagnostic accuracy, OSHA compliance, and communication clarity.`,
      actionCards: [
        {
          type: 'feature',
          id: 'coach-page',
          title: 'AI Trade Coach & Mock Interview Hub',
          subtitle: 'Scenario-based trade interview simulator',
          badge: 'AI Powered',
          badgeColor: 'purple',
          details: ['Real-time trade diagnostics', 'OSHA compliance rubric scoring'],
          link: '/coach',
        },
      ],
      suggestions: [
        'Hiring job opportunities',
        'Explore all courses',
        'How to apply',
      ],
    };
  }

  // 16. EMPLOYER PORTAL & HIRING GRADUATES
  if (
    query.includes('employer') ||
    query.includes('hire') ||
    query.includes('graduate') ||
    query.includes('recruit') ||
    query.includes('candidate') ||
    query.includes('talent')
  ) {
    return {
      text: `👔 **Employer Portal & Verified Graduate Recruitment:**\n\nSkillSpot 2.0 provides an exclusive portal for hiring partners, clean-tech contractors, and tech enterprises:\n• **Verified Graduates Only:** Employers browse only candidates who have successfully graduated accredited programs with verified certificates.\n• **Credential Transparency:** Review practical workshop hours (360+ hrs), distinction grades, and capstone projects.\n• **Direct Invitations:** Send direct interview and apprenticeship invitations with scheduled dates and hourly wage proposals.\n• **Outcome Logging:** Record placement outcomes and wage milestones for foundation and donor compliance.\n\n*Visit the Employer Portal to scout pre-screened vocational talent!*`,
      actionCards: [
        {
          type: 'feature',
          id: 'employer-portal',
          title: 'Employer Hiring Portal',
          subtitle: 'Talent pipeline for certified vocational graduates',
          badge: 'Verified Alumni Only',
          badgeColor: 'blue',
          details: ['Pre-screened certified talent', 'Direct interview invitations'],
          link: '/employers',
        },
      ],
      suggestions: [
        'Hiring job opportunities',
        'How to verify certificate',
        'Explore all courses',
      ],
    };
  }

  // 17. INSTRUCTORS & TRAINERS
  if (
    query.includes('trainer') ||
    query.includes('instructor') ||
    query.includes('teacher') ||
    query.includes('who teach') ||
    query.includes('marcus') ||
    query.includes('priya') ||
    query.includes('elena') ||
    query.includes('jane') ||
    query.includes('john')
  ) {
    const trainers = Array.from(new Set(allCourses.map((c) => c.course.trainer))).filter(Boolean);
    const trainerList = allCourses.map(({ ngo, course }) => `• **${course.trainer}** — Teaches *${course.name}* at **${ngo.name}** (${ngo.location})`).join('\n');

    return {
      text: `👨‍🏫 **Accredited Vocational Instructors & Mentors:**\n\nOur instructors are certified trade masters, industry practitioners, and licensed examiners:\n\n${trainerList}\n\n*Every instructor provides one-on-one lab guidance and mentorship!*`,
      suggestions: [
        'Explore all courses',
        'Courses with open seats',
        'Show all partner NGOs',
      ],
    };
  }

  // 18. DYNAMIC TRADE / KEYWORD SEARCH
  const queryTokens = query.split(/[\s,?.!]+/).filter((t) => t.length > 2);
  const matchedCourses = allCourses.filter(({ ngo, course }) => {
    const hay = `${course.name} ${course.description} ${course.category} ${course.trainer} ${ngo.name} ${ngo.location}`.toLowerCase();
    return queryTokens.some((token) => hay.includes(token));
  });

  if (matchedCourses.length > 0) {
    const actionCards: BotActionCard[] = matchedCourses.slice(0, 5).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course.name,
      subtitle: `${ngo.name} • ${ngo.location}`,
      badge: `${course.seatsAvailable} Seats Open`,
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Trainer: ${course.trainer}`,
        `Tuition: 100% Free / Sponsored`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🔍 **Matching Programs Found for "${rawQuery.trim()}":**\n\nHere are the accredited training programs matching your search:\n\n${matchedCourses.slice(0, 5).map(({ ngo, course }, i) => `${i + 1}. **${course.name}** (${course.category})\n   • Center: *${ngo.name}* (${ngo.location})\n   • Duration: ${course.duration} | Trainer: ${course.trainer}\n   • Seats Available: **${course.seatsAvailable} open** (Tuition-Free)`).join('\n\n')}\n\n*Click on any card below to view details and apply!*`,
      actionCards,
      suggestions: [
        'How to apply',
        'Which courses are free?',
        'Courses with open seats',
        'Hiring job opportunities',
      ],
    };
  }

  // 19. DEFAULT INTELLIGENT FALLBACK
  const sampleCourses = allCourses.slice(0, 3);
  const actionCards: BotActionCard[] = sampleCourses.map(({ ngo, course }) => ({
    type: 'course',
    id: course.id,
    title: course.name,
    subtitle: `${ngo.name} • ${ngo.location}`,
    badge: `${course.seatsAvailable} Seats Open`,
    badgeColor: 'emerald',
    details: [`Duration: ${course.duration}`, `Trainer: ${course.trainer}`],
    link: `/ngo/${ngo.id}`,
  }));

  return {
    text: `💡 **Here is how I can help you navigate SkillSpot 2.0:**\n\nWe feature **${(ngos || []).length} verified NGOs** and **${allCourses.length} accredited vocational programs** across high-demand trades.\n\n**Popular queries to try:**\n• *"Show all courses"* or *"Which courses are free?"*\n• *"Solar PV installation program"* or *"Web development course"*\n• *"Courses with open seats"* or *"How do I apply?"*\n• *"Show all partner NGOs"* or *"Austin Green Tech"*\n• *"Employer portal"* or *"Hiring job opportunities"*\n• *"Verify certificate"* or *"Book workshop equipment"*`,
    actionCards,
    suggestions: [
      'Explore all courses',
      'Which courses are free?',
      'Courses with open seats',
      'Show all partner NGOs',
      'Hiring job opportunities',
    ],
  };
}
