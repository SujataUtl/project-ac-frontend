import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { SiteService } from '../../core/site.service';
import { RouterLink } from '@angular/router';
import { Icon } from '../../core/icons';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  template: `
    <section class="page-hero nf">
      <div class="bg-grid"></div>
      <div class="container">
        <span class="code grad-text">404</span>
        <h1>Page not found</h1>
        <p class="lead">The page you're looking for doesn't exist or has moved.</p>
        <div class="btn-row" style="justify-content:center;margin-top:32px">
          <a routerLink="/" class="btn btn-primary">Back to home <app-icon name="arrow-right" [size]="16" /></a>
          <a routerLink="/contact" class="btn btn-ghost-light">Contact us</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf { min-height: 80vh; display: grid; align-items: center; text-align: center; }
    .nf h1, .nf .lead { margin-left: auto; margin-right: auto; }
    .code { display: block; font-size: clamp(5rem, 16vw, 9rem); font-weight: 800; line-height: 1; letter-spacing: -0.05em; margin-bottom: 8px; }
  `,
})
export class NotFoundPage {
  constructor() {
    inject(SiteService).setPage('Page not found', null, { noindex: true });
    // During server rendering, send a real 404 status so search engines drop the URL.
    const res = inject(RESPONSE_INIT, { optional: true });
    if (res) res.status = 404;
  }
}
