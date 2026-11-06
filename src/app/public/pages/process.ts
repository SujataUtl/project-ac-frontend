import { Component, computed, inject } from '@angular/core';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { CtaBand, PageHero } from '../shared';

const STEP_ICONS = ['search', 'pen-tool', 'code-xml', 'test-tube', 'rocket', 'life-buoy'];

@Component({
  selector: 'app-process',
  imports: [CtaBand, PageHero, Icon, Reveal],
  template: `
    @let s = site.settings()!;
    <app-page-hero [eyebrow]="s.process_eyebrow" [title]="s.process_title" [lead]="s.process_lead"
      visual="steps" [image]="s.process_hero_image" [icons]="icons" [chips]="heroChips()" />
    <section class="section">
      <div class="container timeline">
        @for (step of site.processSteps(); track step.id; let i = $index) {
          <div class="step" reveal>
            <div class="marker"><app-icon [name]="icons[i % icons.length]" [size]="22" /></div>
            <div class="card hover">
              <span class="num">Step {{ i + 1 }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        }
      </div>
    </section>
    <app-cta-band />
  `,
  styles: `
    .timeline { max-width: 860px; display: grid; gap: 22px; position: relative; }
    .timeline::before { content: ''; position: absolute; left: calc(var(--gutter) + 25px); top: 30px; bottom: 30px; width: 2px; background: linear-gradient(180deg, var(--accent), var(--indigo), transparent); }
    .step { display: grid; grid-template-columns: 52px 1fr; gap: clamp(16px, 3vw, 28px); align-items: start; position: relative; }
    .marker { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; color: #fff; background: var(--grad); box-shadow: 0 10px 24px -10px rgb(99 102 241 / 0.8), 0 0 0 6px #fff; position: relative; margin-top: 14px; }
    .num { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent-600); }
    .step h3 { margin-top: 6px; }
  `,
})
export class ProcessPage {
  protected site = inject(SiteService);
  protected icons = STEP_ICONS;
  protected heroChips = computed(() => {
    const steps = this.site.processSteps();
    return [steps[0], steps[steps.length - 1]].filter((x) => !!x).map((x, i) => ({ icon: i ? 'rocket' : 'search', label: x.title }));
  });
  constructor() { this.site.setPage('Our Process', this.site.settings()?.process_lead); }
}
