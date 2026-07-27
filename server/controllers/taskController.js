import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Task from '../models/Task.js';

// @route  GET /api/tasks?search=&priority=&status=
// @access Private
export const getTasks = asyncHandler(async (req, res) => {
  const { search, priority, status } = req.query;

  const query = { owner: req.user._id };

  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (search) {
    // Case-insensitive partial match across title & description.
    // (Regex is used instead of $text here so partial/substring matches
    // work, which is what users expect from a "search box".)
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: { tasks },
  });
});

// @route  POST /api/tasks
// @access Private
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

// Shared helper: fetch a task and verify it belongs to req.user
const findOwnedTaskOrThrow = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, owner: userId });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
};

// @route  PATCH /api/tasks/:id
// @access Private
export const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTaskOrThrow(req.params.id, req.user._id);

  const { title, description, status, priority } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task },
  });
});

// @route  PATCH /api/tasks/:id/status
// @access Private
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await findOwnedTaskOrThrow(req.params.id, req.user._id);

  task.status = req.body.status;
  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: { task },
  });
});

// @route  DELETE /api/tasks/:id
// @access Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTaskOrThrow(req.params.id, req.user._id);
  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: { id: req.params.id },
  });
});
