# Jobs Application

A full-stack resourcing application for managing temporary workers and assigning them to jobs. The project is split into three runnable components:

- `jobs-api` — Spring Boot REST API with authentication, authorisation, CSRF protection, MySQL persistence, seeded development data, and E2E tests.
- `jobs-ui` — React + TypeScript frontend for login, profile management, temps, jobs, assignment workflows, and the assistant widget.
- `jobs-mcp-server` — Express + TypeScript assistant/tool server that connects the UI chat experience to the Jobs API.

## Current architecture

```text
jobs-ui  http://localhost:5173
   |
   | REST requests with cookies + CSRF
   v
jobs-api http://localhost:8080
   |
   | MySQL persistence
   v
MySQL database

jobs-ui
   |
   | /chat requests with cookies + CSRF forwarded
   v
jobs-mcp-server http://localhost:3000
   |
   | proxied Jobs API requests
   v
jobs-api
```

## Main features

- Login/logout using JWT stored in an HTTP-only cookie.
- CSRF protection for unsafe API requests.
- Protected application pages after login.
- Current profile view and edit flow.
- Paginated and sortable jobs list.
- Paginated and sortable temps list.
- Job assignment and unassignment.
- Availability checking for temps based on job date ranges.
- Hierarchy-aware visibility: users only work with jobs and temps they are allowed to access.
- Assistant widget that can show job/temp details, suggest available temps, explain availability, assign temps, and unassign temps.
- API E2E tests and MCP assistant/tool tests.

## Component README files

- [Jobs API README](./README-api.md)
- [Jobs UI README](./README-ui.md)
- [Jobs MCP Server README](./README-mcp.md)

## Required local services

- Java 21
- Node.js 18 or newer
- MySQL
- Maven wrapper from the API project

## Recommended local run order

1. Start MySQL.
2. Start the API on port `8080`.
3. Start the MCP server on port `3000`.
4. Start the UI on port `5173`.
5. Open the UI and log in with seeded dev credentials.

## Development credentials

The development seeder creates an admin user when the API runs with the `dev` profile:

```text
Username: admin@example.com
Password: admin12345
```

Other seeded temps use generated emails and the default password:

```text
password12345
```

## Local ports

| Component | Default URL |
|---|---|
| Jobs API | `http://localhost:8080` |
| Jobs UI | `http://localhost:5173` |
| Jobs MCP Server | `http://localhost:3000` |

## Security flow

The API issues a JWT cookie after login. Browser requests include cookies via `credentials: "include"`. For unsafe requests, the UI first loads `/csrf/csrf-token`, then sends the CSRF token in the header returned by the API. The MCP server receives the browser cookie and CSRF header from the UI and forwards them to the API for protected tool actions.

## Testing

Run tests in each component directory:

```bash
mvn clean test -Dspring.profiles.active=test
npm test
```

Use the Maven command in the API folder and the npm command in the UI or MCP folder.

## Notes for portfolio presentation

This project demonstrates a realistic three-component app rather than a simple CRUD demo. It includes frontend state management, protected backend routes, relational data modelling, validation, structured errors, pagination, sorting, seeded data, CI tests, and a chat-style assistant that performs real business actions through a controlled tool layer.
