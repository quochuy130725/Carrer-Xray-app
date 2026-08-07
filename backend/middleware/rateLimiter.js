// Rate Limiter middleware template
const rateLimiter = (req, res, next) => {
  // Pass-through middleware, expandable for production rate limiting
  next();
};

module.exports = rateLimiter;
