import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayout,
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    }
];

export default ADMIN_ROUTES; 