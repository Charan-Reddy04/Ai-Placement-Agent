import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';
import ActivityLog from '../models/ActivityLog.js';

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      phone,
      branch,
      department,
      cgpa,
      activeBacklogs,
      graduationYear,
      skills,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRoll = rollNumber.toUpperCase().trim();

    // 1. Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 2. Check if roll number already registered
    const existingStudent = await Student.findOne({ rollNumber: normalizedRoll });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `A student with roll number ${normalizedRoll} is already registered.`,
      });
    }

    // 3. Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User document (ROLE IS STRICTLY ENFORCED TO 'student')
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student', // Security requirement: Never trust role from frontend
      accountStatus: 'active',
    });

    // 5. Create linked Student profile
    const student = await Student.create({
      userId: user._id,
      rollNumber: normalizedRoll,
      phone: phone || '',
      branch: branch.trim(),
      department: department || 'School of Computing',
      cgpa: parseFloat(cgpa),
      activeBacklogs: parseInt(activeBacklogs) || 0,
      graduationYear: parseInt(graduationYear),
      skills: Array.isArray(skills) ? skills : [],
      softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
      profileCompletion: 70,
    });

    // 6. Log Activity
    await ActivityLog.create({
      actorId: user._id,
      actorName: user.name,
      action: 'STUDENT_REGISTRATION',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { rollNumber: student.rollNumber, branch: student.branch },
    });

    // 7. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 8. Set HTTP-only cookie if supported
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      profile: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unified Login for all roles (Student & Admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 2. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify account is not suspended
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact Placement Cell Administration.',
      });
    }

    // 4. Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. If student, fetch student profile
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    // 6. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 7. Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Verified role from MongoDB
        accountStatus: user.accountStatus,
        lastLoginAt: user.lastLoginAt,
      },
      profile: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check system setup status (whether any admin exists)
// @route   GET /api/auth/setup-status
// @access  Public
export const getSetupStatus = async (req, res, next) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' }).select('email name');
    res.status(200).json({
      success: true,
      needsAdminSetup: !existingAdmin,
      adminExists: !!existingAdmin,
      adminEmail: existingAdmin ? existingAdmin.email : null,
      adminCount: existingAdmin ? 1 : 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bootstrap / Provision Admin (STRICT SINGLE-ADMIN ACCESS)
// @route   POST /api/auth/bootstrap-admin
// @access  Public (Restricted to single admin)
export const bootstrapAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT SINGLE-ADMIN POLICY: Check if an administrator already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      // If an administrator already exists, strictly prevent any other email/person from becoming admin
      if (existingAdmin.email !== normalizedEmail) {
        return res.status(403).json({
          success: false,
          message: 'Access Restricted: CampusPilot enforces a strict single-administrator policy. A Master Administrator is already registered.',
        });
      }

      // If matching the existing single master admin, allow password update
      const salt = await bcrypt.genSalt(10);
      existingAdmin.name = name.trim();
      existingAdmin.passwordHash = await bcrypt.hash(password, salt);
      existingAdmin.accountStatus = 'active';
      await existingAdmin.save();

      const token = generateToken(existingAdmin._id, existingAdmin.role);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Master Administrator credentials updated successfully.',
        token,
        user: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      });
    }

    // No admin exists yet: Create the one and only Master Administrator
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    });

    const token = generateToken(admin._id, admin.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await ActivityLog.create({
      actorId: admin._id,
      actorName: admin.name,
      action: 'ADMIN_PROVISIONED',
      entityType: 'User',
      entityId: admin._id.toString(),
      details: { email: admin.email, name: admin.name },
    });

    res.status(201).json({
      success: true,
      message: 'Sole Master Administrator account successfully provisioned and activated.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Authenticated User Session
// @route   GET /api/auth/me
// @access  Protected
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        lastLoginAt: user.lastLoginAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000), // 5 seconds
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

export default {
  register,
  login,
  getMe,
  logout,
};

