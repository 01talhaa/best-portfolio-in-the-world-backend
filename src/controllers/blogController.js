const BaseController = require('./BaseController');
const { Blog } = require('../models');

class BlogController extends BaseController {
  constructor() {
    super(Blog);
  }

  // Override getAll to include published filter by default and populate author
  getAll = async (req, res, next) => {
    try {
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      // Only show published posts by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryObj.status = 'Published';
        queryObj.publishedDate = { $lte: new Date() };
      }

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      let query = Blog.find(JSON.parse(queryStr))
        .populate('author', 'firstName lastName position profileImage');

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
        query = query.sort('-publishedDate -createdAt');
      }

      // Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 20;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);

      const totalDocuments = await Blog.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      const blogs = await query;

      res.status(200).json({
        success: true,
        results: blogs.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  };

  // Get blog by slug
  getBySlug = async (req, res, next) => {
    try {
      const { slug } = req.params;
      
      const blog = await Blog.findOne({ slug })
        .populate('author', 'firstName lastName position profileImage bio')
        .populate('relatedPosts', 'title slug thumbnail publishedDate category');

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }

      // Check if published (unless admin)
      if ((!req.user || req.user.role !== 'Admin') && 
          (blog.status !== 'Published' || blog.publishedDate > new Date())) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }

      // Increment views
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

      res.status(200).json({
        success: true,
        data: blog
      });
    } catch (error) {
      next(error);
    }
  };

  // Get blogs by category
  getByCategory = async (req, res, next) => {
    try {
      const { category } = req.params;
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;

      const queryConditions = { 
        category: new RegExp(category, 'i')
      };

      // Only show published posts by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.status = 'Published';
        queryConditions.publishedDate = { $lte: new Date() };
      }
      
      const blogs = await Blog.find(queryConditions)
        .populate('author', 'firstName lastName position profileImage')
        .sort('-publishedDate')
        .skip(skip)
        .limit(limit);

      const totalDocuments = await Blog.countDocuments(queryConditions);
      const totalPages = Math.ceil(totalDocuments / limit);

      res.status(200).json({
        success: true,
        results: blogs.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  };

  // Get blogs by tag
  getByTag = async (req, res, next) => {
    try {
      const { tagName } = req.params;
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;

      const queryConditions = { 
        tags: { $regex: new RegExp(tagName, 'i') }
      };

      // Only show published posts by default (unless admin)
      if (!req.user || req.user.role !== 'Admin') {
        queryConditions.status = 'Published';
        queryConditions.publishedDate = { $lte: new Date() };
      }
      
      const blogs = await Blog.find(queryConditions)
        .populate('author', 'firstName lastName position profileImage')
        .sort('-publishedDate')
        .skip(skip)
        .limit(limit);

      const totalDocuments = await Blog.countDocuments(queryConditions);
      const totalPages = Math.ceil(totalDocuments / limit);

      res.status(200).json({
        success: true,
        results: blogs.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  };

  // Get blog analytics
  getAnalytics = async (req, res, next) => {
    try {
      // Category distribution
      const categoryAnalytics = await Blog.aggregate([
        { $match: { status: 'Published' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' },
            avgViews: { $avg: '$views' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Author productivity
      const authorAnalytics = await Blog.aggregate([
        { $match: { status: 'Published' } },
        {
          $group: {
            _id: '$author',
            postCount: { $sum: 1 },
            totalViews: { $sum: '$views' },
            avgViews: { $avg: '$views' }
          }
        },
        {
          $lookup: {
            from: 'teammembers',
            localField: '_id',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        { $unwind: '$authorInfo' },
        {
          $project: {
            authorName: { $concat: ['$authorInfo.firstName', ' ', '$authorInfo.lastName'] },
            postCount: 1,
            totalViews: 1,
            avgViews: { $round: ['$avgViews', 2] }
          }
        },
        { $sort: { postCount: -1 } }
      ]);

      // Monthly publishing trend
      const monthlyTrend = await Blog.aggregate([
        { $match: { status: 'Published', publishedDate: { $exists: true } } },
        {
          $group: {
            _id: {
              year: { $year: '$publishedDate' },
              month: { $month: '$publishedDate' }
            },
            count: { $sum: 1 },
            views: { $sum: '$views' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      // Popular tags
      const tagAnalytics = await Blog.aggregate([
        { $match: { status: 'Published' } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      // Engagement metrics
      const engagementMetrics = await Blog.aggregate([
        { $match: { status: 'Published' } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' },
            totalComments: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$comments',
                    cond: { $eq: ['$$this.approved', true] }
                  }
                }
              }
            },
            avgViews: { $avg: '$views' },
            avgLikes: { $avg: '$likes' },
            avgReadTime: { $avg: '$readTimeMinutes' }
          }
        },
        {
          $project: {
            _id: 0,
            totalPosts: 1,
            totalViews: 1,
            totalLikes: 1,
            totalComments: 1,
            avgViews: { $round: ['$avgViews', 2] },
            avgLikes: { $round: ['$avgLikes', 2] },
            avgReadTime: { $round: ['$avgReadTime', 1] }
          }
        }
      ]);

      const totalPosts = await Blog.countDocuments();
      const publishedPosts = await Blog.countDocuments({ status: 'Published' });
      const draftPosts = await Blog.countDocuments({ status: 'Draft' });

      res.status(200).json({
        success: true,
        data: {
          total: totalPosts,
          published: publishedPosts,
          drafts: draftPosts,
          categoryDistribution: categoryAnalytics,
          authorProductivity: authorAnalytics,
          monthlyTrend,
          popularTags: tagAnalytics,
          engagement: engagementMetrics[0] || {}
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get popular posts
  getPopular = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const timeframe = req.query.timeframe || 'all'; // all, week, month, year
      
      let dateFilter = {};
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (startDate) {
          dateFilter.publishedDate = { $gte: startDate };
        }
      }

      const queryConditions = {
        status: 'Published',
        publishedDate: { $lte: new Date() },
        ...dateFilter
      };

      const popularPosts = await Blog.find(queryConditions)
        .populate('author', 'firstName lastName position profileImage')
        .sort('-views -likes')
        .limit(limit)
        .select('title slug thumbnail views likes publishedDate category readTimeMinutes');

      res.status(200).json({
        success: true,
        results: popularPosts.length,
        data: popularPosts
      });
    } catch (error) {
      next(error);
    }
  };

  // Like a blog post
  likeBlog = async (req, res, next) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          likes: blog.likes
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Add comment to blog post
  addComment = async (req, res, next) => {
    try {
      const { name, email, comment } = req.body;
      
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              name,
              email,
              comment,
              approved: false, // Comments need approval
              createdAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Comment submitted successfully. It will be visible after approval.'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get related posts
  getRelatedPosts = async (req, res, next) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 5;
      
      const currentBlog = await Blog.findById(id);
      if (!currentBlog) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }

      // Find related posts based on category and tags
      const relatedPosts = await Blog.find({
        _id: { $ne: id },
        status: 'Published',
        publishedDate: { $lte: new Date() },
        $or: [
          { category: currentBlog.category },
          { tags: { $in: currentBlog.tags } }
        ]
      })
      .populate('author', 'firstName lastName')
      .sort('-publishedDate')
      .limit(limit)
      .select('title slug thumbnail publishedDate category readTimeMinutes');

      res.status(200).json({
        success: true,
        results: relatedPosts.length,
        data: relatedPosts
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BlogController();