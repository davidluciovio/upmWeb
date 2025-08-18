import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    data: {
      icon: 'dashboard',
      role: ['ADMIN', 'SUPERVISOR', 'USER'],
    },
    loadComponent: () => import('./module/dashboard/dashboard.component'),
  },
  {
    path: 'assemblyProduction',
    title: 'Producción Ensamble',
    data: {
      icon: 'inventory',
      role: ['ADMIN', 'SUPERVISOR', 'USER'],
    },
    loadChildren: () =>
      import('./module/assemblyProduction/assemblyProduction.routes'),
  },
  {
    path: 'admin',
    title: 'Settings',
    data: {
      icon: 'settings',
      role: ['ADMIN', 'SUPERVISOR', 'USER'],
    },
    loadChildren: () =>
      import('./core/core.routes'),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
