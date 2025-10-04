import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.PINO_LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development, JSON in production
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  } : undefined,

  // Base configuration
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'email',
      '*.password',
      '*.email',
      'req.headers.authorization',
      'token',
      'api_key',
      'session_id',
      'access_token',
      'refresh_token',
    ],
    censor: '[REDACTED]'
  },
});
