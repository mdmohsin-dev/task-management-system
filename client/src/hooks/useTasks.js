import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as taskService from '../services/taskService';
import { confirmToast } from '../utils/confirmToast';

/**
 * Encapsulates all task data-fetching and mutation logic so pages/components
 * stay declarative. Handles loading/error state and keeps local state in
 * sync after create/update/delete without needing a full refetch.
 *
 * addTask, editTask, and removeTask each show a confirmation toast before
 * performing the mutation. If the user cancels, the function resolves to
 * null/undefined and no request is made.
 */
export function useTasks({ search, priority, status } = {}) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks({ search, priority, status });
      setTasks(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, priority, status]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (payload) => {
    const confirmed = await confirmToast(`Create task "${payload.title}"?`);
    if (!confirmed) return null;

    const newTask = await taskService.createTask(payload);
    setTasks((prev) => [newTask, ...prev]);
    toast.success(`"${newTask.title}" added successfully`);
    return newTask;
  };

  const editTask = async (id, payload) => {
    const confirmed = await confirmToast(
      `Save changes to "${payload.title || 'this task'}"?`
    );
    if (!confirmed) return null;

    const updated = await taskService.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    toast.success(`"${updated.title}" updated successfully`);
    return updated;
  };

  const moveTask = async (id, newStatus) => {
    // Optimistic update for a snappy drag-and-drop feel.
    // (No confirmation here on purpose — a board-column drag is a fast,
    // easily reversible action; confirming would defeat the point of drag-and-drop.)
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await taskService.updateTaskStatus(id, newStatus);
    } catch (err) {
      setTasks(previous); // revert on failure
      toast.error(err.message);
    }
  };

  const removeTask = async (id) => {
    const task = tasks.find((t) => t._id === id);
    const confirmed = await confirmToast(
      `Delete "${task?.title || 'this task'}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
    } catch (err) {
      setTasks(previous);
      toast.error(err.message);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    addTask,
    editTask,
    moveTask,
    removeTask,
  };
}