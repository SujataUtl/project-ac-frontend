import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApi } from '../admin-api.service';
import { Enquiry } from '../../core/models';
import { apiError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-enquiries',
  imports: [DatePipe],
  template: `
    <div class="admin-page">
      <h1>Enquiries</h1>
      <p class="sub">Submissions from the website contact form.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
      @for (e of rows(); track e.id) {
        <article class="panel">
          <div class="page-top">
            <div>
              <h2 style="margin:0">{{ e.name }} @if (e.company) { <small class="muted">· {{ e.company }}</small> }</h2>
              <div class="muted">{{ e.created_at | date: 'medium' }}</div>
            </div>
            <span class="badge" [class]="e.status">{{ statusLabel[e.status] }}</span>
          </div>
          <p class="meta">
            <a [href]="'mailto:' + e.email">{{ e.email }}</a>
            @if (e.phone) { · <a [href]="'tel:' + e.phone">{{ e.phone }}</a> }
            @if (e.project_type) { · {{ e.project_type }} }
            @if (e.budget) { · Budget: {{ e.budget }} }
          </p>
          <p class="pre-line msg">{{ e.message }}</p>
          <div class="btn-row">
            <select class="input" style="width:auto" [value]="e.status" (change)="setStatus(e, $any($event.target).value)">
              <option value="new">New</option><option value="in_progress">In progress</option><option value="closed">Closed</option>
            </select>
            <button class="btn btn-sm btn-danger" (click)="remove(e)">Delete</button>
          </div>
        </article>
      } @empty {
        <div class="panel">{{ loading() ? 'Loading…' : 'No enquiries yet.' }}</div>
      }
    </div>
  `,
  styles: `
    .muted { color: var(--muted); font-size: 0.88rem; font-weight: 500; }
    .meta { margin: 12px 0; font-size: 0.92rem; }
    .msg { background: var(--bg-soft); padding: 14px; border-radius: var(--radius-sm); }
  `,
})
export class EnquiriesPage {
  private api = inject(AdminApi);
  protected rows = signal<Enquiry[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected statusLabel = { new: 'New', in_progress: 'In progress', closed: 'Closed' };

  constructor() { this.load(); }

  private async load() {
    try { this.rows.set(await this.api.enquiries()); } catch (e) { this.error.set(apiError(e)); } finally { this.loading.set(false); }
  }

  async setStatus(e: Enquiry, status: Enquiry['status']) {
    try {
      await this.api.setEnquiryStatus(e.id, status);
      this.rows.update((rs) => rs.map((r) => (r.id === e.id ? { ...r, status } : r)));
    } catch (err) { this.error.set(apiError(err)); }
  }

  async remove(e: Enquiry) {
    if (!confirm(`Delete the enquiry from ${e.name}?`)) return;
    try {
      await this.api.deleteEnquiry(e.id);
      this.rows.update((rs) => rs.filter((r) => r.id !== e.id));
    } catch (err) { this.error.set(apiError(err)); }
  }
}
