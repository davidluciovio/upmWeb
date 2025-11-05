import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/auth/pages/login/login').then(m => m.Login)
    },
    {
        path: 'admin',
        loadChildren: () => import('./modules/Admin/admin.routes')
    },
    {
        path: 'production_control',
        loadChildren: () => import('./modules/applications/production-control/production-control.routes')
    },
    {
        path: '',
        loadComponent: () => import('./modules/home/pages/home/home').then(m => m.Home)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
