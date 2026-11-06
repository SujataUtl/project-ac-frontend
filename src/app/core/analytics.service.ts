import { DOCUMENT, Injectable, Injector, PLATFORM_ID, effect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SiteService } from './site.service';

type W = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; hj?: unknown; _hjSettings?: unknown };

/**
 * Loads Google Analytics 4, Google Tag Manager and Hotjar — each only when its ID is set
 * in Admin → Site text → Analytics & tracking. IDs are format-checked before use, admin pages
 * are never tracked, and single-page navigations are reported as page views.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private site = inject(SiteService);
  private router = inject(Router);
  private doc = inject(DOCUMENT);
  private injector = inject(Injector);
  private platform = inject(PLATFORM_ID);
  private started = false;
  private ga4 = '';
  private gtm = '';
  private lastTracked = '';

  /** Call once at app start-up. */
  init() {
    if (!isPlatformBrowser(this.platform)) return;
    effect(() => {
      const s = this.site.settings();
      if (!s || this.started) return;
      this.started = true;
      const ga4 = (s.ga4_id || '').trim().toUpperCase();
      const gtm = (s.gtm_id || '').trim().toUpperCase();
      const hotjar = (s.hotjar_id || '').trim();
      if (/^GTM-[A-Z0-9]{4,12}$/.test(gtm)) this.loadGtm((this.gtm = gtm));
      if (/^G-[A-Z0-9]{4,16}$/.test(ga4)) this.loadGa4((this.ga4 = ga4));
      if (/^\d{4,10}$/.test(hotjar)) this.loadHotjar(hotjar);
      if (this.ga4 || this.gtm) this.trackPage(this.router.url);
    }, { injector: this.injector });

    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      if (this.started) this.trackPage(e.urlAfterRedirects);
    });
  }

  private get win() { return this.doc.defaultView as W; }
  private isAdmin(url: string) { return url.startsWith('/admin'); }

  private trackPage(url: string) {
    if (this.isAdmin(url) || url === this.lastTracked) return;
    this.lastTracked = url;
    // Let the page component update the <title> before reporting.
    setTimeout(() => {
      const payload = { page_path: url, page_location: this.doc.location.href, page_title: this.doc.title };
      if (this.ga4) this.win.gtag?.('event', 'page_view', payload);
      if (this.gtm) this.win.dataLayer?.push({ event: 'page_view', ...payload });
    });
  }

  private script(src: string) {
    const el = this.doc.createElement('script');
    el.async = true;
    el.src = src;
    this.doc.head.appendChild(el);
  }

  private loadGtm(id: string) {
    const w = this.win;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    this.script(`https://www.googletagmanager.com/gtm.js?id=${id}`);
  }

  private loadGa4(id: string) {
    const w = this.win;
    w.dataLayer = w.dataLayer || [];
    // gtag must push the `arguments` object itself, so a classic function is required here.
    w.gtag = function () { w.dataLayer!.push(arguments); };
    w.gtag('js', new Date());
    // Page views are sent manually on each route change (SPA), so disable the automatic one.
    w.gtag('config', id, { send_page_view: false });
    this.script(`https://www.googletagmanager.com/gtag/js?id=${id}`);
  }

  private loadHotjar(id: string) {
    const w = this.win as any;
    w.hj = w.hj || function (...args: unknown[]) { (w.hj.q = w.hj.q || []).push(args); };
    w._hjSettings = { hjid: Number(id), hjsv: 6 };
    this.script(`https://static.hotjar.com/c/hotjar-${id}.js?sv=6`);
  }
}
