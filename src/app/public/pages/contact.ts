import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SiteService } from '../../core/site.service';
import { EnquiryInput, lines } from '../../core/models';
import { apiError } from '../../core/auth.interceptor';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { Tilt3d } from '../../core/tilt';
import { PageHero } from '../shared';

const empty = (): EnquiryInput => ({ name: '', company: '', email: '', phone: '', project_type: '', budget: '', message: '', website: '' });

@Component({
  selector: 'app-contact',
  imports: [FormsModule, PageHero, Icon, Reveal, Tilt3d],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.contact_eyebrow" [title]="s.contact_heading" [lead]="s.cta_text"
      visual="chat" [image]="s.contact_hero_image" [icons]="['mail', 'phone', 'message-circle']" [chips]="heroChips()" />

    <section class="section">
      <div class="container layout">
        <aside class="side" reveal>
          <h2>{{ s.contact_side_title }}</h2>
          <p class="muted pre-line">{{ s.contact_side_text }}</p>
          <div class="info">
            @if (s.contact_email) {
              <a class="info-card" [href]="'mailto:' + s.contact_email"><span class="icon-tile"><app-icon name="mail" [size]="20" /></span><span><small>Email</small>{{ s.contact_email }}</span></a>
            }
            @if (s.contact_phone) {
              <a class="info-card" [href]="'tel:' + s.contact_phone"><span class="icon-tile"><app-icon name="phone" [size]="20" /></span><span><small>Phone</small>{{ s.contact_phone }}</span></a>
            }
            @if (s.contact_whatsapp) {
              <a class="info-card" [href]="'https://wa.me/' + digits(s.contact_whatsapp)" target="_blank" rel="noopener"><span class="icon-tile"><app-icon name="message-circle" [size]="20" /></span><span><small>WhatsApp</small>{{ s.contact_whatsapp }}</span></a>
            }
            @if (s.contact_address) {
              <div class="info-card"><span class="icon-tile"><app-icon name="map-pin" [size]="20" /></span><span class="pre-line"><small>Location</small>{{ s.contact_address }}</span></div>
            }
            @if (s.linkedin_url) {
              <a class="info-card" [href]="s.linkedin_url" target="_blank" rel="noopener"><span class="icon-tile"><app-icon name="linkedin" [size]="20" /></span><span><small>LinkedIn</small>Follow our company page</span></a>
            }
          </div>
          @if (promises().length) {
            <ul class="promise">
              @for (p of promises(); track $index) { <li><app-icon [name]="promiseIcons[$index % promiseIcons.length]" [size]="18" /> {{ p }}</li> }
            </ul>
          }
        </aside>

        <div class="form-stage" reveal [revealDelay]="120">
        <div class="form-back b1" aria-hidden="true"></div>
        <div class="form-back b2" aria-hidden="true"></div>
        <div class="card form-card" tilt3d [tiltMax]="3">
          @if (sent()) {
            <div class="done">
              <div class="icon-tile solid"><app-icon name="check" [size]="28" /></div>
              <h3>{{ s.contact_success_title }}</h3>
              <p class="pre-line">{{ s.contact_success_text }}</p>
              <button class="btn btn-outline" (click)="sent.set(false)">Send another enquiry</button>
            </div>
          } @else {
            <h3 class="z-1">{{ s.contact_form_title }}</h3>
            <p class="muted" style="margin-bottom:24px">Fields marked * are required.</p>
            @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }
            <form #f="ngForm" (ngSubmit)="submit(f)" class="form-grid" novalidate>
              <div class="field"><label for="name">Name *</label><input id="name" name="name" autocomplete="name" [(ngModel)]="model.name" required maxlength="120" placeholder="Your full name" /></div>
              <div class="field"><label for="company">Company name</label><input id="company" name="company" autocomplete="organization" [(ngModel)]="model.company" maxlength="160" placeholder="Optional" /></div>
              <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" autocomplete="email" [(ngModel)]="model.email" required email maxlength="190" placeholder="you@company.com" /></div>
              <div class="field"><label for="phone">Phone number</label><input id="phone" name="phone" type="tel" autocomplete="tel" [(ngModel)]="model.phone" maxlength="40" placeholder="Optional" /></div>
              <div class="field">
                <label for="ptype">Type of project</label>
                <select id="ptype" name="project_type" [(ngModel)]="model.project_type">
                  <option value="">Select…</option>
                  @for (svc of site.services(); track svc.id) { <option [value]="svc.title">{{ svc.title }}</option> }
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="field">
                <label for="budget">Project budget</label>
                <select id="budget" name="budget" [(ngModel)]="model.budget">
                  <option value="">Select…</option>
                  @for (b of budgets(); track b) { <option [value]="b">{{ b }}</option> }
                </select>
              </div>
              <div class="field full"><label for="msg">Project description *</label><textarea id="msg" name="message" [(ngModel)]="model.message" required maxlength="5000" placeholder="What are you building? Who is it for? Any timelines?"></textarea></div>
              <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off" [(ngModel)]="model.website" /></label></div>
              <div class="full"><button class="btn btn-primary btn-lg submit" type="submit" [disabled]="sending()">{{ sending() ? 'Sending…' : 'Send enquiry' }} <app-icon name="send" [size]="18" /></button></div>
            </form>
          }
        </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: clamp(32px, 5vw, 64px); align-items: start; }
    .side h2 { font-size: clamp(1.5rem, 2.6vw, 2rem); }
    .muted { color: var(--muted); }
    .info { display: grid; gap: 12px; margin: 28px 0; }
    .info-card { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--radius); border: 1px solid var(--line); background: #fff; color: var(--ink); font-weight: 600; overflow-wrap: anywhere; transition: all 0.2s; }
    a.info-card:hover { border-color: #bae6fd; box-shadow: var(--shadow); color: var(--ink); transform: translateY(-2px); }
    .info-card .icon-tile { margin: 0; width: 44px; height: 44px; border-radius: 12px; }
    .info-card small { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
    .promise { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; color: var(--muted); font-size: 0.92rem; }
    .promise li { display: flex; align-items: center; gap: 10px; }
    .promise app-icon { color: var(--success); }
    /* 3D form: layered back plates, resting tilt that flattens while the user types */
    .form-stage { position: relative; perspective: 1400px; }
    .form-back { position: absolute; inset: 0; border-radius: var(--radius-lg); pointer-events: none; transition: transform 0.6s var(--ease); }
    .form-back.b1 { background: var(--grad); opacity: 0.9; transform: translate(14px, 14px) rotate(1.2deg); }
    .form-back.b2 { background: var(--accent-soft); border: 1px solid #bae6fd; transform: translate(28px, 28px) rotate(2.4deg); }
    .form-stage:focus-within .form-back.b1 { transform: translate(10px, 10px); }
    .form-stage:focus-within .form-back.b2 { transform: translate(20px, 20px); }
    .form-card {
      border-radius: var(--radius-lg); padding: clamp(24px, 4vw, 44px); border-color: #dbe5f3;
      box-shadow: 0 1px 0 #fff inset, 0 40px 70px -30px rgb(15 23 42 / 0.4), 0 12px 24px -12px rgb(15 23 42 / 0.15);
    }
    .form-card:not(.is-tilting) { --rx: 2deg; --ry: -3deg; }
    .form-stage:focus-within .form-card { --rx: 0deg !important; --ry: 0deg !important; }
    .form-card .field input:not([type='checkbox']), .form-card .field select, .form-card .field textarea {
      background: var(--bg-soft); border-color: #d8e1ee;
      box-shadow: inset 0 2px 4px rgb(15 23 42 / 0.06), 0 1px 0 #fff;
      transition: border-color 0.15s, box-shadow 0.2s, background 0.2s, transform 0.2s var(--ease);
    }
    .form-card .field input:focus, .form-card .field select:focus, .form-card .field textarea:focus {
      background: #fff; transform: translateY(-2px);
      box-shadow: 0 0 0 4px rgb(14 165 233 / 0.15), 0 10px 20px -10px rgb(14 165 233 / 0.45);
    }
    .submit { width: 100%; box-shadow: 0 6px 0 -1px #4338ca, 0 18px 30px -12px rgb(99 102 241 / 0.7); }
    .submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 0 -1px #4338ca, 0 24px 34px -12px rgb(99 102 241 / 0.75); }
    .submit:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 -1px #4338ca, 0 8px 16px -8px rgb(99 102 241 / 0.6); }
    @media (max-width: 600px) {
      .form-back.b1 { transform: translate(6px, 8px); } .form-back.b2 { transform: translate(12px, 16px); }
    }
    .done { text-align: center; padding: 32px 0; }
    .done .icon-tile { margin: 0 auto 20px; width: 64px; height: 64px; border-radius: 50%; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class ContactPage {
  protected site = inject(SiteService);
  private http = inject(HttpClient);
  protected model = empty();
  protected sending = signal(false);
  protected sent = signal(false);
  protected error = signal('');
  protected budgets = computed(() => lines(this.site.settings()?.contact_budgets));
  protected promises = computed(() => lines(this.site.settings()?.contact_promises));
  protected promiseIcons = ['clock', 'lock', 'shield-check', 'handshake'];
  protected heroChips = computed(() => {
    const s = this.site.settings();
    return [
      s?.contact_email ? { icon: 'mail', label: s.contact_email } : null,
      s?.contact_phone ? { icon: 'phone', label: s.contact_phone } : null,
      this.promises()[0] ? { icon: 'clock', label: this.promises()[0] } : null,
    ].filter((c) => !!c);
  });

  constructor() { this.site.setPage('Contact Us', this.site.settings()?.cta_text); }

  protected digits(v: string) { return v.replace(/\D/g, ''); }

  async submit(f: NgForm) {
    if (f.invalid) {
      f.control.markAllAsTouched();
      this.error.set('Please fill in your name, a valid email and a project description.');
      return;
    }
    this.sending.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.http.post('/api/public/enquiries', this.model));
      this.model = empty();
      f.resetForm(this.model);
      this.sent.set(true);
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      this.sending.set(false);
    }
  }
}
