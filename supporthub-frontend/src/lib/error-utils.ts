export const handleError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      console.error(`Error${context ? ` (${context})` : ''}: ${error.message}`);
    } else {
      console.error(`Error${context ? ` (${context})` : ''}: ${String(error)}`);
    }
  }
};
