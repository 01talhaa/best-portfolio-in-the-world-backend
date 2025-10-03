const BaseController = require('./BaseController');
const { Project } = require('../models');

class ProjectController extends BaseController {
  constructor() {
    super(Project);
  }

  // Override getAll to include population
  getAll = async (req, res, next) => {
    try {
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      // Handle special filters
      if (queryObj.client) {
        queryObj.client = queryObj.client;
      }
      if (queryObj.teamMember) {
        queryObj['teamMembers.member'] = queryObj.teamMember;
        delete queryObj.teamMember;
      }
      if (queryObj.service) {
        queryObj.servicesUsed = queryObj.service;
        delete queryObj.service;
      }

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = Project.find(JSON.parse(queryStr))
        .populate('client', 'name logo industry')
        .populate('teamMembers.member', 'firstName lastName position profileImage')
        .populate('servicesUsed', 'name category icon');

      // Search functionality
      if (req.query.search) {
        query = query.find({
          $text: { $search: req.query.search }
        });
      }

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      // Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 20;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);

      const totalDocuments = await Project.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      const projects = await query;

      res.status(200).json({
        success: true,
        results: projects.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: projects
      });
    } catch (error) {
      next(error);
    }
  };

  // Override getById to include full population
  getById = async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('client', 'name logo industry website description contactPerson')
        .populate('teamMembers.member', 'firstName lastName position profileImage bio skills')
        .populate('servicesUsed', 'name description category icon');

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  };

  // Get projects by category
  getByCategory = async (req, res, next) => {
    try {
      const { categoryName } = req.params;
      
      const projects = await Project.find({ 
        category: new RegExp(categoryName, 'i') 
      })
      .populate('client', 'name logo')
      .populate('servicesUsed', 'name category')
      .sort('-completionDate');

      res.status(200).json({
        success: true,
        results: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  };

  // Get projects by status
  getByStatus = async (req, res, next) => {
    try {
      const { status } = req.params;
      
      const projects = await Project.find({ status })
        .populate('client', 'name logo')
        .populate('teamMembers.member', 'firstName lastName position')
        .sort('-startDate');

      res.status(200).json({
        success: true,
        results: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  };

  // Get project analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Status distribution
      const statusAnalytics = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Category distribution
      const categoryAnalytics = await Project.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgDuration: {
              $avg: {
                $cond: [
                  { $and: ['$startDate', '$completionDate'] },
                  {
                    $divide: [
                      { $subtract: ['$completionDate', '$startDate'] },
                      86400000 // Convert to days
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

      // Monthly project completion trend
      const monthlyTrend = await Project.aggregate([
        {
          $match: {
            completionDate: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$completionDate' },
              month: { $month: '$completionDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      // Team performance
      const teamPerformance = await Project.aggregate([
        { $unwind: '$teamMembers' },
        {
          $group: {
            _id: '$teamMembers.member',
            projectCount: { $sum: 1 },
            completedProjects: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'teammembers',
            localField: '_id',
            foreignField: '_id',
            as: 'member'
          }
        },
        { $unwind: '$member' },
        {
          $project: {
            memberName: { $concat: ['$member.firstName', ' ', '$member.lastName'] },
            position: '$member.position',
            projectCount: 1,
            completedProjects: 1,
            completionRate: {
              $cond: [
                { $gt: ['$projectCount', 0] },
                { $multiply: [{ $divide: ['$completedProjects', '$projectCount'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { projectCount: -1 } },
        { $limit: 10 }
      ]);

      const totalProjects = await Project.countDocuments();
      const completedProjects = await Project.countDocuments({ status: 'Completed' });
      const activeProjects = await Project.countDocuments({ 
        status: { $in: ['Planning', 'In Progress', 'Review'] } 
      });

      res.status(200).json({
        success: true,
        data: {
          total: totalProjects,
          completed: completedProjects,
          active: activeProjects,
          completionRate: totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(2) : 0,
          statusDistribution: statusAnalytics,
          categoryDistribution: categoryAnalytics,
          monthlyTrend,
          teamPerformance
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get recent projects
  getRecent = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      const recentProjects = await Project.find()
        .populate('client', 'name logo')
        .populate('servicesUsed', 'name category')
        .sort('-createdAt')
        .limit(limit);

      res.status(200).json({
        success: true,
        results: recentProjects.length,
        data: recentProjects
      });
    } catch (error) {
      next(error);
    }
  };

  // Get projects timeline
  getTimeline = async (req, res, next) => {
    try {
      const { year, month } = req.query;
      const matchConditions = {};

      if (year) {
        matchConditions.$expr = {
          $or: [
            { $eq: [{ $year: '$startDate' }, parseInt(year)] },
            { $eq: [{ $year: '$completionDate' }, parseInt(year)] }
          ]
        };
      }

      if (month && year) {
        matchConditions.$expr = {
          $or: [
            {
              $and: [
                { $eq: [{ $year: '$startDate' }, parseInt(year)] },
                { $eq: [{ $month: '$startDate' }, parseInt(month)] }
              ]
            },
            {
              $and: [
                { $eq: [{ $year: '$completionDate' }, parseInt(year)] },
                { $eq: [{ $month: '$completionDate' }, parseInt(month)] }
              ]
            }
          ]
        };
      }

      const timeline = await Project.find(matchConditions)
        .populate('client', 'name logo')
        .sort('startDate')
        .select('title startDate completionDate status category client thumbnail');

      res.status(200).json({
        success: true,
        results: timeline.length,
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  };

  // Get project recommendations based on client industry or similar projects
  getRecommendations = async (req, res, next) => {
    try {
      const { projectId } = req.params;
      
      const currentProject = await Project.findById(projectId);
      if (!currentProject) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Find similar projects based on category, services, or client
      const recommendations = await Project.find({
        _id: { $ne: projectId },
        $or: [
          { category: currentProject.category },
          { servicesUsed: { $in: currentProject.servicesUsed } },
          { client: currentProject.client }
        ]
      })
      .populate('client', 'name logo')
      .populate('servicesUsed', 'name category')
      .limit(5)
      .sort('-createdAt');

      res.status(200).json({
        success: true,
        results: recommendations.length,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProjectController();