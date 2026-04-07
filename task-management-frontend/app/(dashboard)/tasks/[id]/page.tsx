'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTask, Task, TaskStatus, updateTask, updateTaskStatus } from '@/lib/api';
import { getSessionFromStorage } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadTask() {
    try {
      const result = await getTask(params.id);
      setTask(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Task could not be loaded');
    }
  }

  useEffect(() => {
    const session = getSessionFromStorage();
    setRole(session.role ?? 'USER');
    loadTask();
  }, [params.id]);

  async function handleStatusUpdate(status: TaskStatus) {
    if (!task) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (role === 'ADMIN') {
        await updateTask(task.id, { status });
      } else {
        await updateTaskStatus(task.id, status);
      }
      await loadTask();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Status update failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Task Detail</h1>
        <button className="btn btn-ghost" onClick={() => router.push('/tasks')}>
          Back
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {!task ? (
        <p className="info">Loading task...</p>
      ) : (
        <article className="card stack">
          <h2>{task.title}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>{task.description || 'No description'}</p>
          <div className="row">
            <strong>Status:</strong>
            <StatusBadge status={task.status} />
          </div>
          <div className="row">
            <label htmlFor="status-change"><strong>Update Status</strong></label>
            <select
              id="status-change"
              className="select"
              defaultValue={task.status}
              onChange={(event) => handleStatusUpdate(event.target.value as TaskStatus)}
              disabled={isSaving}
            >
              <option value="PENDING">Todo</option>
              <option value="PROCESSING">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <small style={{ color: 'var(--muted)' }}>
            Created: {new Date(task.createdAt).toLocaleString()} | Updated: {new Date(task.updatedAt).toLocaleString()}
          </small>
        </article>
      )}
    </section>
  );
}
