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
		loadChildren: () => [
			{
				path: 'model',
				title: 'Modelos',
				loadComponent: () => import('../../Admin/pages/model-mangment/model-mangment').then((m) => m.ModelMangment),
			},
			{
				path: 'line',
				title: 'Líneas',
				loadComponent: () => import('../../Admin/pages/line-managment/line-managment').then((m) => m.LineManagment),
			},
			{
				path: 'area',
				title: 'Áreas',
				loadComponent: () => import('../../Admin/pages/area-managment/area-managment').then((m) => m.AreaManagment),
			},
			{
				path: 'location',
				title: 'Ubicaciones',
				loadComponent: () => import('../../Admin/pages/location-managment/location-managment').then((m) => m.LocationManagment),
			},
			{
				path: 'part-number',
				title: 'Números de Parte',
				loadComponent: () => import('../../Admin/pages/part-number-managment/part-number-managment').then((m) => m.PartNumberManagment),
			},
			{
				path: 'part-number-logistics',
				title: 'Logistica de Partes',
				loadComponent: () =>
					import('../../Admin/pages/part-number-logistics-managment/part-number-logistics-managment').then((m) => m.PartNumberLogisticsManagment),
			},
			{
				path: 'forklift-area',
				title: 'Areas de Montacargas',
				loadComponent: () => import('../../Admin/feature/forklift-area').then((m) => m.ForkliftArea),
			},
			{
				path: 'part-number-structure',
				title: 'Estructura de Números de Parte',
				loadComponent: () =>
					import('./feature/production-control-supervisor/components/partnumber-structure/partnumber-structure').then((m) => m.PartNumberStructure),
			},
		],
	},
	{
		path: 'supervisor-alert',
		title: 'Supervisor de Alertas',
		loadComponent: () => import('./feature/supervisor-alert/pages/supervisor-dashboard/supervisor-dashboard').then((m) => m.SupervisorDashboard),
	},
	{
		path: 'component-alert',
		title: 'Alertas de Componentes',
		loadComponent: () => import('./feature/component-alert/page/component-alert-page').then((m) => m.ComponentAlertPage),
	},
];

export default PRODUCTION_CONTROL_ROUTES;
