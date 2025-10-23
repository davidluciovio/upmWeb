import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/auth/pages/login/login').then(m => m.Login)
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
