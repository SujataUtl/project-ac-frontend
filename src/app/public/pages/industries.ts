import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero } from '../shared';

@Component({
  selector: 'app-industries',
  imports: [CtaBand, PageHero, Icon, Reveal],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.industries_eyebrow" [title]="s.industries_title" [lead]="s.industries_lead"
      visual="grid" [image]="s.industries_hero_image" [icons]="heroIcons()" [chips]="heroChips()" />
    <section class="section">
      <div class="container grid grid-3">
        @for (ind of site.industries(); track ind.id; let i = $index) {
          <div class="card hover" reveal [revealDelay]="(i % 3) * 80">
            <div class="icon-tile"><app-icon [name]="ind.icon" [size]="26" /></div>
            <h3>{{ ind.title }}</h3><p>{{ ind.description }}</p>
          </div>
        }
      </div>
    </section>
    <app-cta-band />
  `,
})
export class IndustriesPage {
  protected site = inject(SiteService);
  protected heroIcons = computed(() => this.site.industries().map((x) => x.icon));
  protected heroChips = computed(() => this.site.industries().slice(0, 3).map((x) => ({ icon: x.icon, label: x.title })));
  constructor() { this.site.setPage('Industries', this.site.settings()?.industries_lead); }
}
