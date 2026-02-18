import { Routes } from '@angular/router';

export const ASSY_PRODUCTION_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./assy-production').then((m) => m.AssyProduction),
	},
	{
		path: 'downtime-capture',
		title: 'Captura de tiempos de paro',
		loadComponent: () => import('./feature/downtime-capture/downtime-capture').then((m) => m.DowntimeCapture),
	},
];

export default ASSY_PRODUCTION_ROUTES;
