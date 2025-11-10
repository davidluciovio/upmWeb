import { Routes } from '@angular/router';

export const ASSEMBLY_PRODUCTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./assembly-production-layout').then((m) => m.AssemblyProductionLayout),
  },
  {
    path: 'managment',
    loadComponent: () =>
      import('./managment/managment-page').then((m) => m.ManagmentPage),
    loadChildren: () => [
      {
        path:'model',
        loadComponent: () =>
          import('./managment/model-mangment/model-mangment').then((m) => m.ModelMangment),

      },
      {
        path:'part_number',
        loadComponent: () =>
          import('./managment/part-number-managment/part-number-managment').then((m) => m.PartNumberManagment),

      },

    ],
  },
];

export default ASSEMBLY_PRODUCTION_ROUTES;
