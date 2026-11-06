import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero, ProjectCard } from '../shared';
import { VideoSection } from '../three-d';
import { Tilt3d } from '../../core/tilt';

@Component({
  selector: 'app-portfolio',
  imports: [RouterLink, CtaBand, PageHero, ProjectCard, Icon, Reveal, VideoSection, Tilt3d],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.portfolio_eyebrow" [title]="s.portfolio_title" [lead]="s.portfolio_lead"
      visual="cards" [image]="s.portfolio_hero_image" [chips]="heroChips()" />
    <section class="section">
      <div class="container">
        @if (categories().length > 1) {
          <div class="filters" role="tablist" aria-label="Filter by category">
            <button role="tab" [attr.aria-selected]="!filter()" [class.on]="!filter()" (click)="filter.set('')">All</button>
            @for (c of categories(); track c) {
              <button role="tab" [attr.aria-selected]="filter() === c" [class.on]="filter() === c" (click)="filter.set(c)">{{ c }}</button>
            }
          </div>
        }
        <div class="grid grid-3">
          @for (p of visible(); track p.id; let i = $index) {
            <div class="tilt-wrap" reveal [revealDelay]="(i % 3) * 80"><app-project-card [project]="p" tilt3d [tiltMax]="6" /></div>
          }
          @empty {
            <div class="card empty">
              <div class="icon-tile"><app-icon name="sparkles" [size]="24" /></div>
              <h3>Case studies coming soon</h3>
              <p>We're preparing detailed write-ups of our recent work. <a routerLink="/contact">Get in touch</a> to hear about relevant projects.</p>
            </div>
          }
        </div>
      </div>
    </section>
    <app-video-section [url]="s.portfolio_video_url" [title]="s.portfolio_video_title" [text]="s.portfolio_video_text" />
    <app-cta-band />
  `,
  styles: `
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; padding: 6px; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 999px; width: fit-content; max-width: 100%; }
    .filters button { font: inherit; font-weight: 600; font-size: 0.88rem; padding: 8px 18px; border-radius: 999px; border: 0; background: transparent; color: var(--muted); cursor: pointer; transition: all 0.2s; }
    .filters button:hover { color: var(--ink); }
    .filters button.on { background: #fff; color: var(--ink); box-shadow: var(--shadow-sm), 0 2px 8px rgb(15 23 42 / 0.08); }
    .empty { grid-column: 1 / -1; text-align: center; padding: 56px 24px; }
    .empty .icon-tile { margin: 0 auto 18px; }
    @media (max-width: 600px) { .filters { border-radius: 16px; } }
  `,
})
export class PortfolioPage {
  protected site = inject(SiteService);
  protected filter = signal('');
  protected categories = computed(() => [...new Set(this.site.projects().map((p) => p.category).filter((c): c is string => !!c))]);
  protected visible = computed(() => this.site.projects().filter((p) => !this.filter() || p.category === this.filter()));
  protected heroChips = computed(() => {
    const cats = this.categories().slice(0, 2).map((c) => ({ icon: 'layout-dashboard', label: c }));
    const n = this.site.projects().length;
    return n ? [...cats, { icon: 'sparkles', label: `${n} project${n === 1 ? '' : 's'}` }] : cats;
  });
  constructor() { this.site.setPage('Our Work', this.site.settings()?.portfolio_lead); }
}
