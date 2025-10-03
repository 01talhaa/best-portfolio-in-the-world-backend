const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  company: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  inquiryType: {
    type: String,
    enum: ['General Inquiry', 'Project Quote', 'Partnership', 'Support', 'Feedback', 'Career', 'Media', 'Other'],
    default: 'General Inquiry'
  },
  interestedServices: [{
    type: String,
    enum: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Property Management', 'Real Estate', 'Software Development', 'Consulting', 'Other']
  }],
  budget: {
    type: String,
    enum: ['< $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000 - $100,000', '> $100,000', 'Not Sure']
  },
  timeline: {
    type: String,
    enum: ['ASAP', '1-3 months', '3-6 months', '6+ months', 'Flexible']
  },
  status: {
    type: String,
    enum: ['New', 'Viewed', 'In Progress', 'Responded', 'Follow-up Required', 'Converted', 'Archived', 'Spam'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  source: {
    type: String,
    enum: ['Website Contact Form', 'Landing Page', 'Social Media', 'Referral', 'Google Ads', 'Email Campaign', 'Other'],
    default: 'Website Contact Form'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },
  notes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: {
    type: Date
  },
  responseDate: {
    type: Date
  },
  conversionDate: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  isSubscribedToNewsletter: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for response time in hours
contactSubmissionSchema.virtual('responseTimeHours').get(function() {
  if (!this.responseDate) return null;
  return Math.ceil((this.responseDate - this.submittedAt) / (1000 * 60 * 60));
});

// Virtual for days since submission
contactSubmissionSchema.virtual('daysSinceSubmission').get(function() {
  return Math.ceil((new Date() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for conversion status
contactSubmissionSchema.virtual('isConverted').get(function() {
  return this.status === 'Converted';
});

// Virtual for overdue status (if follow-up date is past)
contactSubmissionSchema.virtual('isOverdue').get(function() {
  return this.followUpDate && this.followUpDate < new Date() && this.status !== 'Converted' && this.status !== 'Archived';
});

// Pre-save middleware to set response date when status changes to 'Responded'
contactSubmissionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Responded' && !this.responseDate) {
      this.responseDate = new Date();
    }
    if (this.status === 'Converted' && !this.conversionDate) {
      this.conversionDate = new Date();
    }
  }
  next();
});

// Indexes
contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ priority: 1 });
contactSubmissionSchema.index({ inquiryType: 1 });
contactSubmissionSchema.index({ submittedAt: -1 });
contactSubmissionSchema.index({ followUpDate: 1 });
contactSubmissionSchema.index({ assignedTo: 1 });
contactSubmissionSchema.index({ source: 1 });

// Text index for search
contactSubmissionSchema.index({
  name: 'text',
  email: 'text',
  company: 'text',
  subject: 'text',
  message: 'text'
});

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);