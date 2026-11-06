import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CONTENT_TYPES } from './content-types';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin" [class.nav-open]="navOpen()">
      <aside class="sidebar" (click)="navOpen.set(false)">
        <div class="brand"><img src="/logo.png" alt="" width="40" height="30" /> App Circuit Labs <small>Admin</small></div>
        <nav>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/admin/enquiries" routerLinkActive="active">Enquiries</a>
          <span class="group">Content</span>
          <a routerLink="/admin/settings" routerLinkActive="active">Site text & contact</a>
          @for (t of types; track t.key) {
            <a [routerLink]="['/admin/content', t.key]" routerLinkActive="active">{{ t.label }}</a>
          }
          <span class="group">Account</span>
          <a routerLink="/admin/account" routerLinkActive="active">Change password</a>
          <a href="/" target="_blank" rel="noopener">View website ↗</a>
          <button type="button" (click)="auth.logout()">Log out</button>
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="menu" type="button" (click)="navOpen.set(!navOpen())" aria-label="Toggle menu">☰</button>
          <span class="who">{{ auth.user()?.name }} · {{ auth.user()?.email }}</span>
        </header>
        <div class="content"><router-outlet /></div>
      </div>
    </div>
  `,
  styleUrl: './admin.scss',
})
export class AdminLayout {
  protected auth = inject(AuthService);
  protected types = CONTENT_TYPES;
  protected navOpen = signal(false);
  constructor() { this.auth.loadUser().catch(() => {}); }
}
