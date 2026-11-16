import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lead: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    members: [
      {
        name: { type: String, required: true },
        designation: { type: String, default: 'Panel Member' },
        email: { type: String, default: '' },
      },
    ],
    specialization: {
      type: String,
      required: true,
      trim: true,
      default: 'General Technical & HR Evaluation',
    },
    availability: {
      type: String,
      default: 'Mon - Fri (10:00 AM - 04:00 PM)',
    },
    activeSlots: {
      type: Number,
      default: 0,
    },
    maxCapacity: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Inactive'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Panel = mongoose.model('Panel', panelSchema);
export default Panel;
