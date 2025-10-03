const rateLimit = require('express-rate-limit');
const config = require('../config');

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || `Too many requests from this IP, please try again later.`
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message || `Too many requests from this IP, please try again later.`
      });
    }
  });
};

// General API rate limiter - Very flexible for development
const generalLimiter = createRateLimiter(
  config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  10000, // limit each IP to 10,000 requests per windowMs (very generous)
  'Too many requests from this IP, please try again later.'
);

// Flexible rate limiter for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // limit each IP to 1,000 requests per windowMs (very generous for testing)
  'Too many authentication attempts from this IP, please try again after 15 minutes.'
);

// Contact form rate limiter - More flexible
const contactLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  100, // limit each IP to 100 contact submissions per hour
  'Too many contact form submissions from this IP, please try again after 1 hour.'
);

// Search rate limiter - More flexible
const searchLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  1000, // limit each IP to 1,000 search requests per minute
  'Too many search requests from this IP, please try again after 1 minute.'
);

// AI endpoints rate limiter - More flexible
const aiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  500, // limit each IP to 500 AI requests per minute
  'Too many AI requests from this IP, please try again after 1 minute.'
);

module.exports = {
  generalLimiter,
  authLimiter,
  contactLimiter,
  searchLimiter,
  aiLimiter
};