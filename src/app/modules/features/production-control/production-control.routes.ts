import { Routes } from '@angular/router';

export const PRODUCTION_CONTROL_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./production-control').then((m) => m.ProductionControl),
	},
	{
		path: 'production-control-supervisor',
		title: 'Supervisor de Control de Producción',
		loadComponent: () => import('./feature/production-control-supervisor/production-control-supervisor').then((m) => m.ProductionControlSupervisor),
	},
];

export default PRODUCTION_CONTROL_ROUTES;
