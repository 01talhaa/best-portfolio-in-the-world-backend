const BaseController = require('./BaseController');
const { ContactSubmission } = require('../models');
const logger = require('../utils/logger');

class ContactController extends BaseController {
  constructor() {
    super(ContactSubmission);
  }

  // Override create to add additional processing
  create = async (req, res, next) => {
    try {
      // Extract IP address and user agent
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');

      const contactData = {
        ...req.body,
        ipAddress,
        userAgent,
        referrer,
        submittedAt: new Date()
      };

      const contactSubmission = await ContactSubmission.create(contactData);

      logger.info(`New contact submission received from ${contactData.email}`);

      // TODO: Send notification email to admin
      // TODO: Send auto-reply email to user
      
      res.status(201).json({
        success: true,
        message: 'Thank you for your inquiry. We will get back to you soon!',
        data: {
          id: contactSubmission._id,
          submittedAt: contactSubmission.submittedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to include additional filtering
  getAll = async (req, res, next) => {
    try {
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      // Handle special filters
      if (queryObj.priority) {
        queryObj.priority = queryObj.priority;
      }
      if (queryObj.assignedTo) {
        queryObj.assignedTo = queryObj.assignedTo;
      }

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = ContactSubmission.find(JSON.parse(queryStr))
        .populate('assignedTo', 'firstName lastName position');

      // Search functionality
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { company: searchRegex },
            { subject: searchRegex },
            { message: searchRegex }
          ]
        });
      }

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-submittedAt');
      }

      // Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 20;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);

      const totalDocuments = await ContactSubmission.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      const submissions = await query;

      res.status(200).json({
        success: true,
        results: submissions.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  };

  // Update contact submission status
  updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      
      const submission = await ContactSubmission.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          ...(status === 'Responded' && !req.body.responseDate && { responseDate: new Date() }),
          ...(status === 'Converted' && !req.body.conversionDate && { conversionDate: new Date() })
        },
        { new: true, runValidators: true }
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  // Assign contact submission to team member
  assignTo = async (req, res, next) => {
    try {
      const { assignedTo } = req.body;
      
      const submission = await ContactSubmission.findByIdAndUpdate(
        req.params.id,
        { assignedTo },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'firstName lastName position');

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  // Add note to contact submission
  addNote = async (req, res, next) => {
    try {
      const { note } = req.body;
      const addedBy = req.user._id;
      
      const submission = await ContactSubmission.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            notes: {
              note,
              addedBy,
              addedAt: new Date()
            }
          }
        },
        { new: true }
      ).populate('notes.addedBy', 'firstName lastName');

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: 'Contact submission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  };

  // Get contact analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Status distribution
      const statusAnalytics = await ContactSubmission.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Inquiry type distribution
      const inquiryTypeAnalytics = await ContactSubmission.aggregate([
        {
          $group: {
            _id: '$inquiryType',
            count: { $sum: 1 },
            avgResponseTime: {
              $avg: {
                $cond: [
                  { $and: ['$submittedAt', '$responseDate'] },
                  {
                    $divide: [
                      { $subtract: ['$responseDate', '$submittedAt'] },
                      3600000 // Convert to hours
                    ]
                  },
                  null
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Source distribution
      const sourceAnalytics = await ContactSubmission.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Monthly submission trend
      const monthlyTrend = await ContactSubmission.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$submittedAt' },
              month: { $month: '$submittedAt' }
            },
            submissions: { $sum: 1 },
            responded: { $sum: { $cond: [{ $eq: ['$status', 'Responded'] }, 1, 0] } },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      // Response time metrics
      const responseMetrics = await ContactSubmission.aggregate([
        {
          $match: {
            submittedAt: { $exists: true },
            responseDate: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTimeHours: {
              $avg: {
                $divide: [
                  { $subtract: ['$responseDate', '$submittedAt'] },
                  3600000
                ]
              }
            },
            totalResponded: { $sum: 1 }
          }
        }
      ]);

      // Conversion metrics
      const conversionMetrics = await ContactSubmission.aggregate([
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            totalConverted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
            totalResponded: { $sum: { $cond: [{ $eq: ['$status', 'Responded'] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalSubmissions: 1,
            totalConverted: 1,
            totalResponded: 1,
            conversionRate: {
              $multiply: [
                { $divide: ['$totalConverted', '$totalSubmissions'] },
                100
              ]
            },
            responseRate: {
              $multiply: [
                { $divide: ['$totalResponded', '$totalSubmissions'] },
                100
              ]
            }
          }
        }
      ]);

      const totalSubmissions = await ContactSubmission.countDocuments();
      const newSubmissions = await ContactSubmission.countDocuments({ status: 'New' });
      const overdueSubmissions = await ContactSubmission.countDocuments({
        followUpDate: { $lt: new Date() },
        status: { $nin: ['Converted', 'Archived'] }
      });

      res.status(200).json({
        success: true,
        data: {
          total: totalSubmissions,
          new: newSubmissions,
          overdue: overdueSubmissions,
          statusDistribution: statusAnalytics,
          inquiryTypeDistribution: inquiryTypeAnalytics,
          sourceDistribution: sourceAnalytics,
          monthlyTrend,
          responseMetrics: responseMetrics[0] || { avgResponseTimeHours: 0, totalResponded: 0 },
          conversionMetrics: conversionMetrics[0] || { 
            totalSubmissions: 0, 
            totalConverted: 0, 
            totalResponded: 0, 
            conversionRate: 0, 
            responseRate: 0 
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get overdue submissions
  getOverdue = async (req, res, next) => {
    try {
      const overdueSubmissions = await ContactSubmission.find({
        followUpDate: { $lt: new Date() },
        status: { $nin: ['Converted', 'Archived'] }
      })
      .populate('assignedTo', 'firstName lastName')
      .sort('followUpDate');

      res.status(200).json({
        success: true,
        results: overdueSubmissions.length,
        data: overdueSubmissions
      });
    } catch (error) {
      next(error);
    }
  };

  // Get submissions by assignee
  getByAssignee = async (req, res, next) => {
    try {
      const { assigneeId } = req.params;
      
      const submissions = await ContactSubmission.find({
        assignedTo: assigneeId
      })
      .populate('assignedTo', 'firstName lastName')
      .sort('-submittedAt');

      res.status(200).json({
        success: true,
        results: submissions.length,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  };

  // Bulk update submissions
  bulkUpdate = async (req, res, next) => {
    try {
      const { ids, updates } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs array is required'
        });
      }

      const result = await ContactSubmission.updateMany(
        { _id: { $in: ids } },
        updates
      );

      res.status(200).json({
        success: true,
        message: `Updated ${result.modifiedCount} submissions`,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ContactController();