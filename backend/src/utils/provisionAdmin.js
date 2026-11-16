import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

export const provisionAdmin = async (name, email, password) => {
  try {
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.role === 'admin') {
        console.log(`[Provision Admin]: User ${normalizedEmail} is already an Admin.`);
        process.exit(0);
      }
      // Upgrade existing account
      existing.role = 'admin';
      const salt = await bcrypt.genSalt(10);
      existing.passwordHash = await bcrypt.hash(password, salt);
      await existing.save();
      console.log(`[Provision Admin]: Successfully upgraded ${normalizedEmail} to Administrator role.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    });

    await ActivityLog.create({
      actorId: admin._id,
      actorName: 'CLI_PROVISIONER',
      action: 'ADMIN_PROVISIONED',
      entityType: 'User',
      entityId: admin._id.toString(),
      details: { email: admin.email, name: admin.name },
    });

    console.log(`
=====================================================
  Admin Account Successfully Provisioned
  Name:     ${admin.name}
  Email:    ${admin.email}
  Role:     ${admin.role}
  Status:   ${admin.accountStatus}
=====================================================
    `);
    process.exit(0);
  } catch (error) {
    console.error('[Provision Admin Error]:', error.message);
    process.exit(1);
  }
};

// CLI Execution check
if (process.argv[1]?.endsWith('provisionAdmin.js')) {
  const args = process.argv.slice(2);
  const name = args[0] || 'Dr. Anita Sharma';
  const email = args[1] || 'admin.placement@campus.edu';
  const password = args[2] || 'Password@123';
  provisionAdmin(name, email, password);
}

export default provisionAdmin;

