import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProfileService } from './profile.service';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly apiUrl = environment.apiUrl;

  private readonly _token = signal<string | null>(localStorage.getItem('token'));
  private readonly _user = signal<AuthUser | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );

  readonly isLoggedIn = computed(() => !!this._token());
  readonly currentUser = this._user.asReadonly();
  readonly token = this._token.asReadonly();

  register(data: { username: string; email: string; password: string }): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/auth/register`, data);
  }

  login(data: { username: string; password: string }): Observable<{
    token: string;
    user: AuthUser;
    message?: string;
    hasProfile: boolean;
  }> {
    return this.http.post<{
      token: string;
      user: AuthUser;
      message?: string;
      hasProfile: boolean;
    }>(
      `${this.apiUrl}/auth/login`,
      data
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._token.set(res.token);
        this._user.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
    this.profileService.clearProfile();
    this.router.navigate(['/login']);
  }

  changePassword(data: { oldPassword: string; newPassword: string }): Observable<{ message?: string }> {
    return this.http.put<{ message?: string }>(`${this.apiUrl}/auth/change-password`, data);
  }

  getToken(): string | null {
    return this._token();
  }
}
