import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import {
  User,
  Student,
  Company,
  Job,
  Application,
  Interview,
  Panel,
  Venue,
  Notification,
  AgentTask,
  ActivityLog,
} from '../models/index.js';

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed]: Dropping database to clear old indexes...');
    await mongoose.connection.db.dropDatabase();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    console.log('[Seed]: Creating Admin and Student Users...');

    // 1. Admin User
    const adminUser = await User.create({
      name: 'Dr. Anita Sharma',
      email: 'admin.placement@campus.edu',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    });

    // 2. Student Users
    const studentUser1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@campus.edu',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    const studentUser2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha.patel@campus.edu',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    const studentUser3 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    const studentUser4 = await User.create({
      name: 'Rohan Deshmukh',
      email: 'rohan.d@campus.edu',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    const studentUser5 = await User.create({
      name: 'Pooja Nair',
      email: 'pooja.nair@campus.edu',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    // 3. Student Profiles
    console.log('[Seed]: Creating Student Profiles...');
    const student1 = await Student.create({
      userId: studentUser1._id,
      rollNumber: '22CSE1048',
      phone: '+91 98765 43210',
      branch: 'Computer Science and Engineering',
      department: 'School of Computing',
      cgpa: 8.85,
      activeBacklogs: 0,
      graduationYear: 2026,
      skills: ['React.js', 'Node.js', 'Python', 'MongoDB', 'Docker', 'REST APIs', 'Data Structures', 'Git'],
      softSkills: ['Problem Solving', 'Team Collaboration', 'Effective Communication'],
      github: 'https://github.com/rahulverma',
      linkedin: 'https://linkedin.com/in/rahulverma',
      profileCompletion: 88,
      resume: { url: '/resumes/rahul_verma_resume.pdf', originalName: 'rahul_verma_resume.pdf' },
      projects: [
        {
          title: 'Distributed Task Queue System',
          description: 'Built a fault-tolerant async worker queue with Redis, Node.js, and Docker handling 10k tasks/sec.',
          techStack: ['Node.js', 'Redis', 'Docker', 'TypeScript'],
          github: 'https://github.com/rahulverma/task-queue',
        },
      ],
      certifications: [
        { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Aug 2025' },
      ],
    });

    const student2 = await Student.create({
      userId: studentUser2._id,
      rollNumber: '22IT018',
      phone: '+91 98765 12345',
      branch: 'Information Technology',
      department: 'School of Computing',
      cgpa: 9.24,
      activeBacklogs: 0,
      graduationYear: 2026,
      skills: ['Python', 'SQL', 'FastAPI', 'Pandas', 'PostgreSQL', 'Machine Learning'],
      softSkills: ['Analytical Thinking', 'Time Management'],
      profileCompletion: 94,
    });

    const student3 = await Student.create({
      userId: studentUser3._id,
      rollNumber: '22CSE041',
      phone: '+91 97654 32109',
      branch: 'Computer Science and Engineering',
      department: 'School of Computing',
      cgpa: 8.65,
      activeBacklogs: 0,
      graduationYear: 2026,
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'MySQL', 'C++'],
      softSkills: ['Leadership', 'Collaboration'],
      profileCompletion: 90,
    });

    const student4 = await Student.create({
      userId: studentUser4._id,
      rollNumber: '22ECE092',
      phone: '+91 91234 56780',
      branch: 'Electronics and Communication',
      department: 'School of Electrical Sciences',
      cgpa: 7.95,
      activeBacklogs: 1,
      graduationYear: 2026,
      skills: ['Embedded C', 'C++', 'ARM Cortex', 'RTOS', 'Linux Kernel'],
      softSkills: ['Detail-Oriented'],
      profileCompletion: 76,
    });

    const student5 = await Student.create({
      userId: studentUser5._id,
      rollNumber: '22CSE112',
      phone: '+91 99887 76655',
      branch: 'Computer Science and Engineering',
      department: 'School of Computing',
      cgpa: 9.42,
      activeBacklogs: 0,
      graduationYear: 2026,
      skills: ['Go', 'Distributed Systems', 'C++', 'Python', 'AWS', 'Redis'],
      softSkills: ['Critical Thinking', 'Technical Writing'],
      profileCompletion: 98,
    });

    // 4. Companies
    console.log('[Seed]: Creating Recruiting Companies...');
    const compMicrosoft = await Company.create({
      name: 'Microsoft',
      tier: 'Tier 1 (Dream)',
      industry: 'Software / Cloud',
      website: 'https://careers.microsoft.com',
      contactPerson: 'Vikram Seth',
      contactEmail: 'univ-in@microsoft.com',
      status: 'Active',
      totalHires: 32,
      description: 'Pioneering platform company enabling digital transformation through Azure and intelligent tools.',
    });

    const compGS = await Company.create({
      name: 'Goldman Sachs',
      tier: 'Tier 1 (Dream)',
      industry: 'Financial Technology / Investment Banking',
      website: 'https://goldmansachs.com/careers',
      contactPerson: 'Megha Singhania',
      contactEmail: 'campushiring-in@gs.com',
      status: 'Active',
      totalHires: 14,
      description: 'Leading global financial institution providing quant systems and platform banking.',
    });

    const compAmazon = await Company.create({
      name: 'Amazon',
      tier: 'Tier 1 (Dream)',
      industry: 'E-Commerce / Cloud / AI',
      website: 'https://amazon.jobs',
      contactPerson: 'Karan Grover',
      contactEmail: 'amazon-in-campus@amazon.com',
      status: 'Active',
      totalHires: 45,
      description: 'Earth’s most customer-centric company driven by AWS cloud infrastructure.',
    });

    const compGoogle = await Company.create({
      name: 'Google',
      tier: 'Tier 1 (Dream)',
      industry: 'Technology / Cloud / AI',
      website: 'https://careers.google.com',
      contactPerson: 'Aditi Mathur',
      contactEmail: 'campus-recruiting@google.com',
      status: 'Active',
      totalHires: 18,
      description: 'Global technology leader specializing in search, cloud computing, and AI systems.',
    });

    const compInfosys = await Company.create({
      name: 'Infosys',
      tier: 'Core Recruiter',
      industry: 'IT Services & Consulting',
      website: 'https://infosys.com/careers',
      contactPerson: 'Ramesh Krishnan',
      contactEmail: 'campus@infosys.com',
      status: 'Active',
      totalHires: 180,
      description: 'Global leader in next-generation digital services and consulting across enterprise clients.',
    });

    // 5. Jobs
    console.log('[Seed]: Creating Job Drives...');
    const jobMicrosoft = await Job.create({
      companyId: compMicrosoft._id,
      companyName: compMicrosoft.name,
      title: 'Software Development Engineer (SDE-1)',
      location: 'Hyderabad / Bengaluru, India',
      package: '₹24.5 LPA',
      type: 'Full-Time',
      minimumCGPA: 8.0,
      maximumActiveBacklogs: 0,
      eligibleBranches: ['Computer Science and Engineering', 'Information Technology', 'Data Science & AI'],
      graduationYear: 2026,
      requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'C++', 'System Design', 'REST APIs'],
      preferredSkills: ['Azure', 'Microservices', 'Docker'],
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Open',
      applicantCount: 142,
      description: 'Design and maintain cloud-scale distributed services with high availability, security, and low latency.',
      rounds: ['Online Coding Test', 'Technical Round 1 (DSA)', 'Technical Round 2 (System & Projects)', 'AA / HR Fitment'],
    });

    const jobGS = await Job.create({
      companyId: compGS._id,
      companyName: compGS.name,
      title: 'Analyst - Engineering (Quant & Platform)',
      location: 'Bengaluru, India',
      package: '₹22.0 LPA',
      type: 'Full-Time',
      minimumCGPA: 8.5,
      maximumActiveBacklogs: 0,
      eligibleBranches: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication'],
      graduationYear: 2026,
      requiredSkills: ['Python', 'C++', 'Data Structures', 'SQL', 'Algorithms'],
      preferredSkills: ['Financial Markets', 'Pandas', 'FastAPI'],
      applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'Open',
      applicantCount: 98,
      description: 'Build real-time trading engines, risk computation pipelines, and transaction platforms.',
      rounds: ['HackerRank Test', 'Technical Interview 1', 'Technical Interview 2', 'Leadership & Behavioral'],
    });

    const jobAmazon = await Job.create({
      companyId: compAmazon._id,
      companyName: compAmazon.name,
      title: 'Software Development Engineer - AWS',
      location: 'Bengaluru / Chennai, India',
      package: '₹26.0 LPA',
      type: 'Full-Time',
      minimumCGPA: 7.5,
      maximumActiveBacklogs: 0,
      eligibleBranches: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication'],
      graduationYear: 2026,
      requiredSkills: ['Data Structures', 'Java', 'Algorithms', 'Object-Oriented Design', 'Linux'],
      preferredSkills: ['AWS Services', 'Docker', 'Go'],
      applicationDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      status: 'Open',
      applicantCount: 215,
      description: 'Amazon Web Services is hiring SDEs for storage and cloud computing infrastructure.',
      rounds: ['Online Assessment', 'Technical Bar Raiser', 'Technical Deep Dive', 'Amazon Leadership Principles'],
    });

    // 6. Applications
    console.log('[Seed]: Creating Student Applications...');
    await Application.syncIndexes();
    await Application.create([
      {
        studentId: student1._id,
        jobId: jobMicrosoft._id,
        eligibilityStatus: 'Eligible',
        matchScore: 92,
        matchExplanation: 'Candidate matches 5 of 5 required skills. Strong projects demonstrating distributed queue and full-stack execution.',
        status: 'Shortlisted',
        reviewNotes: 'Shortlisted by AI Placement Agent. Approved by Placement Admin.',
      },
      {
        studentId: student1._id,
        jobId: jobGS._id,
        eligibilityStatus: 'Eligible',
        matchScore: 88,
        matchExplanation: 'Eligible on CGPA (8.85 >= 8.5) and 0 backlogs. Proficient in Python, SQL, and backend data flows.',
        status: 'Shortlisted',
        reviewNotes: 'Scheduled for Technical Round 2 with Panel Beta.',
      },
      {
        studentId: student2._id,
        jobId: jobGS._id,
        eligibilityStatus: 'Eligible',
        matchScore: 96,
        matchExplanation: 'Exceptional match with 9.24 CGPA, Python, Pandas, financial risk modeling project.',
        status: 'Interview Scheduled',
        reviewNotes: 'Final HR round scheduled with Prof. Maya Iyer.',
      },
      {
        studentId: student3._id,
        jobId: jobMicrosoft._id,
        eligibilityStatus: 'Eligible',
        matchScore: 94,
        matchExplanation: 'Meets Java, Spring Boot, Microservices, and System Design requirements.',
        status: 'Interview Scheduled',
        reviewNotes: 'Technical Round 2 with Dr. S. K. Raman.',
      },
    ]);

    // 7. Panels
    console.log('[Seed]: Creating Faculty Panels...');
    const panelAlpha = await Panel.create({
      name: 'Panel Alpha - Systems & Cloud',
      lead: 'Dr. S. K. Raman',
      department: 'CSE Dept',
      members: [{ name: 'Dr. S. K. Raman', designation: 'Professor' }, { name: 'Prof. Anand K.', designation: 'Associate Prof' }],
      specialization: 'Distributed Systems, Cloud Architecture, Java/C++',
      availability: 'Mon - Fri (10:00 AM - 04:00 PM)',
      activeSlots: 4,
      status: 'Available',
    });

    const panelBeta = await Panel.create({
      name: 'Panel Beta - Data Science & Leadership',
      lead: 'Prof. Maya Iyer',
      department: 'IT & Management Sciences',
      members: [{ name: 'Prof. Maya Iyer', designation: 'Dean' }],
      specialization: 'Machine Learning, Financial Algorithms, Behavioral Leadership',
      availability: 'Mon, Wed, Fri (11:00 AM - 05:00 PM)',
      activeSlots: 3,
      status: 'Available',
    });

    // 8. Venues
    console.log('[Seed]: Creating Venues...');
    const venue1 = await Venue.create({
      name: 'Lab Block B - 302',
      location: 'Science & Tech Quad, 3rd Floor',
      type: 'Physical Lab',
      capacity: 25,
      facilities: ['High-speed LAN', 'Dual Monitor Desktops', 'Webcam', 'Soundproof Partition'],
      status: 'Available',
    });

    const venue2 = await Venue.create({
      name: 'Virtual Meeting Room #4 (Webex / GMeet)',
      location: 'Cloud Infrastructure',
      type: 'Virtual Bridge',
      capacity: 100,
      facilities: ['Encrypted Link', 'Auto-Recording', 'Screen Sharing', 'Waiting Lobby'],
      status: 'Available',
    });

    // 9. Interviews
    console.log('[Seed]: Creating Interview Slots...');
    await Interview.create([
      {
        studentId: student3._id,
        jobId: jobMicrosoft._id,
        companyId: compMicrosoft._id,
        round: 'Technical Round 2 (DSA & Microservices)',
        date: '2026-11-18',
        startTime: '10:30 AM',
        endTime: '11:15 AM',
        duration: '45 mins',
        panelId: panelAlpha._id,
        venueId: venue1._id,
        status: 'Confirmed',
        outcome: 'Pending',
      },
      {
        studentId: student2._id,
        jobId: jobGS._id,
        companyId: compGS._id,
        round: 'Final HR / Fitment Round',
        date: '2026-11-18',
        startTime: '11:45 AM',
        endTime: '12:30 PM',
        duration: '45 mins',
        panelId: panelBeta._id,
        venueId: venue2._id,
        status: 'Confirmed',
        outcome: 'Pending',
      },
    ]);

    // 10. Notifications
    console.log('[Seed]: Creating Notifications...');
    await Notification.create([
      {
        recipientId: studentUser1._id,
        recipientRole: 'student',
        title: 'Interview Slot Scheduled: Microsoft SDE',
        message: 'Your Round 1 Technical Interview for Microsoft is scheduled on Nov 18 at 10:00 AM in Lab Block B - 302.',
        type: 'Interview',
        deliveryStatus: 'Delivered',
      },
      {
        recipientRole: 'all',
        title: 'Placement Season Announcement: Google Cloud Drive Live',
        message: 'Google Cloud Solutions Engineer role is now accepting applications. Deadline to register is Dec 05.',
        type: 'Announcement',
        deliveryStatus: 'Delivered',
      },
    ]);

    // 11. AgentTasks
    console.log('[Seed]: Creating Agent Tasks...');
    await AgentTask.create({
      requestedBy: adminUser._id,
      request: 'Analyze Amazon SDE job description, evaluate eligible 2026 CSE/IT candidates, calculate skill alignment scores, and propose interview schedules with Panel Alpha.',
      status: 'Waiting for Approval',
      progress: 85,
      workflowSteps: [
        { id: 1, name: 'Parse Job Requirements', status: 'Completed', detail: 'Extracted: Min CGPA 7.5, 0 backlogs, Java/DSA/AWS skills' },
        { id: 2, name: 'Deterministic Eligibility Filter', status: 'Completed', detail: 'Checked 215 applicants: 182 Eligible, 33 Ineligible' },
        { id: 3, name: 'Candidate Skill Matching Engine', status: 'Completed', detail: 'Generated match scores & identified top 48 high-affinity candidates' },
        { id: 4, name: 'Faculty Panel & Venue Coordination', status: 'Completed', detail: 'Verified slots with Panel Alpha & Lab Block B-302' },
        { id: 5, name: 'Human Administrator Approval Gate', status: 'In Progress', detail: 'Awaiting Admin sign-off on 48 candidates' },
      ],
    });

    // 12. ActivityLog
    console.log('[Seed]: Creating Activity Logs...');
    await ActivityLog.create({
      actorId: adminUser._id,
      actorName: adminUser.name,
      action: 'INIT_PLACEMENT_SEASON',
      entityType: 'Job',
      details: { season: '2025-2026', totalDrives: 5 },
    });

    console.log('[Seed]: Database successfully seeded with all 11 collections!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

// If run directly via CLI: `node src/utils/seedData.js`
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase();
}

export default seedDatabase;
