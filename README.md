# ReelOps

ReelOps is a comprehensive film production management platform designed to streamline the workflow for producers and crew members. It features a robust backend API and a modern, responsive frontend application.

## Tech Stack

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Authentication**: JSON Web Tokens (JWT)

**Frontend**
- **Framework**: Angular
- **Styling**: SCSS
- **Language**: TypeScript
- **Rendering**: Client-side & Server-Side Rendering (SSR) support

## Key Features

### 1. Authentication & Roles
- **Secure Authentication**: Built with JWT for stateless, secure user sessions.
- **Role-Based Access Control (RBAC)**:
    - **Admin**: Full access to manage all projects and users.
    - **Producer**: Create and manage their own projects, budgets, and crews.
    - **Crew**: View assigned projects and their specific details.

### 2. Project Management
- **Lifecycle Tracking**: Manage projects through various stages: Planning, Pre-production, Shooting, Post-production, and Completed.
- **Budgeting**: Track total budget and monitor expenses.
- **Timeline**: Set and track project start and end dates.

### 3. Cast & Crew Management
- **Team Assembly**: Producers can add members to their projects by email.
- **Role Assignment**: Assign specific roles (Cast or Crew) and positions (e.g., Director, Camera Operator, Actor).
- **Rate Management**: Track daily rates for each member to help with budget estimation.


## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend` root directory. You can use the following template:

   ```env
   # Database Configuration
   PGHOST=localhost
   PGPORT=5432
   PGUSER=your_postgres_user
   PGPASSWORD=your_postgres_password
   PGDATABASE=reelops_db

   # Server Configuration
   PORT=3000

   # JWT Configuration
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. **Run the Backend:**

   - **Development Mode** (with hot-reload):
     ```bash
     npm run dev
     ```

   - **Production Build:**
     ```bash
     npm run build
     npm start
     ```

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/reelops-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Application:**

   - **Development Server:**
     ```bash
     npm start
     # or
     ng serve
     ```
     Access the app at `http://localhost:4200/`.

   - **Build for Production:**
     ```bash
     npm run build
     ```

   - **Serve with SSR:**
     ```bash
     npm run serve:ssr:reelops-frontend
     ```
