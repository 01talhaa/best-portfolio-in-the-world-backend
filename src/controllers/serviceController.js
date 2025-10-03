const BaseController = require('./BaseController');
const { Service } = require('../models');

class ServiceController extends BaseController {
  constructor() {
    super(Service);
  }

  // Get services by category
  getByCategory = async (req, res, next) => {
    try {
      const { categoryName } = req.params;
      
      const services = await Service.find({ 
        category: new RegExp(categoryName, 'i') 
      }).populate('relatedProjects', 'title thumbnail');

      res.status(200).json({
        success: true,
        results: services.length,
        data: services
      });
    } catch (error) {
      next(error);
    }
  };

  // Get services with project count
  getWithProjectCount = async (req, res, next) => {
    try {
      const services = await Service.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'servicesUsed',
            as: 'projects'
          }
        },
        {
          $addFields: {
            projectCount: { $size: '$projects' }
          }
        },
        {
          $project: {
            projects: 0 // Remove the projects array from output
          }
        },
        {
          $sort: { projectCount: -1, createdAt: -1 }
        }
      ]);

      res.status(200).json({
        success: true,
        results: services.length,
        data: services
      });
    } catch (error) {
      next(error);
    }
  };

  // Get service analytics
  getAnalytics = async (req, res, next) => {
    try {
      const analytics = await Service.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            featured: { $sum: { $cond: ['$featured', 1, 0] } }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalServices = await Service.countDocuments();
      const featuredServices = await Service.countDocuments({ featured: true });

      res.status(200).json({
        success: true,
        data: {
          total: totalServices,
          featured: featuredServices,
          byCategory: analytics
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get popular services (based on project count)
  getPopular = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const popularServices = await Service.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'servicesUsed',
            as: 'projects'
          }
        },
        {
          $addFields: {
            projectCount: { $size: '$projects' }
          }
        },
        {
          $sort: { projectCount: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            projects: 0
          }
        }
      ]);

      res.status(200).json({
        success: true,
        results: popularServices.length,
        data: popularServices
      });
    } catch (error) {
      next(error);
    }
  };

  // Override the base getById to include related projects
  getById = async (req, res, next) => {
    try {
      const service = await Service.findById(req.params.id)
        .populate({
          path: 'relatedProjects',
          select: 'title shortDescription thumbnail category tags completionDate',
          populate: {
            path: 'client',
            select: 'name logo'
          }
        });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      res.status(200).json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ServiceController();