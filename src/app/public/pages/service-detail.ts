import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero, ServiceCard } from '../shared';
import { NotFoundPage } from './not-found';
import { VideoSection } from '../three-d';

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, CtaBand, PageHero, ServiceCard, NotFoundPage, Icon, Reveal, VideoSection],
  template: `
    @if (service(); as svc) {
      <app-page-hero [title]="svc.title" [lead]="svc.short_description" [crumb]="svc.title" [parent]="{ label: 'Services', link: '/services' }">
        <div class="btn-row" style="margin-top:32px">
          <a routerLink="/contact" class="btn btn-primary">Discuss your project <app-icon name="arrow-right" [size]="16" /></a>
        </div>
      </app-page-hero>

      <section class="section">
        <div class="container detail">
          <div reveal>
            <div class="icon-tile solid big"><app-icon [name]="svc.icon" [size]="30" /></div>
            <span class="eyebrow">Overview</span>
            <h2>How we help</h2>
            <p class="pre-line lead">{{ svc.description }}</p>
          </div>
          @if (svc.features.length) {
            <aside class="card offer" reveal [revealDelay]="120">
              <h3>What we offer</h3>
              <ul class="check-list">@for (f of svc.features; track f) { <li>{{ f }}</li> }</ul>
              <a routerLink="/contact" class="btn btn-primary" style="margin-top:28px;width:100%">Get a quote</a>
            </aside>
          }
        </div>
      </section>

      <app-video-section eyebrow="See it in action" [url]="svc.video_url" [title]="svc.title" [text]="svc.short_description" />

      @if (others().length) {
        <section class="section soft">
          <div class="container">
            <div class="section-head" reveal><span class="eyebrow">Explore more</span><h2>Other services</h2></div>
            <div class="grid grid-3">
              @for (o of others(); track o.id; let i = $index) { <app-service-card [service]="o" reveal [revealDelay]="i * 80" /> }
            </div>
          </div>
        </section>
      }
      <app-cta-band />
    } @else {
      <app-not-found />
    }
  `,
  styles: `
    .detail { display: grid; grid-template-columns: 1.4fr 1fr; gap: clamp(32px, 6vw, 72px); align-items: start; }
    .big { width: 64px; height: 64px; border-radius: 18px; }
    .offer { position: sticky; top: calc(var(--header-h) + 24px); box-shadow: var(--shadow); }
    @media (max-width: 860px) { .detail { grid-template-columns: 1fr; } .offer { position: static; } }
  `,
})
export class ServiceDetailPage {
  private site = inject(SiteService);
  slug = input.required<string>();
  protected service = computed(() => this.site.services().find((s) => s.slug === this.slug()));
  protected others = computed(() => this.site.services().filter((s) => s.slug !== this.slug()).slice(0, 3));

  constructor() {
    effect(() => {
      const s = this.service();
      if (!s) { this.site.setPage('Page not found', null, { noindex: true }); return; }
      this.site.setPage(s.seo_title || s.title, s.seo_description || s.short_description, {
        jsonLd: {
          '@context': 'https://schema.org', '@type': 'Service', name: s.title, serviceType: s.title,
          description: s.seo_description || s.short_description || s.description,
          provider: { '@id': this.site.baseUrl() + '/#organization' },
          url: this.site.baseUrl() + '/services/' + s.slug,
          ...(s.features.length ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: s.title,
            itemListElement: s.features.map((f) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: f } })) } } : {}),
        },
      });
    });
  }
}
