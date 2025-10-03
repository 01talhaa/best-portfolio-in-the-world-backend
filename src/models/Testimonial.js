const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientCompany: {
    type: String,
    trim: true
  },
  clientDesignation: {
    type: String,
    trim: true
  },
  clientImage: {
    type: String, // URL
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Client image must be a valid URL'
    }
  },
  clientEmail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  quote: {
    type: String,
    required: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  serviceCategory: {
    type: String,
    enum: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Property Management', 'Real Estate', 'Software Development', 'Consulting', 'Other']
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  source: {
    type: String,
    enum: ['Website Form', 'Email', 'Phone', 'Meeting', 'Social Media', 'Third Party', 'Other'],
    default: 'Website Form'
  },
  dateGiven: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for display name
testimonialSchema.virtual('displayName').get(function() {
  if (this.clientCompany && this.clientDesignation) {
    return `${this.clientName}, ${this.clientDesignation} at ${this.clientCompany}`;
  } else if (this.clientCompany) {
    return `${this.clientName}, ${this.clientCompany}`;
  } else if (this.clientDesignation) {
    return `${this.clientName}, ${this.clientDesignation}`;
  }
  return this.clientName;
});

// Virtual for star rating display
testimonialSchema.virtual('stars').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Virtual for short quote (for previews)
testimonialSchema.virtual('shortQuote').get(function() {
  return this.quote.length > 150 ? this.quote.substring(0, 150) + '...' : this.quote;
});

// Indexes
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ featured: 1 });
testimonialSchema.index({ approved: 1 });
testimonialSchema.index({ verified: 1 });
testimonialSchema.index({ relatedProject: 1 });
testimonialSchema.index({ client: 1 });
testimonialSchema.index({ serviceCategory: 1 });
testimonialSchema.index({ dateGiven: -1 });

// Text index for search
testimonialSchema.index({
  clientName: 'text',
  clientCompany: 'text',
  quote: 'text'
});

module.exports = mongoose.model('Testimonial', testimonialSchema);