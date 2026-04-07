import { TaskStatus } from '@/lib/api';

const LABEL_MAP: Record<TaskStatus, string> = {
  PENDING: 'Todo',
  PROCESSING: 'In Progress',
  DONE: 'Done',
};

const CLASS_MAP: Record<TaskStatus, string> = {
  PENDING: 'status status-pending',
  PROCESSING: 'status status-processing',
  DONE: 'status status-done',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={CLASS_MAP[status]}>{LABEL_MAP[status]}</span>;
}
