const BaseController = require('./BaseController');
const { TeamMember } = require('../models');

class TeamMemberController extends BaseController {
  constructor() {
    super(TeamMember);
  }

  // Get team members by skill
  getBySkill = async (req, res, next) => {
    try {
      const { skillName } = req.params;
      
      const teamMembers = await TeamMember.find({
        skills: { $regex: new RegExp(skillName, 'i') }
      }).populate('currentTeam', 'teamName');

      res.status(200).json({
        success: true,
        results: teamMembers.length,
        data: teamMembers
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team members by team
  getByTeam = async (req, res, next) => {
    try {
      const { teamId } = req.params;
      
      const teamMembers = await TeamMember.find({
        currentTeam: teamId
      }).populate('currentTeam', 'teamName');

      res.status(200).json({
        success: true,
        results: teamMembers.length,
        data: teamMembers
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team member analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Skills distribution
      const skillsAnalytics = await TeamMember.aggregate([
        { $unwind: '$skills' },
        {
          $group: {
            _id: '$skills',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      // Position distribution
      const positionAnalytics = await TeamMember.aggregate([
        {
          $group: {
            _id: '$position',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Experience levels
      const experienceAnalytics = await TeamMember.aggregate([
        {
          $addFields: {
            experienceYears: {
              $reduce: {
                input: '$experience',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $divide: [
                        {
                          $subtract: [
                            { $ifNull: ['$$this.endDate', new Date()] },
                            '$$this.startDate'
                          ]
                        },
                        31536000000 // milliseconds in a year
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$experienceYears', 2] }, then: '0-2 years' },
                  { case: { $lt: ['$experienceYears', 5] }, then: '2-5 years' },
                  { case: { $lt: ['$experienceYears', 10] }, then: '5-10 years' },
                  { case: { $gte: ['$experienceYears', 10] }, then: '10+ years' }
                ],
                default: 'Unknown'
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const totalMembers = await TeamMember.countDocuments();
      const featuredMembers = await TeamMember.countDocuments({ featured: true });

      res.status(200).json({
        success: true,
        data: {
          total: totalMembers,
          featured: featuredMembers,
          skillsDistribution: skillsAnalytics,
          positionDistribution: positionAnalytics,
          experienceDistribution: experienceAnalytics
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team member skills summary
  getSkillsSummary = async (req, res, next) => {
    try {
      const skillsSummary = await TeamMember.aggregate([
        { $unwind: '$skills' },
        {
          $group: {
            _id: '$skills',
            members: {
              $push: {
                id: '$_id',
                name: { $concat: ['$firstName', ' ', '$lastName'] },
                position: '$position',
                profileImage: '$profileImage'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.status(200).json({
        success: true,
        data: skillsSummary
      });
    } catch (error) {
      next(error);
    }
  };

  // Override the base getById to include populated fields
  getById = async (req, res, next) => {
    try {
      const teamMember = await TeamMember.findById(req.params.id)
        .populate('currentTeam', 'teamName description')
        .populate({
          path: 'relatedProjects',
          select: 'title shortDescription thumbnail category completionDate',
          populate: {
            path: 'client',
            select: 'name logo'
          }
        });

      if (!teamMember) {
        return res.status(404).json({
          success: false,
          error: 'Team member not found'
        });
      }

      res.status(200).json({
        success: true,
        data: teamMember
      });
    } catch (error) {
      next(error);
    }
  };

  // Get team members with project count
  getWithProjectCount = async (req, res, next) => {
    try {
      const teamMembers = await TeamMember.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'teamMembers.member',
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
            projects: 0
          }
        },
        {
          $sort: { projectCount: -1, createdAt: -1 }
        }
      ]);

      res.status(200).json({
        success: true,
        results: teamMembers.length,
        data: teamMembers
      });
    } catch (error) {
      next(error);
    }
  };

  // Search team members by name or skills
  searchMembers = async (req, res, next) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const searchRegex = new RegExp(query, 'i');
      
      const teamMembers = await TeamMember.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { position: searchRegex },
          { skills: searchRegex },
          { bio: searchRegex }
        ]
      }).populate('currentTeam', 'teamName');

      res.status(200).json({
        success: true,
        results: teamMembers.length,
        data: teamMembers
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TeamMemberController();