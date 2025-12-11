-- ReelOps Database Schema (Source of Truth)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'producer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget_total DECIMAL(12, 2),
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cast & Crew table
CREATE TABLE IF NOT EXISTS cast_crew (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type VARCHAR(10) NOT NULL CHECK (role_type IN ('cast','crew')),
  position VARCHAR(80),
  daily_rate NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cast_crew_project ON cast_crew(project_id);
CREATE INDEX IF NOT EXISTS idx_cast_crew_user ON cast_crew(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
