const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortDescription: {
    type: String,
    maxlength: 300
  },
  fullDescription: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['Website', 'Mobile App', 'Web App', 'E-commerce', 'Residential', 'Commercial', 'Industrial', 'Software', 'Design', 'Consulting', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String, // URL to main project image
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail must be a valid URL'
    }
  },
  images: [{
    type: String, // URLs for project gallery
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be valid'
    }
  }],
  videos: [{
    type: String, // URLs for project videos
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Video URL must be valid'
    }
  }],
  liveLink: {
    type: String, // URL to live project
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Live link must be a valid URL'
    }
  },
  caseStudyLink: {
    type: String, // URL to case study document
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Case study link must be a valid URL'
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date
  },
  estimatedCompletionDate: {
    type: Date
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  teamMembers: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    contribution: {
      type: String
    }
  }],
  servicesUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  testimonials: [{
    clientName: {
      type: String,
      required: true
    },
    testimonialText: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  budget: {
    type: String,
    default: 'Confidential'
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  technologies: [{
    type: String,
    trim: true
  }],
  challenges: [{
    challenge: String,
    solution: String
  }],
  results: [{
    metric: String,
    value: String,
    description: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project duration in days
projectSchema.virtual('durationDays').get(function() {
  if (!this.startDate) return null;
  const endDate = this.completionDate || new Date();
  return Math.ceil((endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for project status percentage
projectSchema.virtual('progressPercentage').get(function() {
  switch(this.status) {
    case 'Planning': return 10;
    case 'In Progress': return 50;
    case 'Review': return 80;
    case 'Completed': return 100;
    case 'On Hold': return 25;
    case 'Cancelled': return 0;
    default: return 0;
  }
});

// Virtual for team member count
projectSchema.virtual('teamMemberCount').get(function() {
  return this.teamMembers ? this.teamMembers.length : 0;
});

// Virtual for average rating
projectSchema.virtual('averageRating').get(function() {
  if (!this.testimonials || this.testimonials.length === 0) return 0;
  const total = this.testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
  return Math.round((total / this.testimonials.length) * 10) / 10;
});

// Indexes
projectSchema.index({ title: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ startDate: -1 });
projectSchema.index({ completionDate: -1 });

// Text index for search
projectSchema.index({
  title: 'text',
  shortDescription: 'text',
  fullDescription: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Project', projectSchema);