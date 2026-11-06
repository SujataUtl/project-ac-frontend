import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api.service';
import { FieldDef, contentType } from '../content-types';
import { apiError } from '../../core/auth.interceptor';
import { ICON_NAMES, Icon } from '../../core/icons';
import { MediaInput } from '../media-input';

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);

@Component({
  selector: 'app-content-form',
  imports: [FormsModule, RouterLink, Icon, MediaInput],
  template: `
    @if (def(); as d) {
      <div class="admin-page">
        <a [routerLink]="['/admin/content', d.key]">← Back to {{ d.label }}</a>
        <h1 style="margin-top:12px">{{ isNew() ? 'Add ' + d.singular.toLowerCase() : 'Edit ' + d.singular.toLowerCase() }}</h1>
        <p class="sub">Fields marked * are required.</p>
        @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

        @if (model(); as m) {
          <form (ngSubmit)="save()" class="panel">
            <div class="form-grid">
              @for (f of d.fields; track f.key) {
                <div class="field" [class.full]="f.full || f.type === 'image' || f.type === 'video' || f.type === 'checkbox'">
                  @switch (f.type) {
                    @case ('checkbox') {
                      <label class="checkbox"><input type="checkbox" [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" /> {{ f.label }}</label>
                    }
                    @case ('textarea') {
                      <label [for]="f.key">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
                      <textarea [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" rows="4"></textarea>
                    }
                    @case ('list') {
                      <label [for]="f.key">{{ f.label }}</label>
                      <textarea [id]="f.key" [name]="f.key" [ngModel]="listText(f)" (ngModelChange)="setList(f, $event)" rows="5"></textarea>
                    }
                    @case ('number') {
                      <label [for]="f.key">{{ f.label }}</label>
                      <input [id]="f.key" type="number" [name]="f.key" [(ngModel)]="m[f.key]" />
                    }
                    @case ('select') {
                      <label [for]="f.key">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
                      <select [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]">
                        @for (o of f.options; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                      </select>
                    }
                    @case ('image') {
                      <label [for]="f.key">{{ f.label }}</label>
                      <div class="btn-row" style="align-items:center">
                        <input [id]="f.key" type="file" accept="image/png,image/jpeg,image/webp,image/gif" (change)="upload(f, $event)" />
                        @if (uploading()) { <span>Uploading…</span> }
                        @if (m[f.key]) { <button type="button" class="btn btn-sm btn-outline" (click)="m[f.key] = null">Remove image</button> }
                      </div>
                      @if (m[f.key]) { <img class="img-preview" [src]="m[f.key]" alt="" /> }
                    }
                    @case ('video') {
                      <label [for]="f.key">{{ f.label }}</label>
                      <app-media-input kind="video" [inputId]="f.key" [(value)]="m[f.key]" (busy)="uploading.set($event)" />
                    }
                    @case ('icon') {
                      <label>{{ f.label }}</label>
                      <div class="icon-picker" role="listbox" [attr.aria-label]="f.label">
                        @for (n of iconNames; track n) {
                          <button type="button" role="option" [class.on]="m[f.key] === n" [attr.aria-selected]="m[f.key] === n"
                                  [title]="n" (click)="m[f.key] = n"><app-icon [name]="n" [size]="20" /></button>
                        }
                      </div>
                      <span class="hint">Selected: <strong>{{ m[f.key] || 'none' }}</strong></span>
                    }
                    @case ('slug') {
                      <label [for]="f.key">{{ f.label }} *</label>
                      <input [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" (blur)="m[f.key] = slugify(m[f.key] || m['title'] || '')" />
                    }
                    @default {
                      <label [for]="f.key">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
                      <input [id]="f.key" [name]="f.key" [(ngModel)]="m[f.key]" (blur)="f.key === 'title' && autoSlug()" />
                    }
                  }
                  @if (f.hint) { <span class="hint">{{ f.hint }}</span> }
                </div>
              }
            </div>
            <div class="btn-row" style="margin-top:24px">
              <button class="btn btn-primary" type="submit" [disabled]="saving() || uploading()">{{ saving() ? 'Saving…' : 'Save' }}</button>
              <a class="btn btn-outline" [routerLink]="['/admin/content', d.key]">Cancel</a>
            </div>
          </form>
        } @else if (!error()) { <p>Loading…</p> }
      </div>
    } @else { <p>Unknown content type.</p> }
  `,
})
export class ContentFormPage {
  private api = inject(AdminApi);
  private router = inject(Router);
  type = input.required<string>();
  id = input.required<string>();

  protected def = computed(() => contentType(this.type()));
  protected isNew = computed(() => this.id() === 'new');
  protected model = signal<Record<string, any> | null>(null);
  protected saving = signal(false);
  protected uploading = signal(false);
  protected error = signal('');
  protected slugify = slugify;
  protected iconNames = ICON_NAMES;

  constructor() {
    effect(() => {
      const d = this.def();
      if (!d) return;
      this.model.set(null);
      this.error.set('');
      if (this.isNew()) this.model.set(structuredClone(d.defaults));
      else this.api.get(d.key, this.id()).then((r) => this.model.set(r)).catch((e) => this.error.set(apiError(e)));
    });
  }

  protected listText(f: FieldDef) { return ((this.model()?.[f.key] as string[]) ?? []).join('\n'); }
  protected setList(f: FieldDef, text: string) {
    const m = this.model();
    if (m) m[f.key] = text.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  protected autoSlug() {
    const m = this.model();
    if (m && this.isNew() && this.def()?.fields.some((f) => f.key === 'slug') && !m['slug'] && m['title']) {
      m['slug'] = slugify(m['title']);
    }
  }

  async upload(f: FieldDef, ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set('');
    try {
      const { url } = await this.api.upload(file);
      const m = this.model();
      if (m) m[f.key] = url;
    } catch (e) {
      this.error.set(apiError(e, 'Upload failed'));
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async save() {
    const d = this.def();
    const m = this.model();
    if (!d || !m) return;
    const missing = d.fields.filter((f) => f.required && !String(m[f.key] ?? '').trim()).map((f) => f.label);
    if (missing.length) { this.error.set(`Please fill in: ${missing.join(', ')}`); return; }
    this.saving.set(true);
    this.error.set('');
    try {
      if (this.isNew()) await this.api.create(d.key, m);
      else await this.api.update(d.key, this.id(), m);
      this.router.navigate(['/admin/content', d.key]);
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
