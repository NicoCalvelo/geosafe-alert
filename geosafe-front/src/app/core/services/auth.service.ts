import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'geosafe_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    this.tryRestoreSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async login(data: LoginRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data)
    );
    this.handleAuthResponse(res);
  }

  async register(data: RegisterRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
    );
    this.handleAuthResponse(res);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/auth/logout`)
      );
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      this._currentUser.set(null);
      this.router.navigate(['/login']);
    }
  }

  private handleAuthResponse(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token.token);
    this._currentUser.set(res.user);
  }

  private async tryRestoreSession(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${environment.apiUrl}/auth/me`)
      );
      this._currentUser.set(user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
