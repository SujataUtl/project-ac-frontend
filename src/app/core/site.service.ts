import { DOCUMENT, Injectable, PLATFORM_ID, TransferState, computed, inject, makeStateKey, signal } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SETTING_DEFAULTS, SiteContent } from './models';

/** Site content fetched during server rendering, embedded in the HTML so the browser doesn't refetch it. */
const CONTENT_KEY = makeStateKey<SiteContent>('site-content');

export interface PageSeo {
  /** Ask search engines not to index this page (e.g. 404s). */
  noindex?: boolean;
  /** Page-specific share image (absolute or site-relative URL). */
  image?: string | null;
  /** Open Graph type, e.g. 'article' for case studies. */
  type?: 'website' | 'article';
  /** Extra JSON-LD for this page (e.g. FAQPage, Service). */
  jsonLd?: object | null;
}

/** Loads all published site content once and exposes it as signals. Also owns page-level SEO tags. */
@Injectable({ providedIn: 'root' })
export class SiteService {
  private http = inject(HttpClient);
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private router = inject(Router);
  private transfer = inject(TransferState);
  private isServer = isPlatformServer(inject(PLATFORM_ID));

  readonly content = signal<SiteContent | null>(null);
  readonly error = signal(false);
  private loading?: Promise<void>;

  readonly settings = computed(() => this.content()?.settings);
  readonly services = computed(() => this.content()?.services ?? []);
  readonly projects = computed(() => this.content()?.projects ?? []);
  readonly featuredProjects = computed(() => {
    const all = this.projects();
    const featured = all.filter((p) => p.is_featured);
    return (featured.length ? featured : all).slice(0, 4);
  });
  readonly industries = computed(() => this.content()?.industries ?? []);
  readonly processSteps = computed(() => this.content()?.processSteps ?? []);
  readonly whyChooseUs = computed(() => (this.content()?.highlights ?? []).filter((h) => h.group_name === 'why_choose_us'));
  readonly coreValues = computed(() => (this.content()?.highlights ?? []).filter((h) => h.group_name === 'core_values'));
  readonly faqs = computed(() => (this.content()?.highlights ?? []).filter((h) => h.group_name === 'faq' && h.description));
  readonly techByCategory = computed(() => {
    const groups = new Map<string, string[]>();
    for (const t of this.content()?.techStack ?? []) {
      groups.set(t.category, [...(groups.get(t.category) ?? []), t.name]);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });

  load(force = false): Promise<void> {
    if (!this.loading || force) {
      this.error.set(false);
      const prerendered = !force && this.transfer.get(CONTENT_KEY, null);
      if (prerendered) {
        // Use exactly what the server rendered with, so hydration matches the HTML.
        this.transfer.remove(CONTENT_KEY);
        this.setContent(prerendered);
        return (this.loading = Promise.resolve());
      }
      this.loading = firstValueFrom(this.http.get<SiteContent>('/api/public/site'))
        .then((c) => {
          if (this.isServer) this.transfer.set(CONTENT_KEY, c);
          this.setContent(c);
        })
        .catch(() => { this.error.set(true); this.loading = undefined; });
    }
    return this.loading;
  }

  private setContent(c: SiteContent) {
    this.content.set({ ...c, settings: { ...SETTING_DEFAULTS, ...c.settings } });
  }

  /** Public base URL (no trailing slash): the admin "Website address" setting, else the current origin. */
  baseUrl() {
    const configured = (this.settings()?.site_url || '').trim().replace(/\/+$/, '');
    return /^https?:\/\//i.test(configured) ? configured : this.doc.location.origin;
  }

  /** Make a site-relative URL absolute (social networks require absolute image URLs). */
  absolute(url: string | null | undefined) {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : this.baseUrl() + (url.startsWith('/') ? '' : '/') + url;
  }

  /** Set title, description, canonical URL, Open Graph / Twitter tags and JSON-LD for the current page. */
  setPage(pageTitle?: string | null, description?: string | null, opts: PageSeo = {}) {
    const s = this.settings();
    const company = s?.company_name || 'App Circuit Labs';
    const fullTitle = pageTitle ? `${pageTitle} | ${company}` : s?.seo_title || company;
    const desc = (description || s?.seo_description || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const path = this.router.url.split(/[?#]/)[0];
    const url = this.baseUrl() + (path === '/' ? '/' : path);
    // Page image → admin share image → built-in branded default
    const image = this.absolute(opts.image || s?.seo_og_image || '/og-image.jpg');

    this.title.setTitle(fullTitle);
    this.tag('name', 'description', desc);
    this.tag('name', 'keywords', s?.seo_keywords);
    this.tag('name', 'robots', opts.noindex ? 'noindex, follow' : 'index, follow');
    this.tag('name', 'application-name', company);
    this.tag('name', 'publisher', s?.legal_name || company);
    this.tag('name', 'geo.region', s?.geo_region);
    this.tag('name', 'geo.placename', s?.geo_placename);
    const pos = this.geo();
    this.tag('name', 'geo.position', pos ? `${pos.lat};${pos.lng}` : '');
    this.tag('name', 'ICBM', pos ? `${pos.lat}, ${pos.lng}` : '');

    this.tag('property', 'og:site_name', company);
    this.tag('property', 'og:type', opts.type || 'website');
    this.tag('property', 'og:title', fullTitle);
    this.tag('property', 'og:description', desc);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:image', image);
    this.tag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    this.tag('name', 'twitter:title', fullTitle);
    this.tag('name', 'twitter:description', desc);
    this.tag('name', 'twitter:image', image);
    const handle = (s?.twitter_handle || '').trim();
    this.tag('name', 'twitter:site', handle ? '@' + handle.replace(/^@/, '') : '');

    this.canonical(opts.noindex ? '' : url);
    this.jsonLd('ld-org', this.organizationLd());
    this.jsonLd('ld-website', { '@context': 'https://schema.org', '@type': 'WebSite', name: company, url: this.baseUrl() + '/' });
    this.jsonLd('ld-page', opts.jsonLd ?? null);
  }

  private geo() {
    const m = (this.settings()?.geo_position || '').match(/(-?\d+(?:\.\d+)?)\s*[;,]\s*(-?\d+(?:\.\d+)?)/);
    return m ? { lat: m[1], lng: m[2] } : null;
  }

  private organizationLd() {
    const s = this.settings();
    if (!s) return null;
    const sameAs = [s.linkedin_url, s.facebook_url, s.instagram_url, s.x_url, s.youtube_url, s.google_maps_url]
      .map((v) => (v || '').trim()).filter((v) => /^https?:\/\//i.test(v));
    const pos = this.geo();
    const org: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': this.baseUrl() + '/#organization',
      name: s.company_name,
      url: this.baseUrl() + '/',
      description: s.about_short || s.seo_description,
      logo: this.absolute('/logo-512.png'),
      image: this.absolute('/og-image.jpg'),
    };
    if (s.legal_name) org['legalName'] = s.legal_name;
    if (s.contact_email) org['email'] = s.contact_email;
    if (s.contact_phone) org['telephone'] = s.contact_phone;
    if (s.contact_address) org['address'] = s.contact_address.replace(/\s*\n\s*/g, ', ');
    if (pos) org['location'] = { '@type': 'Place', geo: { '@type': 'GeoCoordinates', latitude: pos.lat, longitude: pos.lng } };
    if (sameAs.length) org['sameAs'] = sameAs;
    const knows = this.services().map((x) => x.title);
    if (knows.length) org['knowsAbout'] = knows;
    return org;
  }

  private tag(attr: 'name' | 'property', key: string, content: string | null | undefined) {
    const sel = `${attr}="${key}"`;
    if (content) this.meta.updateTag({ [attr]: key, content } as any, sel);
    else this.meta.removeTag(sel);
  }

  private canonical(url: string) {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) { link?.remove(); return; }
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  /** Insert/replace/remove a JSON-LD block. `<` is escaped so content can never close the script tag. */
  private jsonLd(id: string, data: object | null) {
    let el = this.doc.getElementById(id);
    if (!data) { el?.remove(); return; }
    if (!el) {
      el = this.doc.createElement('script');
      el.id = id;
      el.setAttribute('type', 'application/ld+json');
      this.doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
