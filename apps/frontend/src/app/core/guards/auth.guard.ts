import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // If token exists but user not loaded yet, allow (session restore in progress)
  if (auth.getToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
