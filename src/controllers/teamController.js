const BaseController = require('./BaseController');
const { Team } = require('../models');

class TeamController extends BaseController {
  constructor() {
    super(Team);
  }

  // Override getAll to populate members
  getAll = async (req, res, next) => {
    try {
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = Team.find(JSON.parse(queryStr))
        .populate('members', 'firstName lastName position profileImage skills')
        .populate('teamLead', 'firstName lastName position profileImage')
        .populate('relatedProjects', 'title thumbnail completionDate');

      // Search functionality
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
          $or: [
            { teamName: searchRegex },
            { description: searchRegex },
            { tags: searchRegex }
          ]
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

      const totalDocuments = await Team.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      const teams = await query;

      res.status(200).json({
        success: true,
        results: teams.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: teams
      });
    } catch (error) {
      next(error);
    }
  };

  // Override getById to populate all fields
  getById = async (req, res, next) => {
    try {
      const team = await Team.findById(req.params.id)
        .populate('members', 'firstName lastName position profileImage skills bio experience')
        .populate('teamLead', 'firstName lastName position profileImage bio')
        .populate({
          path: 'relatedProjects',
          select: 'title shortDescription thumbnail category completionDate status',
          populate: {
            path: 'client',
            select: 'name logo'
          }
        });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Team size distribution
      const teamSizeAnalytics = await Team.aggregate([
        {
          $addFields: {
            memberCount: { $size: '$members' }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$memberCount', 3] }, then: 'Small (1-2)' },
                  { case: { $lt: ['$memberCount', 6] }, then: 'Medium (3-5)' },
                  { case: { $lt: ['$memberCount', 11] }, then: 'Large (6-10)' },
                  { case: { $gte: ['$memberCount', 11] }, then: 'Extra Large (11+)' }
                ],
                default: 'Unknown'
              }
            },
            count: { $sum: 1 },
            teams: { $push: '$teamName' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Tags distribution
      const tagsAnalytics = await Team.aggregate([
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Active vs inactive teams
      const statusAnalytics = await Team.aggregate([
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalTeams = await Team.countDocuments();
      const activeTeams = await Team.countDocuments({ isActive: true });

      res.status(200).json({
        success: true,
        data: {
          total: totalTeams,
          active: activeTeams,
          inactive: totalTeams - activeTeams,
          sizeDistribution: teamSizeAnalytics,
          tagsDistribution: tagsAnalytics,
          statusDistribution: statusAnalytics
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team performance metrics
  getPerformanceMetrics = async (req, res, next) => {
    try {
      const teamPerformance = await Team.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'teamMembers.member',
            as: 'allProjects'
          }
        },
        {
          $addFields: {
            projectCount: { $size: '$relatedProjects' },
            memberCount: { $size: '$members' },
            projectsPerMember: {
              $cond: [
                { $gt: [{ $size: '$members' }, 0] },
                { $divide: [{ $size: '$relatedProjects' }, { $size: '$members' }] },
                0
              ]
            }
          }
        },
        {
          $project: {
            teamName: 1,
            memberCount: 1,
            projectCount: 1,
            projectsPerMember: { $round: ['$projectsPerMember', 2] },
            isActive: 1
          }
        },
        { $sort: { projectsPerMember: -1 } }
      ]);

      res.status(200).json({
        success: true,
        data: teamPerformance
      });
    } catch (error) {
      next(error);
    }
  };

  // Get teams by specialty/tag
  getBySpecialty = async (req, res, next) => {
    try {
      const { specialty } = req.params;
      
      const teams = await Team.find({
        $or: [
          { tags: { $regex: new RegExp(specialty, 'i') } },
          { specialties: { $regex: new RegExp(specialty, 'i') } }
        ]
      })
      .populate('members', 'firstName lastName position profileImage')
      .populate('teamLead', 'firstName lastName position');

      res.status(200).json({
        success: true,
        results: teams.length,
        data: teams
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team workload (current active projects)
  getWorkload = async (req, res, next) => {
    try {
      const workload = await Team.aggregate([
        {
          $lookup: {
            from: 'projects',
            let: { teamId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$$teamId', '$teamMembers.member'] },
                      { $in: ['$status', ['Planning', 'In Progress', 'Review']] }
                    ]
                  }
                }
              }
            ],
            as: 'activeProjects'
          }
        },
        {
          $addFields: {
            activeProjectCount: { $size: '$activeProjects' },
            memberCount: { $size: '$members' },
            workloadRatio: {
              $cond: [
                { $gt: [{ $size: '$members' }, 0] },
                { $divide: [{ $size: '$activeProjects' }, { $size: '$members' }] },
                0
              ]
            }
          }
        },
        {
          $project: {
            teamName: 1,
            memberCount: 1,
            activeProjectCount: 1,
            workloadRatio: { $round: ['$workloadRatio', 2] },
            isActive: 1
          }
        },
        { $sort: { workloadRatio: -1 } }
      ]);

      res.status(200).json({
        success: true,
        data: workload
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TeamController();