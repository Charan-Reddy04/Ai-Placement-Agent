import mongoose from 'mongoose';
import env from '../config/env.js';
import { User, Student, Company, Job, Application, Interview, Panel, Venue, Notification, AgentTask, ActivityLog } from '../models/index.js';

export const getHealthStatus = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    // Get collection counts if connected
    let counts = {};
    if (isDbConnected) {
      counts = {
        users: await User.countDocuments(),
        students: await Student.countDocuments(),
        companies: await Company.countDocuments(),
        jobs: await Job.countDocuments(),
        applications: await Application.countDocuments(),
        interviews: await Interview.countDocuments(),
        panels: await Panel.countDocuments(),
        venues: await Venue.countDocuments(),
        notifications: await Notification.countDocuments(),
        agentTasks: await AgentTask.countDocuments(),
        activityLogs: await ActivityLog.countDocuments(),
      };
    }

    res.status(200).json({
      success: true,
      service: 'CampusPilot Operations Backend',
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: {
        connected: isDbConnected,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: counts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
};

export default { getHealthStatus };

