const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/company-portfolio',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Google Gemini AI Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,https://best-portfolio-in-the-world-backend.onrender.com',
  
  // Rate Limiting - Much more flexible defaults
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // Increased from 100 to 10,000
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // API Documentation
  API_DOCS_URL: process.env.API_DOCS_URL || '/api-docs',
  
  // Security
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 2 * 60 * 60 * 1000, // 2 hours
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Development flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'test'
};