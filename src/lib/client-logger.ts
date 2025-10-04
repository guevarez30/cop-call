/**
 * Client-side logger wrapper
 *
 * Provides a lightweight logging interface for client components.
 * Uses native console methods to avoid bundle size increase from Pino.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const clientLogger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
