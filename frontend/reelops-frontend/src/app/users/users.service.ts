import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:3000/api';

export interface SimpleUser {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  // Backend should support GET /api/users?search=...
  searchUsers(query: string): Observable<SimpleUser[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<SimpleUser[]>(`${API_BASE}/users`, { params });
  }
}
