import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CastCrewMember {
  id: number;
  project_id: number;
  user_id: number;
  role_type: 'cast' | 'crew';
  position: string;
  daily_rate: number;
  notes: string;
  created_at: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CastCrewService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getMembers(projectId: number): Observable<CastCrewMember[]> {
    return this.http.get<CastCrewMember[]>(`${this.apiUrl}/projects/${projectId}/cast-crew`);
  }

  addMember(projectId: number, data: { email: string; role_type: string; position?: string; daily_rate?: number; notes?: string }): Observable<CastCrewMember> {
    return this.http.post<CastCrewMember>(`${this.apiUrl}/projects/${projectId}/cast-crew`, data);
  }

  removeMember(projectId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/cast-crew/${memberId}`);
  }
}
