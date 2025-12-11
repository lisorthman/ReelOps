export interface CastCrewMember {
  id: number;
  project_id: number;
  user_id: number;
  role_type: 'cast' | 'crew';
  position?: string | null;
  daily_rate?: number | null;
  notes?: string | null;
  created_at?: string;
  name?: string;   // joined from users table
  email?: string;  // joined from users table
}
