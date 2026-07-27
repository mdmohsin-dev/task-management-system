/**
 * Wraps an async route handler and forwards any rejected promise to
 * Express's `next`, so controllers never need repetitive try/catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
