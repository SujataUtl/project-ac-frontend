import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Icon } from '../core/icons';
import { Tilt3d } from '../core/tilt';
import { Reveal } from '../core/reveal';

export type Hero3dVariant = 'layers' | 'cube' | 'cards' | 'chat' | 'grid' | 'steps';
export interface HeroChip { icon: string | null; label: string; }

/**
 * Decorative 3D illustration for inner-page heroes. Built entirely with CSS 3D transforms.
 * If the admin uploads a hero image for the page, it is shown in an interactive 3D frame instead.
 */
@Component({
  selector: 'app-hero-3d',
  imports: [Icon, Tilt3d],
  template: `
    <div class="scene" aria-hidden="true">
      <div class="glow"></div>
      @if (image()) {
        <div class="img-wrap">
          <div class="img-frame" tilt3d [tiltMax]="12">
            <div class="plate p1"></div><div class="plate p2"></div>
            <img [src]="image()" alt="" />
          </div>
        </div>
      } @else {
        @switch (variant()) {
          @case ('layers') {
            <div class="iso">
              @for (ic of pick(4); track $index) {
                <div class="plane" [style.--i]="$index">
                  <span class="p-icon"><app-icon [name]="ic" [size]="26" /></span>
                  <span class="p-line w70"></span><span class="p-line w45"></span>
                </div>
              }
            </div>
          }
          @case ('cube') {
            <div class="cube-stage">
              <div class="ring"><i></i><i></i><i></i><i></i></div>
              <div class="cube">
                @for (ic of pick(6); track $index) {
                  <div class="face" [class]="'face f' + $index"><app-icon [name]="ic" [size]="46" [stroke]="1.5" /></div>
                }
              </div>
            </div>
          }
          @case ('cards') {
            <div class="fan">
              @for (n of [0, 1, 2]; track n) {
                <div class="win" [style.--i]="n">
                  <div class="w-bar"><i></i><i></i><i></i></div>
                  <div class="w-body">
                    <span class="p-line w60"></span><span class="p-line w35"></span>
                    <div class="w-bars">@for (b of bars; track $index) { <span [style.height.%]="b"></span> }</div>
                  </div>
                </div>
              }
            </div>
          }
          @case ('chat') {
            <div class="phone-stage">
              <div class="phone">
                <div class="notch"></div>
                <div class="bub in w70"></div>
                <div class="bub out w55"></div>
                <div class="bub in w80"></div>
                <div class="bub out w40"></div>
                <div class="typing"><i></i><i></i><i></i></div>
              </div>
              @for (ic of pick(3); track $index) {
                <div class="tile3d" [class]="'tile3d t' + $index"><app-icon [name]="ic" [size]="26" /></div>
              }
            </div>
          }
          @case ('grid') {
            <div class="iso-grid">
              @for (ic of pick(9); track $index) {
                <div class="tile" [style.--i]="$index"><app-icon [name]="ic" [size]="28" /></div>
              }
            </div>
          }
          @case ('steps') {
            <div class="iso stairs">
              @for (ic of pick(4); track $index) {
                <div class="stair" [style.--i]="$index"><span class="s-num">{{ $index + 1 }}</span><app-icon [name]="ic" [size]="22" /></div>
              }
            </div>
          }
        }
      }
      @for (c of chips().slice(0, 3); track $index) {
        <div class="chip3d" [class]="'chip3d c' + $index">
          @if (c.icon) { <app-icon [name]="c.icon" [size]="16" /> }
          <span>{{ c.label }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './three-d.scss',
})
export class Hero3d {
  variant = input<Hero3dVariant>('layers');
  image = input<string | null | undefined>(null);
  icons = input<(string | null)[]>([]);
  chips = input<HeroChip[]>([]);

  protected bars = [45, 70, 52, 88, 64, 96];
  private fallback = ['smartphone', 'code-xml', 'cloud', 'cpu', 'database', 'server', 'radio', 'layers', 'sparkles'];

  /** Up to `n` icons: page-provided ones first, padded with sensible defaults. */
  protected pick(n: number) {
    const given = this.icons().filter((i): i is string => !!i);
    const out = [...given];
    for (const f of this.fallback) if (out.length < n && !out.includes(f)) out.push(f);
    while (out.length < n) out.push(out[out.length % Math.max(given.length, 1)] ?? 'sparkles');
    return out.slice(0, n);
  }
}

/** Turns an admin-entered video URL into something embeddable. */
export function parseVideo(url: string | null | undefined): { kind: 'iframe' | 'file'; src: string } | null {
  const u = (url ?? '').trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/^(https?:\/\/|\/)/i.test(u)) return { kind: 'file', src: u };
  return null;
}

/** A 3D-framed video player (uploaded file, YouTube or Vimeo). Renders nothing if the URL is empty/invalid. */
@Component({
  selector: 'app-video-3d',
  imports: [Reveal],
  template: `
    @if (video(); as v) {
      <div class="video-stage" reveal>
        <div class="video-3d">
          <div class="plate p1"></div><div class="plate p2"></div>
          <div class="screen">
            @if (v.kind === 'iframe') {
              <iframe [src]="safeSrc()" [title]="title() || 'Video'" loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            } @else {
              <video [src]="v.src" controls playsinline preload="metadata" [attr.poster]="poster() || null" [attr.aria-label]="title() || 'Video'"></video>
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './three-d.scss',
})
export class Video3d {
  private sanitizer = inject(DomSanitizer);
  url = input<string | null | undefined>('');
  title = input<string | null | undefined>('');
  poster = input<string | null | undefined>('');

  protected video = computed(() => parseVideo(this.url()));
  /** Only ever built from a parsed YouTube/Vimeo id, so bypassing the resource-URL check is safe. */
  protected safeSrc = computed<SafeResourceUrl | null>(() => {
    const v = this.video();
    return v?.kind === 'iframe' ? this.sanitizer.bypassSecurityTrustResourceUrl(v.src) : null;
  });
}

/** Full-width section: heading + text beside a 3D video. Hidden when no video URL is set. */
@Component({
  selector: 'app-video-section',
  imports: [Video3d, Reveal],
  template: `
    @if (hasVideo()) {
      <section class="section soft video-section">
        <div class="bg-dots"></div>
        <div class="container video-split">
          <div class="v-copy" reveal>
            <span class="eyebrow">{{ eyebrow() }}</span>
            @if (title()) { <h2>{{ title() }}</h2> }
            @if (text()) { <p class="lead pre-line">{{ text() }}</p> }
          </div>
          <app-video-3d [url]="url()" [title]="title()" />
        </div>
      </section>
    }
  `,
  styles: `
    .video-split { position: relative; display: grid; grid-template-columns: 0.8fr 1.2fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
    .v-copy .lead { margin: 0; }
    @media (max-width: 900px) { .video-split { grid-template-columns: 1fr; } }
  `,
})
export class VideoSection {
  url = input<string | null | undefined>('');
  title = input<string | null | undefined>('');
  text = input<string | null | undefined>('');
  eyebrow = input('Watch');
  protected hasVideo = computed(() => !!parseVideo(this.url()));
}
