import Link from 'next/link';
import { Task, TaskStatus } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, canEdit, onStatusChange, onDelete }: TaskCardProps) {
  return (
    <article className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      {task.description ? <p style={{ margin: 0, color: 'var(--muted)' }}>{task.description}</p> : null}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Link href={`/tasks/${task.id}`} className="btn btn-ghost" style={{ display: 'inline-grid', placeItems: 'center' }}>
          Open Task
        </Link>
        <div className="row">
          {onStatusChange ? (
            <select
              className="select"
              defaultValue={task.status}
              onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
              aria-label="Task status"
            >
              <option value="PENDING">Todo</option>
              <option value="PROCESSING">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          ) : null}
          {canEdit && onDelete ? (
            <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
