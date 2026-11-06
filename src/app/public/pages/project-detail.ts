import { Component, computed, effect, inject, input } from '@angular/core';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero, ProjectCard } from '../shared';
import { NotFoundPage } from './not-found';
import { Video3d } from '../three-d';

@Component({
  selector: 'app-project-detail',
  imports: [CtaBand, PageHero, ProjectCard, NotFoundPage, Icon, Reveal, Video3d],
  template: `
    @if (project(); as p) {
      <app-page-hero [eyebrow]="p.category || ''" [title]="p.title" [lead]="p.summary" [crumb]="p.title" [parent]="{ label: 'Our Work', link: '/portfolio' }">
        @if (p.client_type || p.technologies.length) {
          <ul class="chips" style="margin-top:28px">
            @if (p.client_type) { <li class="chip dark label">{{ p.client_type }}</li> }
            @for (t of p.technologies; track t) { <li class="chip dark">{{ t }}</li> }
          </ul>
        }
      </app-page-hero>

      <section class="section">
        <div class="container">
          @if (p.image_url) {
            <div class="shot" reveal><img [src]="p.image_url" [alt]="p.title + ' screenshot'" /></div>
          }
          @if (p.video_url) { <app-video-3d class="vid" [url]="p.video_url" [title]="p.title + ' video'" [poster]="p.image_url" /> }
          <div class="grid grid-3">
            @if (p.problem) {
              <div class="card story" reveal><div class="icon-tile"><app-icon name="search" [size]="22" /></div><h3>The problem</h3><p class="pre-line">{{ p.problem }}</p></div>
            }
            @if (p.solution) {
              <div class="card story" reveal [revealDelay]="100"><div class="icon-tile"><app-icon name="lightbulb" [size]="22" /></div><h3>Our solution</h3><p class="pre-line">{{ p.solution }}</p></div>
            }
            @if (p.results) {
              <div class="card story" reveal [revealDelay]="200"><div class="icon-tile solid"><app-icon name="chart" [size]="22" /></div><h3>Results</h3><p class="pre-line">{{ p.results }}</p></div>
            }
          </div>
        </div>
      </section>

      @if (more().length) {
        <section class="section soft">
          <div class="container">
            <div class="section-head" reveal><span class="eyebrow">More work</span><h2>Other projects</h2></div>
            <div class="grid grid-3">@for (o of more(); track o.id) { <app-project-card [project]="o" reveal /> }</div>
          </div>
        </section>
      }
      <app-cta-band />
    } @else {
      <app-not-found />
    }
  `,
  styles: `
    .shot { margin: 0 0 48px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--line); box-shadow: var(--shadow-lg); background: #fff; }
    .shot img { width: 100%; }
    .vid { display: block; max-width: 960px; margin: 0 auto 56px; }
    .label { background: rgb(14 165 233 / 0.15) !important; color: #7dd3fc !important; }
  `,
})
export class ProjectDetailPage {
  private site = inject(SiteService);
  slug = input.required<string>();
  protected project = computed(() => this.site.projects().find((p) => p.slug === this.slug()));
  protected more = computed(() => this.site.projects().filter((p) => p.slug !== this.slug()).slice(0, 3));
  constructor() {
    effect(() => {
      const p = this.project();
      if (!p) { this.site.setPage('Page not found', null, { noindex: true }); return; }
      this.site.setPage(p.title, p.summary, {
        type: 'article',
        image: p.image_url,
        jsonLd: {
          '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, about: p.category || undefined,
          description: p.summary || undefined, image: p.image_url ? this.site.absolute(p.image_url) : undefined,
          keywords: p.technologies.join(', ') || undefined,
          creator: { '@id': this.site.baseUrl() + '/#organization' },
          url: this.site.baseUrl() + '/portfolio/' + p.slug,
        },
      });
    });
  }
}
