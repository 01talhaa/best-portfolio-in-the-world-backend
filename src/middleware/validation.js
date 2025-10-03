const Joi = require('joi');

// Common validation schemas
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
const urlSchema = Joi.string().uri({ scheme: ['http', 'https'] });
const emailSchema = Joi.string().email().lowercase();
const phoneSchema = Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/);
const phoneSchemaFlexible = Joi.string().pattern(/^[\+]?[0-9\-\s\(\)]+$/);

// Service validation
const serviceValidation = {
  create: Joi.object({
    name: Joi.string().required().trim().max(100),
    description: Joi.string().required().max(2000),
    shortDescription: Joi.string().max(200),
    icon: urlSchema,
    featured: Joi.boolean(),
    category: Joi.string().required().valid(
      'Web Development', 'Mobile Development', 'UI/UX Design', 
      'Property Management', 'Real Estate', 'Software Development', 
      'Consulting', 'Other'
    ),
    tags: Joi.array().items(Joi.string().trim()),
    images: Joi.array().items(urlSchema),
    videos: Joi.array().items(urlSchema),
    priceRange: Joi.string(),
    relatedProjects: Joi.array().items(objectIdSchema)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().max(2000),
    shortDescription: Joi.string().max(200),
    icon: urlSchema,
    featured: Joi.boolean(),
    category: Joi.string().valid(
      'Web Development', 'Mobile Development', 'UI/UX Design', 
      'Property Management', 'Real Estate', 'Software Development', 
      'Consulting', 'Other'
    ),
    tags: Joi.array().items(Joi.string().trim()),
    images: Joi.array().items(urlSchema),
    videos: Joi.array().items(urlSchema),
    priceRange: Joi.string(),
    relatedProjects: Joi.array().items(objectIdSchema)
  })
};

// Team Member validation
const teamMemberValidation = {
  create: Joi.object({
    firstName: Joi.string().required().trim().max(50),
    lastName: Joi.string().required().trim().max(50),
    email: emailSchema,
    phone: phoneSchemaFlexible,
    position: Joi.string().required().max(100),
    bio: Joi.string().max(1000),
    profileImage: urlSchema,
    socialLinks: Joi.object({
      linkedin: Joi.string().pattern(/^https?:\/\/(www\.)?linkedin\.com\//),
      github: Joi.string().pattern(/^https?:\/\/(www\.)?github\.com\//),
      twitter: Joi.string().pattern(/^https?:\/\/(www\.)?(twitter|x)\.com\//),
      portfolio: urlSchema
    }),
    skills: Joi.array().items(Joi.string().trim()),
    featured: Joi.boolean(),
    education: Joi.array().items(Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      description: Joi.string(),
      certificates: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        url: urlSchema,
        issueDate: Joi.date()
      })),
      certificateImages: Joi.array().items(urlSchema)
    })),
    experience: Joi.array().items(Joi.object({
      jobTitle: Joi.string().required(),
      companyName: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      description: Joi.string(),
      achievements: Joi.array().items(Joi.string()),
      images: Joi.array().items(urlSchema)
    })),
    awards: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      year: Joi.number().required().min(1900).max(new Date().getFullYear() + 1),
      issuer: Joi.string().required(),
      description: Joi.string()
    })),
    currentTeam: objectIdSchema,
    relatedProjects: Joi.array().items(objectIdSchema)
  }),
  
  update: Joi.object({
    firstName: Joi.string().trim().max(50),
    lastName: Joi.string().trim().max(50),
    email: emailSchema,
    phone: phoneSchemaFlexible,
    position: Joi.string().max(100),
    bio: Joi.string().max(1000),
    profileImage: urlSchema,
    socialLinks: Joi.object({
      linkedin: Joi.string().pattern(/^https?:\/\/(www\.)?linkedin\.com\//),
      github: Joi.string().pattern(/^https?:\/\/(www\.)?github\.com\//),
      twitter: Joi.string().pattern(/^https?:\/\/(www\.)?(twitter|x)\.com\//),
      portfolio: urlSchema
    }),
    skills: Joi.array().items(Joi.string().trim()),
    featured: Joi.boolean(),
    education: Joi.array().items(Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      description: Joi.string(),
      certificates: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        url: urlSchema,
        issueDate: Joi.date()
      })),
      certificateImages: Joi.array().items(urlSchema)
    })),
    experience: Joi.array().items(Joi.object({
      jobTitle: Joi.string().required(),
      companyName: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      description: Joi.string(),
      achievements: Joi.array().items(Joi.string()),
      images: Joi.array().items(urlSchema)
    })),
    awards: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      year: Joi.number().required().min(1900).max(new Date().getFullYear() + 1),
      issuer: Joi.string().required(),
      description: Joi.string()
    })),
    currentTeam: objectIdSchema,
    relatedProjects: Joi.array().items(objectIdSchema)
  })
};

// Contact validation with flexible phone
const contactValidation = {
  create: Joi.object({
    name: Joi.string().required().trim().max(100),
    email: emailSchema.required(),
    phone: phoneSchemaFlexible,
    subject: Joi.string().required().trim().max(200),
    message: Joi.string().required().max(2000),
    service: Joi.string().max(100),
    budget: Joi.string().max(100),
    timeline: Joi.string().max(100),
    source: Joi.string().valid('Website', 'Email', 'Phone', 'Social Media', 'Referral', 'Other'),
    urgency: Joi.string().valid('Low', 'Medium', 'High', 'Urgent')
  })
};

