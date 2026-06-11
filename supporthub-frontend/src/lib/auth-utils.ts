
export const handleAuthError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      console.error(`Auth Error${context ? ` (${context})` : ''}: ${error.message}`);
    } else {
      console.error(`Auth Error${context ? ` (${context})` : ''}: ${String(error)}`);
    }
  }
};
