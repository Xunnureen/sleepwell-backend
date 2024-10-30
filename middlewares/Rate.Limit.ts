import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Create a rate limiter for login attempts
const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  handler: (req: Request, res: Response) => {
    // Custom response when rate limit is hit
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again after 1 hour.",
    });
  },
  standardHeaders: true, // Include rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

export default loginRateLimiter;
