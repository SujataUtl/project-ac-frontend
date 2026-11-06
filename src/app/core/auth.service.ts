import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminUser } from './models';

const TOKEN_KEY = 'acl_admin_token';

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(readToken());
  readonly user = signal<AdminUser | null>(null);
  readonly isLoggedIn = computed(() => !!this.token());

  async login(email: string, password: string) {
    const res = await firstValueFrom(this.http.post<{ token: string; user: AdminUser }>('/api/auth/login', { email, password }));
    try { localStorage.setItem(TOKEN_KEY, res.token); } catch { /* storage unavailable: session-only login */ }
    this.token.set(res.token);
    this.user.set(res.user);
  }

  async loadUser() {
    if (!this.token() || this.user()) return;
    const res = await firstValueFrom(this.http.get<{ user: AdminUser }>('/api/auth/me'));
    this.user.set(res.user);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return firstValueFrom(this.http.post('/api/auth/change-password', { currentPassword, newPassword }));
  }

  logout(redirect = true) {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    this.token.set(null);
    this.user.set(null);
    if (redirect) this.router.navigate(['/admin/login']);
  }
}
