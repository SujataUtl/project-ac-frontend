import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteService } from '../../core/site.service';
import { Icon } from '../../core/icons';
import { Reveal } from '../../core/reveal';
import { Tilt3d } from '../../core/tilt';
import { CtaBand, ProjectCard, ServiceCard } from '../shared';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CtaBand, ProjectCard, ServiceCard, Icon, Reveal, Tilt3d],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  protected site = inject(SiteService);
  protected pillars = [
    { icon: 'smartphone', title: 'Mobile apps', text: 'Android, iOS & cross-platform' },
    { icon: 'code-xml', title: 'Web platforms', text: 'SaaS, portals & dashboards' },
    { icon: 'radio', title: 'IoT systems', text: 'Devices, sensors & real-time data' },
    { icon: 'cloud-upload', title: 'Cloud & DevOps', text: 'Deploy, scale & monitor' },
  ];
  protected bars = [42, 64, 38, 76, 58, 88, 70, 94, 62, 80];
  /** Doubled so the marquee loops seamlessly. */
  protected techLoop = computed(() => {
    const names = (this.site.content()?.techStack ?? []).map((t) => t.name);
    return names.length ? [...names, ...names] : [];
  });
  protected headline = computed(() => {
    // Highlight the last two words of the headline with the gradient.
    const h = (this.site.settings()?.hero_headline || '').trim();
    const words = h.split(/\s+/);
    if (words.length < 3) return { start: '', end: h };
    return { start: words.slice(0, -2).join(' ') + ' ', end: words.slice(-2).join(' ') };
  });

  constructor() {
    const faqs = this.site.faqs();
    this.site.setPage(null, null, {
      jsonLd: faqs.length ? {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q.title, acceptedAnswer: { '@type': 'Answer', text: q.description } })),
      } : null,
    });
  }
}
