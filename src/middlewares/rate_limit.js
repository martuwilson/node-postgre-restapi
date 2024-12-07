import rateLimit from 'express-rate-limit';

// Configuración básica
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15'
  max: 10, // 10 requests limit per IP
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1'
  max: 100, // Límite de 100 solicitudes por IP
  message: {
    error: 'Too many requests per second. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
