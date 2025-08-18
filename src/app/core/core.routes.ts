import { Routes } from '@angular/router';

export const coreRoutes: Routes = [
  {
    path: '',
    title: 'Dashboard',
    data: {
      icon: 'dashboard',
      role: ['ADMIN', 'SUPERVISOR', 'USER'],
    },
    loadComponent: () => import('./pages/dashboard/dashboard.component'),
  },
  {
    path:'user',
    title: 'Usuario',
    data: {
      icon: 'people',
      role: ['ADMIN', 'SUPERVISOR', 'USER'],
    },
    loadComponent: () => import('./pages/user/user.component'),
  },
  {
    path: '**',
    redirectTo: '',
  }
];

export default coreRoutes;


