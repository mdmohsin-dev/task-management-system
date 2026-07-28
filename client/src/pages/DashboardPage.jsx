import { useMemo, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useTasks } from '../hooks/useTasks';
import { TASK_STATUSES } from '../constants';
import DashboardLayout from '../layouts/DashboardLayout';
import FilterBar from '../components/FilterBar';
import TaskColumn from '../components/TaskColumn';
import TaskForm from '../components/TaskForm';

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState('');
  const [priority, setPriority] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { tasks, isLoading, addTask, editTask, moveTask, removeTask } = useTasks({
    search: debouncedSearch,
    priority,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);

  const tasksByStatus = useMemo(() => {
    const grouped = { todo: [], 'in-progress': [], completed: [] };
    for (const task of tasks) {
      if (grouped[task.status]) grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  const openNewTaskForm = () => {
    setTaskBeingEdited(null);
    setIsFormOpen(true);
  };

  const openEditTaskForm = (task) => {
    setTaskBeingEdited(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values) => {
    if (taskBeingEdited) {
      await editTask(taskBeingEdited._id, values);
    } else {
      await addTask(values);
    }
  };

  const handleDrop = (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      moveTask(taskId, newStatus);
    }
  };

  return (
    <DashboardLayout>
      <FilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        priority={priority}
        onPriorityChange={setPriority}
        onNewTask={openNewTaskForm}
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((s) => (
            <TaskColumn
              key={s.value}
              status={s.value}
              label={s.label}
              tasks={tasksByStatus[s.value]}
              onEdit={openEditTaskForm}
              onDelete={removeTask}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <TaskForm
          initialTask={taskBeingEdited}
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
