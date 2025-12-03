import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Authentication } from '../../modules/auth/services/authentication';

export const adminGuard: CanActivateFn = (route, state) => {
  const authentication = inject(Authentication);
  const user = authentication.user();
  if (user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.includes('SuperAdmin')) {
    return true;
  }
  return false;
};
