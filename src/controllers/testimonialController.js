const BaseController = require('./BaseController');
const { Testimonial } = require('../models');

class TestimonialController extends BaseController {
  constructor() {
    super(Testimonial);
  }

  // Override getAll to show only approved testimonials by default
  getAll = async (req, res, next) => {
    try {
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      // Only show approved testimonials by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryObj.approved = true;
      }

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = Testimonial.find(JSON.parse(queryStr))
        .populate('relatedProject', 'title category thumbnail')
        .populate('client', 'name logo industry');

      // Search functionality
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
          $or: [
            { clientName: searchRegex },
            { clientCompany: searchRegex },
            { quote: searchRegex }
          ]
        });
      }

      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-dateGiven -createdAt');
      }

      // Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 20;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);

      const totalDocuments = await Testimonial.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      const testimonials = await query;

      res.status(200).json({
        success: true,
        results: testimonials.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };

  // Get testimonials by rating
  getByRating = async (req, res, next) => {
    try {
      const { rating } = req.params;
      const ratingNumber = parseInt(rating);
      
      if (ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      const queryConditions = { rating: ratingNumber };
      
      // Only show approved testimonials by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.approved = true;
      }

      const testimonials = await Testimonial.find(queryConditions)
        .populate('relatedProject', 'title category')
        .populate('client', 'name logo')
        .sort('-dateGiven');

      res.status(200).json({
        success: true,
        results: testimonials.length,
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };

  // Get testimonials by service category
  getByServiceCategory = async (req, res, next) => {
    try {
      const { category } = req.params;
      
      const queryConditions = { 
        serviceCategory: new RegExp(category, 'i')
      };
      
      // Only show approved testimonials by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.approved = true;
      }

      const testimonials = await Testimonial.find(queryConditions)
        .populate('relatedProject', 'title category')
        .populate('client', 'name logo')
        .sort('-dateGiven');

      res.status(200).json({
        success: true,
        results: testimonials.length,
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };

  // Get testimonial analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Rating distribution
      const ratingAnalytics = await Testimonial.aggregate([
        { $match: { approved: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Service category distribution
      const categoryAnalytics = await Testimonial.aggregate([
        { $match: { approved: true, serviceCategory: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$serviceCategory',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Source distribution
      const sourceAnalytics = await Testimonial.aggregate([
        { $match: { approved: true } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Monthly testimonial trend
      const monthlyTrend = await Testimonial.aggregate([
        { $match: { approved: true } },
        {
          $group: {
            _id: {
              year: { $year: '$dateGiven' },
              month: { $month: '$dateGiven' }
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      // Overall satisfaction metrics
      const satisfactionMetrics = await Testimonial.aggregate([
        { $match: { approved: true } },
        {
          $group: {
            _id: null,
            totalTestimonials: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            fiveStarCount: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            fourStarCount: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            threeStarCount: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            twoStarCount: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            oneStarCount: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalTestimonials: 1,
            averageRating: { $round: ['$averageRating', 2] },
            satisfactionRate: {
              $multiply: [
                {
                  $divide: [
                    { $add: ['$fiveStarCount', '$fourStarCount'] },
                    '$totalTestimonials'
                  ]
                },
                100
              ]
            },
            ratingBreakdown: {
              5: '$fiveStarCount',
              4: '$fourStarCount',
              3: '$threeStarCount',
              2: '$twoStarCount',
              1: '$oneStarCount'
            }
          }
        }
      ]);

      const totalTestimonials = await Testimonial.countDocuments();
      const approvedTestimonials = await Testimonial.countDocuments({ approved: true });
      const pendingTestimonials = await Testimonial.countDocuments({ approved: false });
      const featuredTestimonials = await Testimonial.countDocuments({ featured: true, approved: true });

      res.status(200).json({
        success: true,
        data: {
          total: totalTestimonials,
          approved: approvedTestimonials,
          pending: pendingTestimonials,
          featured: featuredTestimonials,
          ratingDistribution: ratingAnalytics,
          categoryDistribution: categoryAnalytics,
          sourceDistribution: sourceAnalytics,
          monthlyTrend,
          satisfaction: satisfactionMetrics[0] || {}
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Approve testimonial
  approveTestimonial = async (req, res, next) => {
    try {
      const testimonial = await Testimonial.findByIdAndUpdate(
        req.params.id,
        { approved: true },
        { new: true }
      );

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          error: 'Testimonial not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Testimonial approved successfully',
        data: testimonial
      });
    } catch (error) {
      next(error);
    }
  };

  // Reject testimonial
  rejectTestimonial = async (req, res, next) => {
    try {
      const testimonial = await Testimonial.findByIdAndUpdate(
        req.params.id,
        { approved: false },
        { new: true }
      );

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          error: 'Testimonial not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Testimonial rejected',
        data: testimonial
      });
    } catch (error) {
      next(error);
    }
  };

  // Get high-rated testimonials
  getHighRated = async (req, res, next) => {
    try {
      const minRating = parseInt(req.query.minRating) || 4;
      const limit = parseInt(req.query.limit) || 10;
      
      const queryConditions = { 
        rating: { $gte: minRating },
        approved: true 
      };

      const testimonials = await Testimonial.find(queryConditions)
        .populate('relatedProject', 'title category thumbnail')
        .populate('client', 'name logo')
        .sort('-rating -dateGiven')
        .limit(limit);

      res.status(200).json({
        success: true,
        results: testimonials.length,
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };

  // Get testimonials for a specific project
  getByProject = async (req, res, next) => {
    try {
      const { projectId } = req.params;
      
      const queryConditions = { relatedProject: projectId };
      
      // Only show approved testimonials by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.approved = true;
      }

      const testimonials = await Testimonial.find(queryConditions)
        .populate('client', 'name logo')
        .sort('-dateGiven');

      res.status(200).json({
        success: true,
        results: testimonials.length,
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };

  // Get testimonials for a specific client
  getByClient = async (req, res, next) => {
    try {
      const { clientId } = req.params;
      
      const queryConditions = { client: clientId };
      
      // Only show approved testimonials by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.approved = true;
      }

      const testimonials = await Testimonial.find(queryConditions)
        .populate('relatedProject', 'title category')
        .sort('-dateGiven');

      res.status(200).json({
        success: true,
        results: testimonials.length,
        data: testimonials
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TestimonialController();