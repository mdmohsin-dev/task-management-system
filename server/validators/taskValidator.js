import ApiError from '../utils/ApiError.js';
import Task from '../models/Task.js';

export const validateCreateTask = (req, res, next) => {
  const { title, status, priority } = req.body;
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('Title is required');
  }
  if (status && !Task.STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${Task.STATUSES.join(', ')}`);
  }
  if (priority && !Task.PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${Task.PRIORITIES.join(', ')}`);
  }

  if (errors.length) {
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  if (!status || !Task.STATUSES.includes(status)) {
    return next(
      new ApiError(400, `Status must be one of: ${Task.STATUSES.join(', ')}`)
    );
  }
  next();
};
