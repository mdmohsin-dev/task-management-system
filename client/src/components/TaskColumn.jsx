import { useState } from 'react';
import TaskCard from './TaskCard';

export default function TaskColumn({ status, label, tasks, onEdit, onDelete, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    onDrop(taskId, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-[400px] flex-col rounded-xl border-2 border-dashed p-3 transition ${
        isDragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-100/50'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">No tasks here</p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}
