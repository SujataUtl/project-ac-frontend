import { Component, DOCUMENT, HostListener, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SiteService } from '../core/site.service';
import { Icon } from '../core/icons';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header" [class.scrolled]="scrolled() || menuOpen()">
      <div class="container bar">
        <a routerLink="/" class="brand" (click)="menuOpen.set(false)" aria-label="Home">
          <img class="logo-img" src="/logo.png" alt="" width="53" height="40" />
          <span class="brand-name">{{ company() }}</span>
        </a>

        <nav class="nav" [class.open]="menuOpen()" aria-label="Main">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: l.path === '/' }" (click)="menuOpen.set(false)">{{ l.label }}</a>
          }
          <a routerLink="/contact" class="btn btn-primary btn-sm nav-cta" (click)="menuOpen.set(false)">Let's Talk <app-icon name="arrow-right" [size]="16" /></a>
        </nav>

        <button class="menu-btn" type="button" (click)="menuOpen.set(!menuOpen())" [class.x]="menuOpen()"
                [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <div class="backdrop" [class.show]="menuOpen()" (click)="menuOpen.set(false)"></div>

    <main id="main">
      @if (site.content()) {
        <router-outlet />
      } @else if (site.error()) {
        <div class="skeleton">
          <div class="err">
            <h2>We couldn't load this page</h2>
            <p>Please check your connection and try again.</p>
            <button class="btn btn-primary" (click)="site.load(true)">Retry</button>
          </div>
        </div>
      } @else {
        <div class="skeleton"><div class="spinner" role="status" aria-label="Loading"></div></div>
      }
    </main>

    <footer class="site-footer">
      <div class="bg-grid"></div>
      <div class="container">
        <div class="footer-top">
          <div class="about-col">
            <a routerLink="/" class="brand"><img class="logo-img" src="/logo.png" alt="" width="53" height="40" /><span class="brand-name">{{ company() }}</span></a>
            <p>{{ site.settings()?.about_short }}</p>
            <div class="socials">
              @if (site.settings()?.linkedin_url; as li) { <a [href]="li" target="_blank" rel="noopener" aria-label="LinkedIn"><app-icon name="linkedin" [size]="18" /></a> }
              @if (site.settings()?.contact_email; as email) { <a [href]="'mailto:' + email" aria-label="Email"><app-icon name="mail" [size]="18" /></a> }
              @if (site.settings()?.contact_whatsapp; as wa) { <a [href]="'https://wa.me/' + digits(wa)" target="_blank" rel="noopener" aria-label="WhatsApp"><app-icon name="message-circle" [size]="18" /></a> }
            </div>
          </div>
          <div class="col">
            <h4>Company</h4>
            <a routerLink="/about">About Us</a>
            <a routerLink="/portfolio">Our Work</a>
            <a routerLink="/process">Our Process</a>
            <a routerLink="/industries">Industries</a>
            <a routerLink="/technology">Technology</a>
          </div>
          <div class="col">
            <h4>Services</h4>
            @for (s of site.services().slice(0, 6); track s.id) { <a [routerLink]="['/services', s.slug]">{{ s.title }}</a> }
          </div>
          <div class="col">
            <h4>Get in touch</h4>
            @if (site.settings()?.contact_email; as email) { <a class="ci" [href]="'mailto:' + email"><app-icon name="mail" [size]="16" />{{ email }}</a> }
            @if (site.settings()?.contact_phone; as phone) { <a class="ci" [href]="'tel:' + phone"><app-icon name="phone" [size]="16" />{{ phone }}</a> }
            @if (site.settings()?.contact_address; as addr) { <span class="ci"><app-icon name="map-pin" [size]="16" />{{ addr }}</span> }
            <a routerLink="/contact" class="btn btn-primary btn-sm" style="margin-top:8px;align-self:flex-start">Start a project</a>
          </div>
        </div>
        <div class="copyright">
          <span>© {{ year }} {{ company() }}. All rights reserved.</span>
          <span>{{ site.settings()?.tagline }}</span>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  protected site = inject(SiteService);
  protected menuOpen = signal(false);
  protected scrolled = signal(false);
  protected year = new Date().getFullYear();
  protected company = () => this.site.settings()?.company_name || 'App Circuit Labs';
  protected links = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/portfolio', label: 'Our Work' },
    { path: '/technology', label: 'Technology' },
    { path: '/industries', label: 'Industries' },
  ];

  constructor() {
    this.site.load();
    inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.menuOpen.set(false));
    // Lock page scroll while the mobile menu is open.
    const doc = inject(DOCUMENT);
    effect(() => doc.body?.style.setProperty('overflow', this.menuOpen() ? 'hidden' : ''));
  }

  protected digits(v: string) { return v.replace(/\D/g, ''); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set((globalThis.scrollY ?? 0) > 12); }

  @HostListener('document:keydown.escape')
  onEsc() { this.menuOpen.set(false); }
}
