const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be non-unique
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
  },
  position: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  profileImage: {
    type: String, // URL
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Profile image must be a valid URL'
    }
  },
  socialLinks: {
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    },
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?github\.com\//.test(v);
        },
        message: 'Please enter a valid GitHub URL'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?(twitter|x)\.com\//.test(v);
        },
        message: 'Please enter a valid Twitter/X URL'
      }
    },
    portfolio: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Portfolio must be a valid URL'
      }
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String
    },
    certificates: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Certificate URL must be valid'
        }
      },
      issueDate: {
        type: Date
      }
    }],
    certificateImages: [{
      type: String, // URLs
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Certificate image URL must be valid'
      }
    }]
  }],
  experience: [{
    jobTitle: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date // Optional for current job
    },
    description: {
      type: String
    },
    achievements: [{
      type: String
    }],
    images: [{
      type: String, // URLs related to their work/projects at that company
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Experience image URL must be valid'
      }
    }]
  }],
  awards: [{
    name: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    issuer: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
  }],
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
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

// Virtual for full name
teamMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for years of experience
teamMemberSchema.virtual('totalExperienceYears').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

// Virtual for current position (latest experience)
teamMemberSchema.virtual('currentPosition').get(function() {
  if (!this.experience || this.experience.length === 0) return this.position;
  
  const currentJob = this.experience.find(exp => !exp.endDate);
  return currentJob ? currentJob.jobTitle : this.position;
});

// Indexes
teamMemberSchema.index({ firstName: 1, lastName: 1 });
teamMemberSchema.index({ email: 1 });
teamMemberSchema.index({ skills: 1 });
teamMemberSchema.index({ featured: 1 });
teamMemberSchema.index({ currentTeam: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);