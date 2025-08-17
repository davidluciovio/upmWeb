import { Routes } from '@angular/router';

export const assemblyProductionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./assemblyProduction.component'),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  }
];

export default assemblyProductionRoutes;

