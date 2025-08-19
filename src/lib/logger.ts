// Simple centralized logger that logs only in non-production environments.

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

export const logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (!isProduction) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
};
