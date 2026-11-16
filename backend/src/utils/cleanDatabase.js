import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Panel from '../models/Panel.js';
import Venue from '../models/Venue.js';
import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';
import AgentTask from '../models/AgentTask.js';
import ActivityLog from '../models/ActivityLog.js';

export const cleanDatabase = async () => {
  try {
    await connectDB();

    console.log('[Clean Database]: Purging all seed and testing collections...');

    const results = await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Panel.deleteMany({}),
      Venue.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      AgentTask.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log(`
=====================================================
  CampusPilot Database Cleaned Successfully
=====================================================
  - Users Deleted:         ${results[0].deletedCount}
  - Students Deleted:      ${results[1].deletedCount}
  - Companies Deleted:     ${results[2].deletedCount}
  - Jobs Deleted:          ${results[3].deletedCount}
  - Applications Deleted:  ${results[4].deletedCount}
  - Panels Deleted:        ${results[5].deletedCount}
  - Venues Deleted:        ${results[6].deletedCount}
  - Interviews Deleted:    ${results[7].deletedCount}
  - Notifications Deleted: ${results[8].deletedCount}
  - Agent Tasks Deleted:   ${results[9].deletedCount}
  - Activity Logs Deleted: ${results[10].deletedCount}
=====================================================
  Status: All collections are now empty and ready for fresh testing.
=====================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('[Clean Database Error]:', error.message);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith('cleanDatabase.js')) {
  cleanDatabase();
}

export default cleanDatabase;

