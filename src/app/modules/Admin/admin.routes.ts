import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout').then((m) => m.AdminLayout),
    loadChildren: () => [
      {
        path: 'model',
        loadComponent: () =>
          import('./pages/model-mangment/model-mangment').then((m) => m.ModelMangment),
      },
      {
        path: 'area',
        loadComponent: () =>
          import('./pages/area-managment/area-managment').then((m) => m.AreaManagment),
      },
      {
        path: 'location',
        loadComponent: () =>
          import('./pages/location-managment/location-managment').then((m) => m.LocationManagment),
      },
      {
        path: 'part-number',
        loadComponent: () =>
          import('./pages/part-number-managment/part-number-managment').then((m) => m.PartNumberManagment),
      },
      {
        path: 'part-number-area',
        loadComponent: () =>
          import('./pages/part-number-area-managment/part-number-area-managment').then((m) => m.PartNumberAreaManagment),
      },
      {
        path: 'part-number-location',
        loadComponent: () =>
          import('./pages/part-number-location-managment/part-number-location-managment').then((m) => m.PartNumberLocationManagment),
      },
    ],
  },
];

export default ADMIN_ROUTES;
