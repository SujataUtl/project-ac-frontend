import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isPrivate = req.url.startsWith('/api/admin') || req.url.startsWith('/api/auth/');
  const authed = token && isPrivate ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isPrivate && !req.url.endsWith('/login')) auth.logout();
      return throwError(() => err);
    })
  );
};

/** Pull a readable message out of an API error. */
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection.';
    if (err.status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
    return err.error?.error || fallback;
  }
  return fallback;
}
