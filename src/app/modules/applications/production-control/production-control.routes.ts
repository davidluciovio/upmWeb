import { Routes } from '@angular/router';

export const PRODUCTION_CONTROL_ROUTES: Routes = [
    {
        path:'',
        loadComponent: () => import('./production-control-layout').then(m => m.productionControlLayout)
    },
    {
        path:'component-alert',
        loadComponent: () => import('./component-alert/page/component-alert-page').then(m => m.ComponentAlertPage)
    },
];

export default PRODUCTION_CONTROL_ROUTES;
