import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero } from '../shared';

@Component({
  selector: 'app-about',
  imports: [RouterLink, CtaBand, PageHero, Icon, Reveal],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.about_eyebrow" [title]="'About ' + s.company_name" [lead]="s.about_short"
      visual="layers" [image]="s.about_hero_image" [icons]="aboutIcons" [chips]="aboutChips()" />

    <section class="section">
      <div class="container split-2 intro">
        <div reveal>
          <span class="eyebrow">Who we are</span>
          <h2>Engineering practical technology for real-world problems</h2>
          <a routerLink="/contact" class="btn btn-primary">Work with us <app-icon name="arrow-right" [size]="16" /></a>
        </div>
        <div class="pre-line lead" reveal [revealDelay]="120">{{ s.about_intro }}</div>
      </div>
    </section>

    <section class="section soft">
      <div class="container grid grid-2">
        <div class="card vm" reveal>
          <div class="icon-tile solid"><app-icon name="eye" [size]="24" /></div>
          <span class="eyebrow">Our vision</span>
          <p class="big">{{ s.vision }}</p>
        </div>
        <div class="card vm" reveal [revealDelay]="120">
          <div class="icon-tile solid"><app-icon name="target" [size]="24" /></div>
          <span class="eyebrow">Our mission</span>
          <p class="big">{{ s.mission }}</p>
        </div>
      </div>
    </section>

    @if (site.coreValues().length) {
      <section class="section">
        <div class="container">
          <div class="section-head center" reveal><span class="eyebrow">Core values</span><h2>What we stand for</h2></div>
          <div class="grid grid-4">
            @for (v of site.coreValues(); track v.id; let i = $index) {
              <div class="card hover" reveal [revealDelay]="i * 80">
                <div class="icon-tile"><app-icon [name]="v.icon || 'award'" [size]="24" /></div>
                <h3>{{ v.title }}</h3><p>{{ v.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <section class="section dark">
      <div class="bg-grid"></div>
      <div class="container split-2 team" style="position:relative">
        <div reveal>
          <span class="eyebrow">Team expertise</span>
          <h2>Senior engineers, end to end</h2>
          <p class="lead" style="color:#94a3b8">{{ s.team_expertise }}</p>
          <ul class="chips">
            @for (g of site.techByCategory(); track g.category) { <li class="chip dark">{{ g.category }}</li> }
          </ul>
          <a routerLink="/technology" class="btn btn-ghost-light" style="margin-top:28px">See our technology stack <app-icon name="arrow-right" [size]="16" /></a>
        </div>
        <div class="approach" reveal [revealDelay]="120">
          <h3>Our development approach</h3>
          <ol>
            @for (p of site.processSteps(); track p.id; let i = $index) {
              <li><span>{{ i + 1 }}</span><div><strong>{{ p.title }}</strong><p>{{ p.description }}</p></div></li>
            }
          </ol>
        </div>
      </div>
    </section>

    <app-cta-band />
  `,
  styles: `
    .intro { align-items: start; }
    .vm .big { font-size: 1.15rem; color: var(--ink); line-height: 1.65; font-weight: 500; }
    .team { align-items: start; }
    .approach { background: rgb(255 255 255 / 0.03); border: 1px solid var(--line-dark); border-radius: var(--radius); padding: clamp(22px, 3vw, 32px); }
    .approach ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 18px; }
    .approach li { display: flex; gap: 14px; }
    .approach li > span { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; color: #fff; background: var(--grad); }
    .approach strong { color: #fff; }
    .approach p { margin: 2px 0 0; color: #8f9bb3; font-size: 0.92rem; }
  `,
})
export class AboutPage {
  protected site = inject(SiteService);
  protected aboutIcons = ['users', 'lightbulb', 'code-xml', 'rocket'];
  protected aboutChips = computed(() => this.site.coreValues().slice(0, 3).map((v) => ({ icon: v.icon, label: v.title })));
  constructor() { this.site.setPage('About Us', this.site.settings()?.about_short); }
}
