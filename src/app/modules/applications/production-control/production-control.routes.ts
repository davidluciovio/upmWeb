import { Routes } from '@angular/router';

export const PRODUCTION_CONTROL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./production-control-layout').then((m) => m.ProductionControlLayout),
  },
  {
    path: 'supervisor-alert',
    loadComponent: () =>
      import('./supervisor-alert/pages/supervisor-dashboard/supervisor-dashboard').then(
        (m) => m.SupervisorDashboard,
      ),
  },
  {
    path: 'component-alert',
    loadComponent: () =>
      import('./component-alert/page/component-alert-page').then(
        (m) => m.ComponentAlertPage,
      ),
  },
  {
    path: 'managment-pc',
    loadComponent: () =>
      import('./managment/managment-pc').then(
        (m) => m.ManagmentPC,
      ),
    loadChildren: () => [
      {
        
        path: 'area',
        loadComponent: () =>
          import('./managment/area-managment/area-managment').then(
            (m) => m.AreaManagment,
          ),
      },
      {
        path: 'location',
        loadComponent: () =>
          import('./managment/location-managment/location-managment').then(
            (m) => m.LocationManagment,
          ),
      }
    ]
  },
];

export default PRODUCTION_CONTROL_ROUTES;
