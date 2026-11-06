import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api.service';
import { CONTENT_TYPES } from '../content-types';
import { apiError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="admin-page">
      <h1>Dashboard</h1>
      <p class="sub">Manage everything shown on the website.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
      @if (stats(); as s) {
        <div class="stat-grid">
          <a class="stat" routerLink="/admin/enquiries">
            <div class="n">{{ s.enquiries.unread }}</div><div class="l">New enquiries ({{ s.enquiries.total }} total)</div>
          </a>
          @for (t of types; track t.key) {
            <a class="stat" [routerLink]="['/admin/content', t.key]"><div class="n">{{ s.counts[t.key] || 0 }}</div><div class="l">{{ t.label }}</div></a>
          }
        </div>
        <div class="panel" style="margin-top:24px">
          <h2>Quick start</h2>
          <ul class="check-list">
            <li><a routerLink="/admin/settings">Update site text & contact details</a> — headline, about, email, phone, LinkedIn.</li>
            <li><a routerLink="/admin/content/projects">Replace the sample project</a> with real case studies and screenshots.</li>
            <li>Unpublish any service, industry or technology you don't want to advertise yet.</li>
          </ul>
        </div>
      } @else if (!error()) { <p>Loading…</p> }
    </div>
  `,
})
export class DashboardPage {
  private api = inject(AdminApi);
  protected types = CONTENT_TYPES;
  protected stats = signal<Awaited<ReturnType<AdminApi['stats']>> | null>(null);
  protected error = signal('');
  constructor() {
    this.api.stats().then((s) => this.stats.set(s)).catch((e) => this.error.set(apiError(e)));
  }
}
