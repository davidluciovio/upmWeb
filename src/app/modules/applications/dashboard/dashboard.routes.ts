import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./dashboard-layout').then((m) => m.DashboardLayout),
	},
	{
		path: 'achievement-dashboard',
		title: 'Dashboard de Logros',
		loadComponent: () => import('./achievement-dashboard/achievement-dashboard').then((m) => m.AchievementDashboardComponent),
	},
	{
		path: 'operational-efficiency',
		title: 'Eficiencia Operativa',
		loadComponent: () => import('./operational-efficiency/operational-efficiency').then((m) => m.OperationalEfficiency),
	},
	{
		path: 'slides-dashboard',
		title: 'Dashboard de Slides',
		loadComponent: () => import('./pages/slides-dashboard/slides-dashboard').then((m) => m.SlidesDashboard),
	},
];

export default DASHBOARD_ROUTES;
