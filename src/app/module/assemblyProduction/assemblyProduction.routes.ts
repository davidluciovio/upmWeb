import { Routes } from '@angular/router';

export const assemblyProductionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./assemblyProduction.component'),
  },
  {
    path: 'productionHistoryReport',
    title: 'Reporte Historial de Producción',
    data: {
      icon: 'history',
      role: ['ADMIN', 'SUPERVISOR', 'LIDER']
    },
    loadComponent: () => import('./pages/productionHistoryReport/productionHistoryReport.component'),

  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  }
];

export default assemblyProductionRoutes;

