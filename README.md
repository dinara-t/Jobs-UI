# Jobs UI

Frontend application for the Job Assignment System.

Built with React, TypeScript and Vite. The application allows users to log in, view jobs and temps within their hierarchy, update their profile, and assign temps to jobs through the backend API.

## Features

- Secure login
- Protected routes
- Profile management
- View temps in hierarchy
- View assigned and unassigned jobs
- Assign temps to jobs
- Pagination (jobs and temps)
- Sorting (jobs: date/name, temps: name/id/job count)
- Assignment confirmation popups
- Form validation using Zod
- API integration with JWT-based authentication

## Architecture

```mermaid
flowchart LR
    U[User Browser]
    UI[React Application]
    RC[React Context State]
    API[Spring Boot API]
    DB[(MySQL Database)]

    U --> UI
    UI --> RC
    UI -->|REST API| API
    API --> DB
```

The React application communicates with the backend using REST endpoints.  
Authentication state is managed on the frontend and protected routes prevent unauthorised access.

## Tech Stack

React  
TypeScript  
Vite  
React Router  
Styled Components  
React Hook Form  
Zod Validation

## Project Structure

    src
    ├── api
    ├── components
    ├── pages
    ├── state
    ├── styles
    ├── App.tsx
    └── main.tsx

## Frontend Page Flow

```mermaid
flowchart TD
    L[Login Page] --> J[Jobs Page]
    L --> T[Temps Page]
    L --> P[Profile Page]
    T --> TD[Temp Detail Page]
    J --> JD[Job Detail Page]
```

## JWT Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as Jobs API

    U->>UI: Submit login form
    UI->>API: POST /auth/login
    API-->>UI: JWT token (cookie)
    UI->>API: Authenticated request
    API-->>UI: Return jobs / temps / profile data
    UI-->>U: Render protected pages
```

## Routes

- `/login`
- `/profile`
- `/temps`
- `/temps/:id`
- `/jobs`
- `/jobs/:id`

All routes except `/login` require authentication.

## Running the Frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

Application runs at:

    http://localhost:5173

## Environment Variables

Create a `.env` file:

    VITE_API_BASE_URL=http://localhost:8080

## Example Login

- `admin@example.com / admin12345`

## What the UI Supports

- Login and authentication
- Viewing jobs visible to the logged-in user
- Viewing temps visible to the logged-in user
- Viewing detailed temp and job pages
- Assigning or unassigning temps from jobs
- Updating the current user profile