import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  _id?: string;
  full_name: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  address: string;
  attachment?: { file_name: string; original_name: string; path: string; mime_type?: string; size?: number };
  [key: string]: unknown;
}

const HAS_PROFILE_KEY = 'hasProfile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _profile = signal<Profile | null>(null);
  readonly profile = this._profile.asReadonly();

  private readHasProfileCache(): boolean | null {
    const value = localStorage.getItem(HAS_PROFILE_KEY);
    if (value === null) return null;
    return value === 'true';
  }

  isProfileCached(): boolean {
    return this.readHasProfileCache() !== null;
  }

  getCachedHasProfile(): boolean {
    return this.readHasProfileCache() === true;
  }

  setHasProfile(exists: boolean): void {
    localStorage.setItem(HAS_PROFILE_KEY, String(exists));
  }

  clearHasProfileCache(): void {
    localStorage.removeItem(HAS_PROFILE_KEY);
  }

  /** Check profile existence via API — use at login or when cache is unknown. */
  checkHasProfile(): Observable<boolean> {
    return this.http.get<Profile>(`${this.apiUrl}/profile`).pipe(
      map(() => true),
      tap(() => this.setHasProfile(true)),
      catchError(err => {
        if (err.status === 404) {
          this.setHasProfile(false);
          return of(false);
        }
        return throwError(() => err);
      })
    );
  }

  saveProfile(formData: FormData): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/profile/save`, formData).pipe(
      tap(() => this.setHasProfile(true))
    );
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile`).pipe(
      tap(data => {
        this._profile.set(data);
        this.setHasProfile(true);
      })
    );
  }

  updateProfile(formData: FormData): Observable<{ message?: string; data: Profile }> {
    return this.http.put<{ message?: string; data: Profile }>(
      `${this.apiUrl}/profile/update`,
      formData
    ).pipe(
      tap(res => {
        this._profile.set(res.data);
        this.setHasProfile(true);
      })
    );
  }

  clearProfile(): void {
    this._profile.set(null);
    this.clearHasProfileCache();
  }

  downloadDocument(type: 'pdf' | 'docx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${type}`, { responseType: 'blob' }).pipe(
      tap(blob => this.triggerDownload(blob, `personal-details.${type}`))
    );
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
