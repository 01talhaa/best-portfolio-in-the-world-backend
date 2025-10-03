const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logo: {
    type: String, // URL to client logo
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Logo must be a valid URL'
    }
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String, // URL
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  description: {
    type: String,
    maxlength: 1000
  },
  contactPerson: {
    name: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[0-9\-\s\(\)]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    }
  },
  contactEmail: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  contactPhone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[0-9\-\s\(\)]+$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  companySize: {
    type: String,
    enum: ['Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)', 'Other']
  },
  partnership: {
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold', 'Terminated'],
      default: 'Active'
    },
    type: {
      type: String,
      enum: ['One-time Project', 'Ongoing', 'Retainer', 'Partnership'],
      default: 'One-time Project'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project count
clientSchema.virtual('projectCount').get(function() {
  return this.projects ? this.projects.length : 0;
});

// Virtual for total project value (would need to be calculated from projects)
clientSchema.virtual('totalProjectValue', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  justOne: false
});

// Virtual for testimonials given by this client
clientSchema.virtual('testimonials', {
  ref: 'Testimonial',
  localField: '_id',
  foreignField: 'client',
  justOne: false
});

// Indexes
clientSchema.index({ name: 1 });
clientSchema.index({ industry: 1 });
clientSchema.index({ 'partnership.status': 1 });
clientSchema.index({ contactEmail: 1 });

module.exports = mongoose.model('Client', clientSchema);