// Base controller with common CRUD operations
class BaseController {
  constructor(Model) {
    this.Model = Model;
  }

  // Get all documents with filtering, sorting, pagination
  getAll = async (req, res, next) => {
    try {
      // Build query
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludedFields.forEach(el => delete queryObj[el]);

      // Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      let query = this.Model.find(JSON.parse(queryStr));

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

      // Field limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
      }

      // Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 20;
      const skip = (page - 1) * limit;
      
      query = query.skip(skip).limit(limit);

      // Get total count for pagination info
      const totalDocuments = await this.Model.countDocuments(JSON.parse(queryStr));
      const totalPages = Math.ceil(totalDocuments / limit);

      // Execute query
      const documents = await query;

      res.status(200).json({
        success: true,
        results: documents.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        data: documents
      });
    } catch (error) {
      next(error);
    }
  };

  // Get single document by ID
  getById = async (req, res, next) => {
    try {
      let query = this.Model.findById(req.params.id);
      
      // Apply population if defined in the model
      if (this.Model.schema.options.populate) {
        query = query.populate(this.Model.schema.options.populate);
      }

      const document = await query;

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new document
  create = async (req, res, next) => {
    try {
      const document = await this.Model.create(req.body);

      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  };

  // Update document by ID
  update = async (req, res, next) => {
    try {
      const document = await this.Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete document by ID
  delete = async (req, res, next) => {
    try {
      const document = await this.Model.findByIdAndDelete(req.params.id);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.status(204).json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  // Get featured documents
  getFeatured = async (req, res, next) => {
    try {
      const documents = await this.Model.find({ featured: true })
        .sort('-createdAt')
        .limit(10);

      res.status(200).json({
        success: true,
        results: documents.length,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  };

  // Search documents
  search = async (req, res, next) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const documents = await this.Model.find({
        $text: { $search: q }
      }).sort({ score: { $meta: 'textScore' } });

      res.status(200).json({
        success: true,
        results: documents.length,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  };

  // Get statistics
  getStats = async (req, res, next) => {
    try {
      const totalDocuments = await this.Model.countDocuments();
      const featuredDocuments = await this.Model.countDocuments({ featured: true });
      
      res.status(200).json({
        success: true,
        data: {
          total: totalDocuments,
          featured: featuredDocuments
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BaseController;