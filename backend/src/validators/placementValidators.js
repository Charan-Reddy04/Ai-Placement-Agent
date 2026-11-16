import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  phone: z.string().trim().optional(),
  department: z.string().trim().optional(),
  branch: z.string().trim().min(2, 'Branch must be at least 2 characters').optional(),
  cgpa: z.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10').optional(),
  activeBacklogs: z.number().int().min(0, 'Backlogs cannot be negative').optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  skills: z.array(z.string().trim()).optional(),
  softSkills: z.array(z.string().trim()).optional(),
  github: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  projects: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Project title is required'),
        description: z.string().trim().min(1, 'Project description is required'),
        techStack: z.array(z.string().trim()).optional(),
        github: z.string().trim().optional(),
        liveUrl: z.string().trim().optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Certification name is required'),
        issuer: z.string().trim().min(1, 'Issuer is required'),
        date: z.string().trim().optional(),
        url: z.string().trim().optional(),
      })
    )
    .optional(),
});

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, 'Company name is required and must be at least 2 characters'),
  tier: z.enum(['Tier 1 (Dream)', 'Tier 2 (High Core)', 'Core Recruiter']).default('Tier 1 (Dream)'),
  industry: z.string().trim().default('Information Technology / Software'),
  website: z.string().trim().optional().or(z.literal('')),
  contactPerson: z.string().trim().optional(),
  contactEmail: z.string().trim().email('Must be a valid email').optional().or(z.literal('')),
  description: z.string().trim().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createJobSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  title: z.string().trim().min(2, 'Job title is required and must be at least 2 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: z.string().trim().default('Pan India / Remote'),
  package: z.string().trim().min(1, 'Package/CTC is required (e.g. 18.5 LPA)'),
  type: z.enum(['Full-Time', 'Internship', 'Full-Time + Internship']).default('Full-Time'),
  minimumCGPA: z.number().min(0).max(10).default(6.0),
  maximumActiveBacklogs: z.number().int().min(0).default(0),
  eligibleBranches: z.array(z.string().trim()).default(['Computer Science & Engineering', 'Information Technology']),
  graduationYear: z.number().int().min(2020).max(2035).default(2026),
  requiredSkills: z.array(z.string().trim()).default([]),
  preferredSkills: z.array(z.string().trim()).default([]),
  experienceRequirements: z.string().trim().default('Freshers (2026 Batch)'),
  applicationDeadline: z.string().or(z.date()),
  rounds: z.array(z.string().trim()).default(['Online Assessment', 'Technical Round 1', 'HR Discussion']),
  status: z.enum(['Draft', 'Open', 'Closed']).default('Open'),
});

export const updateJobSchema = createJobSchema.partial();

export const updateJobStatusSchema = z.object({
  status: z.enum(['Draft', 'Open', 'Closed']),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Offered',
    'Rejected',
    'Ineligible',
  ]),
  reviewNotes: z.string().trim().optional(),
});

