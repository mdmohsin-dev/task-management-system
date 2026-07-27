/**
 * Custom error class used throughout the app so the centralized error
 * handler can rely on a consistent shape (statusCode + message).
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
