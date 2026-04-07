import { AuditLog } from '@/lib/api';

function getTaskTitle(log: AuditLog) {
  return log.targetTask?.title || (log.dataAfter?.title as string | undefined) || (log.dataBefore?.title as string | undefined) || 'Unknown task';
}

function getStatusLabel(status: unknown) {
  if (status === 'PENDING') return 'Todo';
  if (status === 'PROCESSING') return 'In Progress';
  if (status === 'DONE') return 'Done';
  return String(status ?? 'n/a');
}

function getAssigneeLabel(log: AuditLog) {
  return log.targetTask?.assignedUser?.name || log.targetTask?.assignedUser?.email || (log.dataAfter?.assignedUserId as string | undefined) || 'Unknown user';
}

function getSummary(log: AuditLog) {
  const taskTitle = getTaskTitle(log);

  switch (log.actionType) {
    case 'TASK_CREATED':
      return `Task Created: "${taskTitle}"`;
    case 'TASK_UPDATED': {
      const beforeTitle = (log.dataBefore?.title as string | undefined) || taskTitle;
      const afterTitle = (log.dataAfter?.title as string | undefined) || taskTitle;
      if (beforeTitle !== afterTitle) {
        return `Task Updated: "${beforeTitle}" renamed to "${afterTitle}"`;
      }
      return `Task Updated: "${taskTitle}"`;
    }
    case 'TASK_STATUS_CHANGED':
    case 'TASK_STATUS_UPDATED_BY_USER': {
      const beforeStatus = getStatusLabel(log.dataBefore?.status);
      const afterStatus = getStatusLabel(log.dataAfter?.status);
      return `Status Changed: "${taskTitle}" from "${beforeStatus}" to "${afterStatus}"`;
    }
    case 'TASK_ASSIGNMENT_CHANGED':
      return `Task Assigned: "${taskTitle}" to "${getAssigneeLabel(log)}"`;
    case 'TASK_DELETED':
      return `Task Deleted: "${taskTitle}"`;
    default:
      return `Action recorded for "${taskTitle}"`;
  }
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.actor.email}</td>
              <td>{log.actionType}</td>
              <td>{getSummary(log)}</td>
            </tr>
          ))}
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4}>No audit logs found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
