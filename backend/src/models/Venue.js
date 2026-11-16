import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    building: {
      type: String,
      trim: true,
      default: 'Main Academic Block',
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['Physical Lab', 'Virtual Bridge', 'Auditorium', 'Executive Boardroom', 'Physical', 'Virtual'],
      default: 'Physical Lab',
    },
    capacity: {
      type: Number,
      required: true,
      default: 20,
    },
    facilities: [{ type: String, trim: true }],
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Maintenance', 'Occupied'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
