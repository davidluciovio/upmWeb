import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Authentication } from '../../modules/auth/services/authentication';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authentication);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/unauthorized'])
    return false;
  }

};
