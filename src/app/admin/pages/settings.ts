import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApi } from '../admin-api.service';
import { SETTINGS_GROUPS } from '../content-types';
import { MediaInput } from '../media-input';
import { SETTING_DEFAULTS } from '../../core/models';
import { apiError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, MediaInput],
  template: `
    <div class="admin-page">
      <h1>Site text & contact details</h1>
      <p class="sub">Headlines, page text, header 3D images, videos, contact information and SEO.</p>
      <nav class="jump" aria-label="Jump to section">
        @for (g of groups; track g.title; let i = $index) { <a [href]="'#grp-' + i" (click)="jump($event, i)">{{ g.title }}</a> }
      </nav>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
      @if (model(); as m) {
        <form (ngSubmit)="save()">
          @for (g of groups; track g.title) {
            <section class="panel" [id]="'grp-' + $index">
              <h2>{{ g.title }}</h2>
              <div class="form-grid">
                @for (f of g.fields; track f.key) {
                  <div class="field" [class.full]="f.type !== 'text'">
                    <label [for]="f.key">{{ f.label }}</label>
                    @switch (f.type) {
                      @case ('textarea') { <textarea [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" rows="4"></textarea> }
                      @case ('list') { <textarea [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" rows="5"></textarea> }
                      @case ('image') { <app-media-input kind="image" [inputId]="f.key" [(value)]="m[f.key]" (busy)="busy.set($event)" /> }
                      @case ('video') { <app-media-input kind="video" [inputId]="f.key" [(value)]="m[f.key]" (busy)="busy.set($event)" /> }
                      @default { <input [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" /> }
                    }
                    @if (f.hint) { <span class="hint">{{ f.hint }}</span> }
                  </div>
                }
              </div>
            </section>
          }
          <div class="sticky-actions">
            <button class="btn btn-primary" type="submit" [disabled]="saving() || busy()">{{ saving() ? 'Saving…' : 'Save changes' }}</button>
            @if (saved()) { <span class="alert alert-success" style="margin:0;padding:8px 14px">Saved ✓</span> }
          </div>
        </form>
      } @else if (!error()) { <p>Loading…</p> }
    </div>
  `,
  styles: `
    .jump { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 20px; }
    .jump a { font-size: 0.82rem; font-weight: 600; padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid var(--line); color: var(--ink); }
    .jump a:hover { border-color: var(--accent); color: var(--accent-600); }
    .panel { scroll-margin-top: 80px; }
  `,
})
export class SettingsPage {
  private api = inject(AdminApi);
  protected groups = SETTINGS_GROUPS;
  protected model = signal<Record<string, string> | null>(null);
  protected saving = signal(false);
  protected saved = signal(false);
  protected busy = signal(false);
  protected error = signal('');

  constructor() {
    // Keys never saved before get their default text so admins edit what visitors currently see.
    this.api.getSettings().then((s) => this.model.set({ ...(SETTING_DEFAULTS as Record<string, string>), ...s })).catch((e) => this.error.set(apiError(e)));
  }

  protected jump(ev: Event, i: number) {
    ev.preventDefault();
    document.getElementById('grp-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async save() {
    const m = this.model();
    if (!m) return;
    this.saving.set(true);
    this.saved.set(false);
    this.error.set('');
    const keys = this.groups.flatMap((g) => g.fields.map((f) => f.key));
    try {
      await this.api.saveSettings(Object.fromEntries(keys.map((k) => [k, m[k] ?? ''])));
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
