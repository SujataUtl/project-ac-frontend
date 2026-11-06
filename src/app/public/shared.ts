import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../core/site.service';
import { Project, Service } from '../core/models';
import { Icon } from '../core/icons';
import { Reveal } from '../core/reveal';
import { Hero3d, Hero3dVariant, HeroChip } from './three-d';

@Component({
  selector: 'app-page-hero',
  imports: [RouterLink, Hero3d],
  template: `
    <section class="page-hero" [class.has-visual]="visual() || image()">
      <div class="bg-grid"></div>
      <div class="container hero-inner">
        <div class="hero-text">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a routerLink="/">Home</a>
          @if (parent(); as p) { <span>/</span><a [routerLink]="p.link">{{ p.label }}</a> }
          <span>/</span><span aria-current="page">{{ crumb() || eyebrow() }}</span>
        </nav>
        @if (eyebrow()) { <span class="eyebrow">{{ eyebrow() }}</span> }
        <h1>{{ title() }}</h1>
        @if (lead()) { <p class="lead">{{ lead() }}</p> }
        <ng-content />
        </div>
        @if (visual() || image()) {
          <app-hero-3d class="hero-visual-3d" [variant]="visual() || 'layers'" [image]="image()" [icons]="icons()" [chips]="chips()" />
        }
      </div>
    </section>
  `,
})
export class PageHero {
  eyebrow = input<string | null | undefined>('');
  title = input.required<string>();
  lead = input<string | null | undefined>('');
  crumb = input('');
  parent = input<{ label: string; link: string } | null>(null);
  /** 3D illustration shown on the right of the hero. */
  visual = input<Hero3dVariant | null>(null);
  /** Admin-uploaded hero image; replaces the built-in illustration when set. */
  image = input<string | null | undefined>(null);
  icons = input<(string | null)[]>([]);
  chips = input<HeroChip[]>([]);
}

@Component({
  selector: 'app-cta-band',
  imports: [RouterLink, Icon, Reveal],
  template: `
    <section class="section">
      <div class="container">
        <div class="cta-band" reveal>
          <div class="bg-grid"></div>
          <div>
            <h2>{{ site.settings()?.cta_headline }}</h2>
            <p>{{ site.settings()?.cta_text }}</p>
          </div>
          <div class="btn-row">
            <a routerLink="/contact" class="btn btn-white btn-lg">{{ site.settings()?.hero_primary_cta || 'Contact us' }} <app-icon name="arrow-right" [size]="18" /></a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CtaBand {
  protected site = inject(SiteService);
}

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, Icon],
  template: `
    @let s = service();
    <a class="card card-3d service-card" [routerLink]="['/services', s.slug]">
      <div class="icon-tile"><app-icon [name]="s.icon" [size]="26" /></div>
      <h3>{{ s.title }}</h3>
      <p>{{ s.short_description }}</p>
      <span class="more">Learn more <app-icon name="arrow-right" [size]="16" /></span>
    </a>
  `,
  styles: ':host { display: block; } :host > a { height: 100%; }',
})
export class ServiceCard {
  service = input.required<Service>();
}

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Icon],
  template: `
    @let p = project();
    <a class="card project-card" [routerLink]="['/portfolio', p.slug]">
      <div class="thumb">
        @if (p.image_url) { <img [src]="p.image_url" [alt]="p.title" loading="lazy" /> }
        @else { <div class="ph"><app-icon name="layout-dashboard" [size]="44" [stroke]="1.25" /></div> }
      </div>
      <div class="body">
        @if (p.category) { <span class="tag">{{ p.category }}</span> }
        <h3>{{ p.title }}</h3>
        @if (p.summary) { <p>{{ p.summary }}</p> }
        @if (p.technologies.length) {
          <ul class="chips">@for (t of p.technologies.slice(0, 5); track t) { <li class="chip">{{ t }}</li> }</ul>
        }
        <span class="more">View case study <app-icon name="arrow-right" [size]="16" /></span>
      </div>
    </a>
  `,
  styles: ':host { display: block; height: 100%; }',
})
export class ProjectCard {
  project = input.required<Project>();
}
