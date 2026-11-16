import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending',
  },
  detail: { type: String, default: '' },
  completedAt: { type: Date },
});

const agentTaskSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      default: 'admin',
    },
    request: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      default: 'full-placement-orchestration',
    },
    executionStatus: {
      type: String,
      enum: [
        'Pending',
        'Running',
        'Waiting for Approval',
        'Completed',
        'Failed',
        'Cancelled',
      ],
      default: 'Pending',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    workflowSteps: [workflowStepSchema],
    toolResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    proposedShortlist: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        name: String,
        roll: String,
        cgpa: Number,
        match: Number,
        skills: [String],
      },
    ],
    proposedSlots: [
      {
        slot: String,
        capacity: String,
        panel: String,
        venue: String,
      },
    ],
    proposedAction: {
      actionType: { type: String },
      title: { type: String },
      summary: { type: String },
      payload: { type: mongoose.Schema.Types.Mixed },
    },
    executionResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const AgentTask = mongoose.model('AgentTask', agentTaskSchema);
export default AgentTask;

