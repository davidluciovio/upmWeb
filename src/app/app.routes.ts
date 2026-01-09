import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./core/layout/main/main').then((m) => m.Main),
		loadChildren: () => [
			{
				path: '',
				loadChildren: () => import('./modules/applications/dashboard/dashboard.routes'),
			},
			// {
			// 	path: '',
			// 	loadChildren: () => import('./modules/features/home/home.routes'),
			// },
			{
				path: 'admin',
				loadChildren: () => import('./modules/Admin/admin.routes'),
				canActivate: [adminGuard],
			},
			{
				path: 'security',
				loadChildren: () => import('./modules/security/security.routes'),
			},
			{ 
				path: 'production_control',
				loadChildren: () => import('./modules/applications/production-control/production-control.routes'),
			},
			{
				path: 'assembly_production',
				loadChildren: () => import('./modules/applications/assembly-production/assembly-production.routes'),
			},
		],
	},
	{
		path: 'change-password',
		loadComponent: () => import('./modules/auth/pages/change-password/change-password').then((m) => m.ChangePassword),
	},
	{
		path: 'login',
		loadComponent: () => import('./modules/auth/pages/login/login').then((m) => m.Login),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
