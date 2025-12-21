import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./dashboard-layout').then((m) => m.DashboardLayout),
	},
	{
		path: 'achievement-dashboard',
		loadComponent: () => import('./achievement-dashboard/achievement-dashboard').then((m) => m.AchievementDashboardComponent),
	},
];

export default DASHBOARD_ROUTES;
