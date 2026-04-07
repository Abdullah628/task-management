'use client';

import { FormEvent, useEffect, useState } from 'react';

interface AssigneeOption {
  id: string;
  email: string;
  name: string;
}

interface TaskFormProps {
  onSubmit: (payload: {
    title: string;
    description?: string;
    assignedUserId?: string;
  }) => Promise<void>;
  submitLabel?: string;
  assignees: AssigneeOption[];
  onCancel?: () => void;
  heading?: string;
  initialValues?: {
    title?: string;
    description?: string;
    assignedUserId?: string;
  };
}

export function TaskForm({
  onSubmit,
  submitLabel = 'Create Task',
  assignees,
  onCancel,
  heading = 'Task Form',
  initialValues,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [assignedUserId, setAssignedUserId] = useState(initialValues?.assignedUserId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDescription(initialValues?.description ?? '');
    setAssignedUserId(initialValues?.assignedUserId ?? '');
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title,
        description: description || undefined,
        assignedUserId: assignedUserId || undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedUserId('');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Could not save task';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h3>{heading}</h3>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="assignee">Assign User (optional)</label>
        <select
          id="assignee"
          className="select"
          value={assignedUserId}
          onChange={(event) => setAssignedUserId(event.target.value)}
        >
          <option value="">Select assignee</option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email} ({user.name})
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {onCancel ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button disabled={isSubmitting} className="btn btn-primary" type="submit">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
