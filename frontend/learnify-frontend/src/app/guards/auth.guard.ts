import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Always allow on server-side to prevent SSR issues
  if (!isBrowser) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/'], { queryParams: { returnUrl: state.url } });
  return false;
}; 