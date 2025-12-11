import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CastCrewMember } from './cast-crew.model';

const API_BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class CastCrewService {
  constructor(private http: HttpClient) {}

  getMembers(projectId: number): Observable<CastCrewMember[]> {
    return this.http.get<CastCrewMember[]>(`${API_BASE}/projects/${projectId}/cast-crew`);
  }

  addMember(projectId: number, payload: {
    email: string;
    role_type: 'cast' | 'crew';
    position?: string;
    daily_rate?: number;
    notes?: string;
  }): Observable<CastCrewMember> {
    return this.http.post<CastCrewMember>(`${API_BASE}/projects/${projectId}/cast-crew`, payload);
  }

  updateMember(projectId: number, id: number, payload: Partial<CastCrewMember>): Observable<CastCrewMember> {
    return this.http.put<CastCrewMember>(`${API_BASE}/projects/${projectId}/cast-crew/${id}`, payload);
  }

  removeMember(projectId: number, id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE}/projects/${projectId}/cast-crew/${id}`);
  }
}
