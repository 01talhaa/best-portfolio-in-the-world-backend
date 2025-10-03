const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  icon: {
    type: String, // URL to image
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Icon must be a valid URL'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Property Management', 'Real Estate', 'Software Development', 'Consulting', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String, // URLs to service-specific visuals
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be valid'
    }
  }],
  videos: [{
    type: String, // URLs to service-specific videos
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Video URL must be valid'
    }
  }],
  benefits: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  process: [{
    stepNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  priceRange: {
    type: String,
    default: 'Custom Quote'
  },
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ featured: 1 });
serviceSchema.index({ tags: 1 });

// Virtual for project count
serviceSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'servicesUsed',
  count: true
});

module.exports = mongoose.model('Service', serviceSchema);