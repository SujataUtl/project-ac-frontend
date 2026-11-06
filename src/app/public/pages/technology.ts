import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { Tilt3d } from '../../core/tilt';
import { CtaBand, PageHero } from '../shared';
import { VideoSection } from '../three-d';

const CATEGORY_ICONS: Record<string, string> = {
  frontend: 'code-xml', backend: 'server', mobile: 'smartphone', 'database & cloud': 'database', database: 'database',
  cloud: 'cloud', iot: 'radio', devops: 'cloud-upload', ai: 'brain-circuit', testing: 'test-tube', design: 'pen-tool',
};

@Component({
  selector: 'app-technology',
  imports: [CtaBand, PageHero, Icon, Reveal, Tilt3d, VideoSection],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.technology_eyebrow" [title]="s.technology_title" [lead]="s.technology_lead"
      visual="cube" [image]="s.technology_hero_image" [icons]="heroIcons()" [chips]="heroChips()" />
    <section class="section">
      <div class="container grid grid-3">
        @for (g of site.techByCategory(); track g.category; let i = $index) {
          <div class="tilt-wrap" reveal [revealDelay]="(i % 3) * 80">
            <div class="card card-3d stack" tilt3d [tiltMax]="10">
              <span class="badge z-3">{{ g.items.length }}</span>
              <div class="top z-2">
                <div class="icon-tile"><app-icon [name]="iconFor(g.category)" [size]="24" /></div>
                <div><h3>{{ g.category }}</h3><small>{{ g.items.length }} technologies</small></div>
              </div>
              <ul class="chips z-1">@for (t of g.items; track t) { <li class="chip">{{ t }}</li> }</ul>
            </div>
          </div>
        }
      </div>
    </section>
    <app-video-section [url]="s.technology_video_url" [title]="s.technology_video_title" [text]="s.technology_video_text" />
    <app-cta-band />
  `,
  styles: `
    .top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .top .icon-tile { margin: 0; }
    .top h3 { margin: 0; }
    .top small { color: var(--muted); }
    .stack .chip { box-shadow: 0 3px 0 -1px #dbe3ef; transition: transform 0.2s var(--ease), box-shadow 0.2s; }
    .stack .chip:hover { transform: translateY(-2px); box-shadow: 0 5px 0 -1px #c7d4e8; }
    .badge {
      position: absolute; top: 16px; right: 16px; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 999px;
      display: grid; place-items: center; font-size: 0.8rem; font-weight: 800; color: var(--accent-600);
      background: var(--accent-soft); box-shadow: 0 3px 0 -1px #bae6fd;
    }
  `,
})
export class TechnologyPage {
  protected site = inject(SiteService);
  protected heroIcons = computed(() => this.site.techByCategory().slice(0, 6).map((g) => this.iconFor(g.category)));
  protected heroChips = computed(() => this.site.techByCategory().slice(0, 3).map((g) => ({ icon: this.iconFor(g.category), label: g.items.slice(0, 3).join(' · ') })));
  constructor() { this.site.setPage('Technology Stack', this.site.settings()?.technology_lead); }
  protected iconFor(c: string) { return CATEGORY_ICONS[c.toLowerCase()] ?? 'layers'; }
}
