import { Routes } from '@angular/router';

export const PRODUCTION_CONTROL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./production-control-layout').then((m) => m.productionControlLayout),
  },
  {
    path: 'component-alert',
    loadComponent: () =>
      import('./component-alert/page/component-alert-page').then((m) => m.ComponentAlertPage),
  },
  {
    path: 'supervisor-alert',
    loadComponent: () =>
      import('./supervisor-alert/pages/supervisor-dashboard/supervisor-dashboard').then(
        (m) => m.SupervisorDashboard,
      ),
  },
];

export default PRODUCTION_CONTROL_ROUTES;
