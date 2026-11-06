import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

/** Absolute API origin used during server-side rendering (relative URLs don't resolve on the server). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(API_BASE_URL, { optional: true });
  if (base && /^\/(api|uploads)\//.test(req.url)) return next(req.clone({ url: base.replace(/\/+$/, '') + req.url }));
  return next(req);
};
