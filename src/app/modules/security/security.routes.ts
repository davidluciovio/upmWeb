import { Routes } from '@angular/router';

export const SECURITY_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./layouts/security-layout').then((m) => m.SecurityLayout),
		title: 'Seguridad',
		children: [
			{
				path: 'users',
				title: 'Usuarios',
				loadComponent: () => import('./pages/users/users').then((m) => m.Users),
			},
			{
				path: 'roles',
				title: 'Roles',
				loadComponent: () => import('./pages/roles/roles').then((m) => m.Roles),
			},
			{
				path: 'permissions',
				title: 'Permisos',
				loadComponent: () => import('./pages/permissions/permissions').then((m) => m.Permissions),
			},
		]
	},
	
];

export default SECURITY_ROUTES;
