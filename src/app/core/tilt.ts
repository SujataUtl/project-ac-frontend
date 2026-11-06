import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Interactive 3D tilt: the element rotates toward the mouse pointer and a soft glare follows it.
 * Writes CSS variables (--rx, --ry, --mx, --my) that the global `.tilt-3d` styles consume.
 * Disabled for touch input and when the user prefers reduced motion.
 */
@Directive({ selector: '[tilt3d]', host: { class: 'tilt-3d' } })
export class Tilt3d implements OnDestroy {
  /** Maximum rotation in degrees. */
  tiltMax = input(8);
  private el = inject(ElementRef<HTMLElement>);
  private frame = 0;
  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement as HTMLElement;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => {
          const r = node.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          const max = this.tiltMax();
          node.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
          node.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
          node.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
          node.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
          node.classList.add('is-tilting');
        });
      };
      const leave = () => {
        cancelAnimationFrame(this.frame);
        node.classList.remove('is-tilting');
        node.style.setProperty('--rx', '0deg');
        node.style.setProperty('--ry', '0deg');
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
      this.cleanup = () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', leave);
      };
    });
  }

  ngOnDestroy() {
    // Listeners and frames only exist in the browser (set up in afterNextRender).
    if (this.cleanup) {
      cancelAnimationFrame(this.frame);
      this.cleanup();
    }
  }
}
