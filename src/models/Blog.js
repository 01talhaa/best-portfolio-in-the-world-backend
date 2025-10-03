const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    required: true
  },
  content: {
    type: String, // Rich text/HTML
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  thumbnail: {
    type: String, // URL
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail must be a valid URL'
    }
  },
  images: [{
    type: String, // Additional images for the blog post
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be valid'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Design', 'Business', 'Real Estate', 'Industry Insights', 'Case Studies', 'Tutorials', 'News', 'Other']
  },
  readTimeMinutes: {
    type: Number,
    min: 1,
    max: 120
  },
  publishedDate: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  seoMeta: {
    title: {
      type: String,
      maxlength: 60
    },
    description: {
      type: String,
      maxlength: 160
    },
    keywords: {
      type: String,
      maxlength: 255
    },
    canonicalUrl: String
  },
  socialMedia: {
    twitterCard: String,
    ogImage: String,
    ogDescription: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000
    },
    approved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for published status
blogSchema.virtual('isPublished').get(function() {
  return this.status === 'Published' && this.publishedDate && this.publishedDate <= new Date();
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.filter(comment => comment.approved).length : 0;
});

// Virtual for estimated read time (if not manually set)
blogSchema.virtual('estimatedReadTime').get(function() {
  if (this.readTimeMinutes) return this.readTimeMinutes;
  
  // Estimate based on content length (average 200 words per minute)
  const wordCount = this.content ? this.content.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
});

// Pre-save middleware to auto-generate slug from title if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Auto-generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    // Strip HTML tags and get first 200 characters
    const textContent = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');
  }
  
  // Auto-calculate read time if not provided
  if (!this.readTimeMinutes && this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  }
  
  next();
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedDate: -1 });
blogSchema.index({ views: -1 });

// Text index for search
blogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Blog', blogSchema);