const BaseController = require('./BaseController');
const { Client } = require('../models');

class ClientController extends BaseController {
  constructor() {
    super(Client);
  }

  // Override getById to populate projects
  getById = async (req, res, next) => {
    try {
      const client = await Client.findById(req.params.id)
        .populate({
          path: 'projects',
          select: 'title shortDescription thumbnail category status startDate completionDate',
          populate: {
            path: 'servicesUsed',
            select: 'name category'
          }
        });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      res.status(200).json({
        success: true,
        data: client
      });
    } catch (error) {
      next(error);
    }
  };

  // Get clients by industry
  getByIndustry = async (req, res, next) => {
    try {
      const { industry } = req.params;
      
      const clients = await Client.find({
        industry: new RegExp(industry, 'i')
      }).populate('projects', 'title status completionDate');

      res.status(200).json({
        success: true,
        results: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  };

  // Get client analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Industry distribution
      const industryAnalytics = await Client.aggregate([
        {
          $group: {
            _id: '$industry',
            count: { $sum: 1 },
            activeClients: {
              $sum: { $cond: [{ $eq: ['$partnership.status', 'Active'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Company size distribution
      const sizeAnalytics = await Client.aggregate([
        {
          $group: {
            _id: '$companySize',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Partnership status distribution
      const statusAnalytics = await Client.aggregate([
        {
          $group: {
            _id: '$partnership.status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Partnership type distribution
      const typeAnalytics = await Client.aggregate([
        {
          $group: {
            _id: '$partnership.type',
            count: { $sum: 1 }
          }
        }
      ]);

      // Geographic distribution
      const geoAnalytics = await Client.aggregate([
        {
          $group: {
            _id: {
              country: '$location.country',
              state: '$location.state'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      // Client acquisition over time
      const acquisitionTrend = await Client.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$partnership.startDate' },
              month: { $month: '$partnership.startDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      const totalClients = await Client.countDocuments();
      const activeClients = await Client.countDocuments({ 'partnership.status': 'Active' });

      res.status(200).json({
        success: true,
        data: {
          total: totalClients,
          active: activeClients,
          industryDistribution: industryAnalytics,
          sizeDistribution: sizeAnalytics,
          statusDistribution: statusAnalytics,
          typeDistribution: typeAnalytics,
          geographicDistribution: geoAnalytics,
          acquisitionTrend
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get top clients by project count
  getTopClients = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      const topClients = await Client.aggregate([
        {
          $addFields: {
            projectCount: { $size: '$projects' }
          }
        },
        { $sort: { projectCount: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'projects',
            localField: 'projects',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        {
          $project: {
            name: 1,
            logo: 1,
            industry: 1,
            projectCount: 1,
            'partnership.status': 1,
            completedProjects: {
              $size: {
                $filter: {
                  input: '$projectDetails',
                  cond: { $eq: ['$$this.status', 'Completed'] }
                }
              }
            }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        results: topClients.length,
        data: topClients
      });
    } catch (error) {
      next(error);
    }
  };

  // Get client satisfaction metrics
  getSatisfactionMetrics = async (req, res, next) => {
    try {
      const satisfactionMetrics = await Client.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'client',
            as: 'clientProjects'
          }
        },
        {
          $unwind: {
            path: '$clientProjects',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$clientProjects.testimonials',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            clientName: { $first: '$name' },
            industry: { $first: '$industry' },
            projectCount: { $sum: { $cond: [{ $ne: ['$clientProjects', null] }, 1, 0] } },
            totalRatings: { $sum: { $cond: [{ $ne: ['$clientProjects.testimonials.rating', null] }, 1, 0] } },
            averageRating: { $avg: '$clientProjects.testimonials.rating' },
            totalTestimonials: { $sum: { $cond: [{ $ne: ['$clientProjects.testimonials', null] }, 1, 0] } }
          }
        },
        {
          $project: {
            clientName: 1,
            industry: 1,
            projectCount: 1,
            averageRating: { $round: ['$averageRating', 2] },
            totalTestimonials: 1,
            satisfactionLevel: {
              $switch: {
                branches: [
                  { case: { $gte: ['$averageRating', 4.5] }, then: 'Excellent' },
                  { case: { $gte: ['$averageRating', 4.0] }, then: 'Very Good' },
                  { case: { $gte: ['$averageRating', 3.5] }, then: 'Good' },
                  { case: { $gte: ['$averageRating', 3.0] }, then: 'Fair' },
                  { case: { $lt: ['$averageRating', 3.0] }, then: 'Poor' }
                ],
                default: 'No Rating'
              }
            }
          }
        },
        { $sort: { averageRating: -1 } }
      ]);

      res.status(200).json({
        success: true,
        results: satisfactionMetrics.length,
        data: satisfactionMetrics
      });
    } catch (error) {
      next(error);
    }
  };

  // Get client retention metrics
  getRetentionMetrics = async (req, res, next) => {
    try {
      const retentionMetrics = await Client.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'client',
            as: 'projects'
          }
        },
        {
          $addFields: {
            projectCount: { $size: '$projects' },
            isRetained: { $gt: [{ $size: '$projects' }, 1] },
            partnershipDuration: {
              $divide: [
                { $subtract: [new Date(), '$partnership.startDate'] },
                86400000 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            retainedClients: { $sum: { $cond: ['$isRetained', 1, 0] } },
            avgPartnershipDuration: { $avg: '$partnershipDuration' },
            avgProjectsPerClient: { $avg: '$projectCount' }
          }
        },
        {
          $project: {
            _id: 0,
            totalClients: 1,
            retainedClients: 1,
            retentionRate: {
              $multiply: [
                { $divide: ['$retainedClients', '$totalClients'] },
                100
              ]
            },
            avgPartnershipDuration: { $round: ['$avgPartnershipDuration', 0] },
            avgProjectsPerClient: { $round: ['$avgProjectsPerClient', 2] }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: retentionMetrics[0] || {
          totalClients: 0,
          retainedClients: 0,
          retentionRate: 0,
          avgPartnershipDuration: 0,
          avgProjectsPerClient: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Search clients
  searchClients = async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const searchRegex = new RegExp(query, 'i');
      
      const clients = await Client.find({
        $or: [
          { name: searchRegex },
          { industry: searchRegex },
          { description: searchRegex },
          { contactPerson: searchRegex },
          { 'location.city': searchRegex },
          { 'location.country': searchRegex }
        ]
      }).populate('projects', 'title status completionDate');

      res.status(200).json({
        success: true,
        results: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ClientController();