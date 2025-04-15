// frontend\learnify-frontend\src\app\interceptors\auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Get the auth token from a single source
  let token = null;
  if (isBrowser) {
    const currentUser = localStorage.getItem('currentUser');
    token = currentUser ? JSON.parse(currentUser).token : null;

    // If no token in currentUser, check for standalone auth_token (from Google OAuth)
    if (!token) {
      token = localStorage.getItem('auth_token');
    }
  }

  if (token) {
    // Clone the request and add the authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch any errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isBrowser) {
        // If 401 Unauthorized response, clear localStorage and redirect to login
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
