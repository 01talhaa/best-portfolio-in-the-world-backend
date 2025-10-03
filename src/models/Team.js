const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },
  specialties: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual for project count
teamSchema.virtual('projectCount').get(function() {
  return this.relatedProjects ? this.relatedProjects.length : 0;
});

// Virtual for all skills in the team
teamSchema.virtual('allSkills', {
  ref: 'TeamMember',
  localField: 'members',
  foreignField: '_id',
  justOne: false
});

// Indexes
teamSchema.index({ teamName: 1 });
teamSchema.index({ tags: 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ teamLead: 1 });

// Pre-save middleware to ensure team lead is in members
teamSchema.pre('save', function(next) {
  if (this.teamLead && this.members && !this.members.includes(this.teamLead)) {
    this.members.push(this.teamLead);
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);