// Auth validation
const authValidation = {
  register: Joi.object({
    username: Joi.string().required().trim().min(3).max(30),
    email: emailSchema.required(),
    password: Joi.string().required().min(6).max(100),
    role: Joi.string().valid('Admin', 'Editor', 'Viewer', 'Manager')
  }),
  
  login: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().required()
  })
};

// AI validation
const aiValidation = {
  chat: Joi.object({
    message: Joi.string().required().trim().max(1000),
    context: Joi.string().max(2000),
    sessionId: Joi.string(),
    temperature: Joi.number().min(0).max(2)
  }),
  
  assistant: Joi.object({
    query: Joi.string().required().trim().max(1000),
    preferences: Joi.object({
      budget: Joi.string(),
      timeline: Joi.string(),
      projectType: Joi.string(),
      industry: Joi.string(),
      teamSize: Joi.string()
    })
  })
};

// Query validation
const queryValidation = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string(),
  order: Joi.string().valid('asc', 'desc'),
  search: Joi.string().trim(),
  category: Joi.string().trim(),
  status: Joi.string().trim(),
  featured: Joi.boolean()
});

// Validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
    
    next();
  };
};

// Add additional validations for missing schemas

// Testimonial validation
const testimonialValidation = {
  create: Joi.object({
    clientName: Joi.string().required().trim().max(100),
    clientCompany: Joi.string().trim().max(100),
    clientDesignation: Joi.string().trim().max(100),
    clientImage: urlSchema,
    clientEmail: emailSchema,
    quote: Joi.string().required().max(1000),
    rating: Joi.number().required().min(1).max(5),
    featured: Joi.boolean(),
    approved: Joi.boolean(),
    relatedProject: objectIdSchema,
    client: objectIdSchema,
    serviceCategory: Joi.string().valid(
      'Web Development', 'Mobile Development', 'UI/UX Design', 
      'Property Management', 'Real Estate', 'Software Development', 
      'Consulting', 'Other'
    ),
    location: Joi.object({
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string()
    }),
    source: Joi.string().valid(
      'Website Form', 'Email', 'Phone', 'Meeting', 'Social Media', 'Third Party', 'Other'
    ),
    dateGiven: Joi.date(),
    verified: Joi.boolean()
  })
};

// Blog validation
const blogValidation = {
  create: Joi.object({
    title: Joi.string().required().trim().max(200),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/),
    author: objectIdSchema.required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(300),
    thumbnail: urlSchema,
    images: Joi.array().items(urlSchema),
    tags: Joi.array().items(Joi.string().trim()),
    category: Joi.string().valid(
      'Technology', 'Design', 'Business', 'Industry News', 'Tutorials', 
      'Company Updates', 'Case Studies', 'Other'
    ),
    published: Joi.boolean(),
    featured: Joi.boolean(),
    publishedAt: Joi.date()
  })
};

// Client validation
const clientValidation = {
  create: Joi.object({
    name: Joi.string().required().trim().max(100),
    logo: urlSchema,
    industry: Joi.string().trim().max(100),
    website: urlSchema,
    description: Joi.string().max(1000),
    contactPerson: Joi.object({
      name: Joi.string().trim().max(100),
      title: Joi.string().trim().max(100),
      email: emailSchema,
      phone: phoneSchemaFlexible
    }),
    contactEmail: emailSchema,
    contactPhone: phoneSchemaFlexible,
    projects: Joi.array().items(objectIdSchema),
    location: Joi.object({
      address: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    }),
    companySize: Joi.string().valid(
      'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 
      'Large (201-1000)', 'Enterprise (1000+)', 'Other'
    ),
    partnership: Joi.object({
      startDate: Joi.date(),
      status: Joi.string().valid('Active', 'Inactive', 'Completed', 'On Hold'),
      type: Joi.string().valid('One-time', 'Ongoing', 'Contract', 'Partnership'),
      value: Joi.number().min(0)
    })
  })
};

// Project validation
const projectValidation = {
  create: Joi.object({
    title: Joi.string().required().trim().max(200),
    fullDescription: Joi.string().required(),
    shortDescription: Joi.string().max(300),
    thumbnail: urlSchema,
    images: Joi.array().items(urlSchema),
    videos: Joi.array().items(urlSchema),
    technologies: Joi.array().items(Joi.string().trim()),
    category: Joi.string().required().valid(
      'Website', 'Mobile App', 'Web App', 'E-commerce', 'Residential', 
      'Commercial', 'Industrial', 'Software', 'Design', 'Consulting', 'Other'
    ),
    status: Joi.string().valid('Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'),
    featured: Joi.boolean(),
    client: objectIdSchema,
    teamMembers: Joi.array().items(objectIdSchema),
    startDate: Joi.date(),
    endDate: Joi.date(),
    projectUrl: urlSchema,
    githubUrl: Joi.string().pattern(/^https?:\/\/(www\.)?github\.com\//),
    challenges: Joi.array().items(Joi.string()),
    solutions: Joi.array().items(Joi.string())
  })
};

module.exports = {
  validate,
  serviceValidation,
  teamMemberValidation,
  testimonialValidation,
  blogValidation,
  clientValidation,
  projectValidation,
  contactValidation,
  authValidation,
  aiValidation,
  queryValidation,
  objectIdSchema,
  urlSchema,
  emailSchema,
  phoneSchema,
  phoneSchemaFlexible
};
