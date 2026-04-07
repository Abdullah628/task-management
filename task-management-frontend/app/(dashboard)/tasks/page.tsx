'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { TaskForm } from '@/components/TaskForm';
import {
  AppUser,
  createTask,
  deleteTask,
  getTasks,
  getUsers,
  Task,
  TaskStatus,
  updateTask,
  updateTaskStatus,
} from '@/lib/api';
import { getSessionFromStorage } from '@/lib/auth';

export default function TasksPage() {
  const DEFAULT_LIMIT = 10;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadTasks(nextPage = page) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTasks(nextPage, DEFAULT_LIMIT);
      setTasks(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const session = getSessionFromStorage();
    const nextRole = session.role ?? 'USER';
    setRole(nextRole);

    if (nextRole === 'ADMIN') {
      getUsers()
        .then((response) => setUsers(response))
        .catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load users');
        });
    }

    loadTasks(1);
  }, []);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.title.localeCompare(b.title)),
    [tasks],
  );

  async function handleCreateTask(payload: {
    title: string;
    description?: string;
    assignedUserId?: string;
  }) {
    await createTask(payload);
    setIsCreateModalOpen(false);
    await loadTasks(page);
  }

  async function handleEditTask(payload: {
    title: string;
    description?: string;
    assignedUserId?: string;
  }) {
    if (!editingTask) {
      return;
    }

    await updateTask(editingTask.id, payload);
    setEditingTask(null);
    await loadTasks(page);
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    try {
      if (role === 'ADMIN') {
        await updateTask(taskId, { status });
      } else {
        await updateTaskStatus(taskId, status);
      }
      await loadTasks(page);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update status');
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteTask(taskId);
      await loadTasks(page);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete task');
    }
  }

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          {role === 'ADMIN' ? 'Task Management' : 'My Tasks'}
        </h1>
        {role === 'ADMIN' ? (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            Create Task
          </button>
        ) : null}
      </div>
      {error ? <p className="error">{error}</p> : null}
      {isLoading ? <p className="info">Loading tasks...</p> : null}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => {
              const assignee = userById.get(task.assignedUserId);
              return (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description ? (
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{task.description}</div>
                    ) : null}
                  </td>
                  <td>
                    <div className="assignee-cell">
                      <strong>{task.assignedUser?.name || assignee?.name || 'Unknown user'}</strong>
                      <span>{task.assignedUser?.email || assignee?.email || task.assignedUserId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="row">
                      <StatusBadge status={task.status} />
                      <select
                        className="select"
                        defaultValue={task.status}
                        onChange={(event) => handleStatusChange(task.id, event.target.value as TaskStatus)}
                      >
                        <option value="PENDING">Todo</option>
                        <option value="PROCESSING">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="row">
                      <Link href={`/tasks/${task.id}`} className="btn btn-view">
                        View
                      </Link>
                      {role === 'ADMIN' ? (
                        <button className="btn btn-soft" onClick={() => setEditingTask(task)}>
                          Edit
                        </button>
                      ) : null}
                      {role === 'ADMIN' ? (
                        <button className="btn btn-danger" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={4}>No tasks yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <span className="pagination-meta">
          Page {page} of {totalPages} • Total {total}
        </span>
        <div className="row">
          <button
            className="btn btn-soft"
            onClick={() => loadTasks(page - 1)}
            disabled={isLoading || page <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-soft"
            onClick={() => loadTasks(page + 1)}
            disabled={isLoading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {role === 'ADMIN' && isCreateModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <h2 style={{ marginBottom: 12 }}>Create Task</h2>
            <TaskForm
              onSubmit={handleCreateTask}
              submitLabel="Create"
              assignees={users}
              heading="Create Task"
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {role === 'ADMIN' && editingTask ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <h2 style={{ marginBottom: 12 }}>Edit Task</h2>
            <TaskForm
              onSubmit={handleEditTask}
              submitLabel="Save Changes"
              assignees={users}
              heading="Edit Task"
              initialValues={{
                title: editingTask.title,
                description: editingTask.description || '',
                assignedUserId: editingTask.assignedUserId,
              }}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
