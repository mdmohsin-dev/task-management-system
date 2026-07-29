import { Trash2, Pencil } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function TaskCard({ task, onEdit, onDelete, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-900">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-slate-500">
          {task.description}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(task)}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600"
          aria-label="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
