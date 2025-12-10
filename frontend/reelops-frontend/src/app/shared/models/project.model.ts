export type ProjectStatus =
  | 'planning'
  | 'pre-production'
  | 'shooting'
  | 'post-production'
  | 'completed';

export interface Project {
  id?: number;
  title: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;   // ISO date string "2025-01-10"
  end_date?: string;
  budget_total?: number;
  created_at?: string;
  created_by_id?: number;
  created_by_name?: string;
}
