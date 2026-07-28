import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as taskService from '../services/taskService';

/**
 * Encapsulates all task data-fetching and mutation logic so pages/components
 * stay declarative. Handles loading/error state and keeps local state in
 * sync after create/update/delete without needing a full refetch.
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
    const newTask = await taskService.createTask(payload);
    setTasks((prev) => [newTask, ...prev]);
    toast.success('Task created');
    return newTask;
  };

  const editTask = async (id, payload) => {
    const updated = await taskService.updateTask(id, payload);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    toast.success('Task updated');
    return updated;
  };

  const moveTask = async (id, newStatus) => {
    // Optimistic update for a snappy drag-and-drop feel
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
