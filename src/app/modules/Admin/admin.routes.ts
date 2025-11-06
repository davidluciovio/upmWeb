import { Routes } from '@angular/router';
import { ModelManager } from './pages/model-manager/model-manager';
import { AdminLayout } from './layout/admin-layout';
import { authGuard } from '../../core/guards/auth-guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayout,
    },
    {
        path: 'model-manager',
        component: ModelManager,
        canActivate: [authGuard],
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    }
];

export default ADMIN_ROUTES; 