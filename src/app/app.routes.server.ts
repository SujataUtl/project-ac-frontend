import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public pages are rendered on the server for every request, so link previews (LinkedIn, WhatsApp,
 * Facebook, X) and search engines get each page's real title, description and share image —
 * and always the latest admin edits. (Build-time prerendering would go stale after admin edits.)
 * The admin panel needs the browser (login token), so it renders client-side only.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
