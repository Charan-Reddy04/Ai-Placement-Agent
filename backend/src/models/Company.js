import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['Tier 1 (Dream)', 'Tier 2 (High Core)', 'Core Recruiter'],
      default: 'Tier 1 (Dream)',
    },
    industry: {
      type: String,
      trim: true,
      default: 'Information Technology / Software',
    },
    website: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
    totalHires: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model('Company', companySchema);
export default Company;

