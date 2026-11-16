import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { ActivityLog } from '../models/ActivityLog.js';

// @desc    Get all companies with active job counts
// @route   GET /api/companies
// @access  Private (Authenticated)
export const getCompanies = async (req, res, next) => {
  try {
    const { status, tier, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    } else if (req.user.role === 'student') {
      // Students only see active recruiting companies
      query.status = 'Active';
    }

    if (tier && tier !== 'all') {
      query.tier = tier;
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { industry: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const companies = await Company.find(query).sort({ tier: 1, name: 1 }).lean();

    // Attach active job count to each company
    const companiesWithJobCount = await Promise.all(
      companies.map(async (company) => {
        const activeJobsCount = await Job.countDocuments({
          companyId: company._id,
          status: 'Open',
        });
        return {
          ...company,
          activeJobsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companiesWithJobCount.length,
      data: companiesWithJobCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company details with all jobs
// @route   GET /api/companies/:id
// @access  Private (Authenticated)
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const jobQuery = { companyId: company._id };
    if (req.user.role === 'student') {
      jobQuery.status = 'Open';
    }

    const jobs = await Job.find(jobQuery).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        company,
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new recruiting company
// @route   POST /api/companies
// @access  Private (Admin)
export const createCompany = async (req, res, next) => {
  try {
    const { name, tier, industry, website, contactPerson, contactEmail, description, status } =
      req.body;

    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCompany) {
      // Return existing company instead of error (idempotent create)
      return res.status(200).json({
        success: true,
        message: `Company '${name}' already exists. Returning existing record.`,
        data: existingCompany,
        existing: true,
      });
    }

    const company = await Company.create({
      name: name.trim(),
      tier: tier || 'Tier 1 (Dream)',
      industry: industry || 'Information Technology / Software',
      website: website || '',
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
      description: description || '',
      status: status || 'Active',
    });

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Created New Company',
      entityType: 'Company',
      entityId: company._id.toString(),
      details: {
        companyName: company.name,
        tier: company.tier,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update company details
// @route   PUT /api/companies/:id
// @access  Private (Admin)
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Updated Company Details',
      entityType: 'Company',
      entityId: updated._id.toString(),
      details: {
        companyName: updated.name,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete or deactivate company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Check if there are active jobs
    const activeJobs = await Job.countDocuments({
      companyId: company._id,
      status: 'Open',
    });

    if (activeJobs > 0) {
      // Deactivate instead of hard deleting to prevent breaking dependencies
      company.status = 'Inactive';
      await company.save();

      await ActivityLog.create({
        actorId: req.user._id,
        actorName: req.user.name,
        action: 'Deactivated Company',
        entityType: 'Company',
        entityId: company._id.toString(),
        details: { companyName: company.name, reason: 'Had active job openings' },
      });

      return res.status(200).json({
        success: true,
        message: 'Company has active job openings so it was deactivated instead of deleted.',
        data: company,
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Deleted Company',
      entityType: 'Company',
      entityId: req.params.id,
      details: { companyName: company.name },
    });

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

