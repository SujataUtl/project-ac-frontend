import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <form class="box" (ngSubmit)="submit()">
        <div class="logo"><img src="/logo.png" alt="" width="66" height="50" /><span>App Circuit Labs</span></div>
        <h1>Admin sign in</h1>
        @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" [(ngModel)]="email" required /></div>
        <div class="field"><label for="pw">Password</label><input id="pw" name="password" type="password" autocomplete="current-password" [(ngModel)]="password" required /></div>
        <button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
      </form>
    </div>
  `,
  styles: `
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 20px;
      background: radial-gradient(800px 400px at 80% 0%, rgb(14 165 233 / 0.25), transparent), var(--navy-900); }
    .box { width: 100%; max-width: 400px; background: #fff; border-radius: 18px; padding: 36px; display: grid; gap: 16px; }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
    .logo img { height: 50px; width: auto; }
    h1 { font-size: 1.5rem; margin: 0; }
    .btn { width: 100%; margin-top: 4px; }
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected email = '';
  protected password = '';
  protected busy = signal(false);
  protected error = signal('');

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/admin']);
  }

  async submit() {
    if (!this.email || !this.password) { this.error.set('Enter your email and password.'); return; }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch (e) {
      this.error.set(apiError(e, 'Sign in failed'));
    } finally {
      this.busy.set(false);
    }
  }
}
