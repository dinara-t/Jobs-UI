# Jobs UI

React + TypeScript frontend for the Jobs Application. It provides the browser interface for login, profile management, jobs, temps, assignment workflows, and the assistant widget.

## Tech stack

- Vite
- React 18
- TypeScript
- React Router
- TanStack React Query
- React Hook Form
- Zod
- styled-components
- Vitest
- Testing Library

## Main features

- Login and logout.
- Protected routes after authentication.
- Current profile display and edit form.
- Jobs list with assigned/unassigned filter, sorting, pagination, and detail links.
- Job detail page with assign and unassign actions.
- Temps list with sorting, pagination, and detail links.
- Temp detail page showing assigned jobs.
- API error message handling.
- CSRF token loading and automatic retry after CSRF-related 403 responses.
- Assistant widget connected to the MCP server.
- Query invalidation after successful assignment and unassignment.

## Prerequisites

- Node.js 18 or newer
- Jobs API running on `http://localhost:8080`
- Jobs MCP Server running on `http://localhost:3000` if using the assistant widget

## Environment variables

Create a `.env` file in the UI project root:

```properties
VITE_API_BASE_URL=http://localhost:8080
VITE_MCP_BASE_URL=http://localhost:3000
```

## Install and run

From the UI project folder:

```bash
npm install
npm run dev
```

The UI runs on:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run test:watch
```

## Auth and request behaviour

The UI sends requests with `credentials: "include"` so the browser includes the JWT cookie issued by the API. For unsafe methods, the UI fetches `/csrf/csrf-token`, caches the token, and sends it in the CSRF header returned by the API.

Unsafe methods include:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

If an unsafe request receives a 403 that looks like a CSRF failure, the UI refreshes the CSRF token and retries once.

## Main pages

| Route | Purpose |
|---|---|
| `/login` | Login form |
| `/profile` | Current user profile |
| `/temps` | Visible temps list |
| `/temps/:id` | Temp detail and assigned jobs |
| `/jobs` | Visible jobs list |
| `/jobs/:id` | Job detail and assignment controls |

## Assistant widget

The assistant widget is available after login. It can:

- Show job details.
- Show temp details.
- List available temps for a job.
- Suggest the best available temp for a job.
- Explain whether a temp is available for a job.
- Ask for clarification when a job or temp name is ambiguous.
- Show action chips.
- Open confirmation prompts before assigning or unassigning.

The widget sends chat requests to:

```text
POST http://localhost:3000/chat
```

It includes current job context when the user is viewing `/jobs/:id` and tracks the last suggested temp so follow-up messages such as “assign them” can work.

## API client methods

The UI API client includes methods for:

- `login`
- `logout`
- `getProfile`
- `updateProfile`
- `getJobs`
- `getJob`
- `patchJob`
- `getTemps`
- `getTemp`
- `sendChatMessage`

## Testing

Run:

```bash
npm test
```

## Troubleshooting

### Login works but later requests are unauthorised

Check that the API and UI origins match the CORS configuration and that the browser is allowed to store/send the JWT cookie.

### Assign or unassign returns 403

Check that the UI loaded a CSRF token and that the API has `CORS_ALLOWED_ORIGINS=http://localhost:5173`.

### Assistant actions fail

Check:

- MCP server is running on port `3000`.
- `VITE_MCP_BASE_URL` points to the MCP server.
- MCP `JOBS_API_BASE_URL` points to the API.
- Browser requests include cookies.
