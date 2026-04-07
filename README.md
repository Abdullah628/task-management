# Task Management API

Backend base URL: `http://localhost:3000`

## Authentication

All protected routes require:

```http
Authorization: Bearer <accessToken>
```

Login returns:

```json
{
	"accessToken": "<jwt>"
}
```

## API Endpoints

### Auth

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | No | Public | Authenticates a user and returns a JWT access token. |

Request body:

```json
{
	"email": "admin@example.com",
	"password": "password123"
}
```

### Tasks

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| POST | `/tasks` | Yes | Admin | Creates a task. |
| GET | `/tasks` | Yes | Admin/User | Lists tasks. Admin sees all tasks, users see only assigned tasks. |
| GET | `/tasks/:id` | Yes | Admin/User | Gets a single task by ID. |
| PATCH | `/tasks/:id` | Yes | Admin | Updates title, description, status, or assigned user. |
| PATCH | `/tasks/:id/status` | Yes | User | Updates task status only. The task must be assigned to the current user. |
| PATCH | `/tasks/:id/:status` | Yes | User | Compatibility route for status updates using the status in the path, for example `/tasks/:id/PROCESSING`. |
| DELETE | `/tasks/:id` | Yes | Admin | Deletes a task. |

Create task body:

```json
{
	"title": "Write documentation",
	"description": "Document all API endpoints",
	"assignedUserId": "<optional-user-uuid>"
}
```

Update task body for admin:

```json
{
	"title": "Updated title",
	"description": "Updated description",
	"status": "PROCESSING",
	"assignedUserId": "<optional-user-uuid>"
}
```

Update status body for users:

```json
{
	"status": "DONE"
}
```

Allowed task statuses:

```text
PENDING
PROCESSING
DONE
```

### Audit

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/audit` | Yes | Admin | Returns audit logs for task creation, updates, deletions, status changes, and assignment changes. |

Audit log entries include:

```json
{
	"id": "<uuid>",
	"actor": {
		"id": "<uuid>",
		"email": "admin@example.com",
		"role": "ADMIN"
	},
	"actionType": "TASK_STATUS_CHANGED",
	"targetTaskId": "<task-uuid>",
	"dataBefore": {},
	"dataAfter": {},
	"createdAt": "2026-04-07T00:00:00.000Z"
}
```

### Users

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/users` | Yes | Admin | Returns all users. |

## Notes

- Protected routes use JWT authentication.
- Users can only update the status of tasks assigned to them.
- Admins can create, edit, reassign, and delete tasks.
- Every important task action is recorded in the audit log.
