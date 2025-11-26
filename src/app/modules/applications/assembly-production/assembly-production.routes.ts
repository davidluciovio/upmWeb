import { Routes } from '@angular/router';

export const ASSEMBLY_PRODUCTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./assembly-production-layout').then((m) => m.AssemblyProductionLayout),
  },
];

export default ASSEMBLY_PRODUCTION_ROUTES;
