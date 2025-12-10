import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API_BASE = 'http://localhost:3000/api'; // backend URL

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'reelops_token';
  private userKey = 'reelops_user';

  constructor(private http: HttpClient) {}

  register(data: { name: string; email: string; password: string; role?: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/register`, data)
      .pipe(
        tap((res) => {
          this.saveAuth(res);
        })
      );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, data)
      .pipe(
        tap((res) => {
          this.saveAuth(res);
        })
      );
  }

  private saveAuth(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
