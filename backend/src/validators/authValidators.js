import { z } from 'zod';

export const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    rollNumber: z.string().min(2, 'Roll number is required').trim(),
    phone: z.string().optional(),
    branch: z.string().min(2, 'Branch is required'),
    department: z.string().optional(),
    cgpa: z.coerce.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10'),
    activeBacklogs: z.coerce.number().int().min(0, 'Backlogs cannot be negative').default(0),
    graduationYear: z.coerce.number().int().min(2024).max(2035),
    skills: z.array(z.string()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export default {
  registerStudentSchema,
  loginSchema,
};

