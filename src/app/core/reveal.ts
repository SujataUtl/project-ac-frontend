import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (!observer && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            observer!.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
  }
  return observer;
}

/** Fades/slides an element in the first time it scrolls into view. `revealDelay` staggers items (ms). */
@Directive({ selector: '[reveal]', host: { class: 'reveal', '[style.--reveal-delay.ms]': 'revealDelay()' } })
export class Reveal implements OnDestroy {
  revealDelay = input(0);
  private el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement as HTMLElement;
      const io = getObserver();
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!io || reduce) node.classList.add('is-visible');
      else io.observe(node);
    });
  }

  ngOnDestroy() {
    observer?.unobserve(this.el.nativeElement);
  }
}
