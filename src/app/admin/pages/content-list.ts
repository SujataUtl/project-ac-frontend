import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api.service';
import { contentType } from '../content-types';
import { apiError } from '../../core/auth.interceptor';
import { Icon } from '../../core/icons';

@Component({
  selector: 'app-content-list',
  imports: [RouterLink, Icon],
  template: `
    @if (def(); as d) {
      <div class="admin-page">
        <div class="page-top">
          <div><h1>{{ d.label }}</h1><p class="sub">{{ rows().length }} item(s)</p></div>
          <a class="btn btn-primary" [routerLink]="['/admin/content', d.key, 'new']">+ Add {{ d.singular.toLowerCase() }}</a>
        </div>
        @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                @for (c of d.columns; track c.key) { <th>{{ c.label }}</th> }
                <th>Order</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r['id']) {
                <tr>
                  @for (c of d.columns; track c.key; let first = $first) {
                    <td [class.with-icon]="first && hasIcon()">
                      @if (first && hasIcon()) { <span class="ico"><app-icon [name]="r['icon']" [size]="18" /></span> }
                      @if (typeof r[c.key] === 'boolean') { {{ r[c.key] ? 'Yes' : '—' }} } @else { {{ label(r[c.key]) }} }
                    </td>
                  }
                  <td>{{ r['sort_order'] }}</td>
                  <td><span class="badge" [class.on]="r['is_published']">{{ r['is_published'] ? 'Published' : 'Hidden' }}</span></td>
                  <td class="actions">
                    <a class="btn btn-outline btn-sm" [routerLink]="['/admin/content', d.key, r['id']]">Edit</a>
                    <button class="btn btn-sm btn-outline" type="button" (click)="toggle(r)">{{ r['is_published'] ? 'Hide' : 'Publish' }}</button>
                    <button class="btn btn-danger btn-sm" type="button" (click)="remove(r)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td [attr.colspan]="d.columns.length + 3">{{ loading() ? 'Loading…' : 'Nothing here yet.' }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    } @else {
      <p>Unknown content type.</p>
    }
  `,
})
export class ContentListPage {
  private api = inject(AdminApi);
  type = input.required<string>();
  protected def = computed(() => contentType(this.type()));
  protected hasIcon = computed(() => !!this.def()?.fields.some((f) => f.type === 'icon'));
  protected rows = signal<Record<string, any>[]>([]);
  protected loading = signal(true);
  protected error = signal('');

  constructor() {
    effect(() => { if (this.def()) this.load(this.type()); });
  }

  private groupLabels: Record<string, string> = { why_choose_us: 'Why choose us', core_values: 'Core values' };
  protected label(v: unknown) { return typeof v === 'string' ? this.groupLabels[v] ?? v : v ?? '—'; }

  private async load(type: string) {
    this.loading.set(true);
    this.rows.set([]);
    try { this.rows.set(await this.api.list(type)); this.error.set(''); }
    catch (e) { this.error.set(apiError(e)); }
    finally { this.loading.set(false); }
  }

  async toggle(r: Record<string, any>) {
    try {
      await this.api.update(this.type(), r['id'], { is_published: !r['is_published'] });
      await this.load(this.type());
    } catch (e) { this.error.set(apiError(e)); }
  }

  async remove(r: Record<string, any>) {
    const name = r['title'] || r['name'] || 'this item';
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await this.api.remove(this.type(), r['id']);
      await this.load(this.type());
    } catch (e) { this.error.set(apiError(e)); }
  }
}
