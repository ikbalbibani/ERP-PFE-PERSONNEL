import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from '../services/permission.service';

export const roleGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const module = route.routeConfig?.path?.split('/')[0]; // Ex: 'entreprises', 'produits'

  if (module && !permissionService.canAccessSync(module)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
