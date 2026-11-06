import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { Tilt3d } from '../../core/tilt';
import { CtaBand, PageHero } from '../shared';
import { VideoSection } from '../three-d';

@Component({
  selector: 'app-services',
  imports: [RouterLink, CtaBand, PageHero, Icon, Reveal, Tilt3d, VideoSection],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.services_eyebrow" [title]="s.services_title" [lead]="s.services_lead"
      visual="layers" [image]="s.services_hero_image" [icons]="heroIcons()" [chips]="heroChips()" />

    <section class="section">
      <div class="container list">
        @for (svc of site.services(); track svc.id; let i = $index) {
          <div class="tilt-wrap" reveal [revealDelay]="(i % 2) * 60">
            <a class="card card-3d svc" [routerLink]="['/services', svc.slug]" tilt3d [tiltMax]="4">
              <div class="head z-2">
                <div class="icon-tile"><app-icon [name]="svc.icon" [size]="28" /></div>
                <span class="idx">{{ (i + 1).toString().padStart(2, '0') }}</span>
              </div>
              <div class="info z-1">
                <h3>{{ svc.title }}</h3>
                <p>{{ svc.short_description }}</p>
                <span class="more">Explore {{ svc.title }} <app-icon name="arrow-right" [size]="16" /></span>
              </div>
              @if (svc.features.length) {
                <ul class="check-list z-1">@for (f of svc.features.slice(0, 5); track f) { <li>{{ f }}</li> }</ul>
              }
            </a>
          </div>
        }
      </div>
    </section>
    <app-video-section [url]="s.services_video_url" [title]="s.services_video_title" [text]="s.services_video_text" />
    <app-cta-band />
  `,
  styles: `
    .list { display: grid; gap: 28px; }
    .list .tilt-wrap { perspective: 2400px; }
    .svc .z-2 { transform: translateZ(18px); }
    .svc .z-1 { transform: translateZ(10px); }
    .svc { display: grid !important; grid-template-columns: auto 1.2fr 1fr; gap: clamp(20px, 4vw, 48px); align-items: start; }
    .head { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .head .icon-tile { margin: 0; width: 64px; height: 64px; border-radius: 18px; }
    .idx { font-weight: 800; font-size: 0.8rem; color: #94a3b8; letter-spacing: 0.08em; }
    .info h3 { font-size: 1.4rem; }
    .info .more { margin-top: 12px; }
    .check-list { font-size: 0.93rem; gap: 10px; }
    @media (max-width: 900px) {
      .svc { grid-template-columns: auto 1fr; }
      .check-list { grid-column: 1 / -1; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    }
    @media (max-width: 520px) {
      .svc { grid-template-columns: 1fr; }
      .head { flex-direction: row; justify-content: space-between; }
    }
  `,
})
export class ServicesPage {
  protected site = inject(SiteService);
  protected heroIcons = computed(() => this.site.services().slice(0, 4).map((x) => x.icon));
  protected heroChips = computed(() => this.site.services().slice(0, 3).map((x) => ({ icon: x.icon, label: x.title })));
  constructor() { this.site.setPage('Services', this.site.settings()?.services_lead); }
}
