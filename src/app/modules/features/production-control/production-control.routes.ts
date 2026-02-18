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
				path: 'part-number-logistics',
				title: 'Logistica de Partes',
				loadComponent: () =>
					import('../../Admin/pages/part-number-logistics-managment/part-number-logistics-managment').then((m) => m.PartNumberLogisticsManagment),
			},
			{
				path: 'forklift-area',
				title: 'Areas de Montacargas',
				loadComponent: () => import('./feature/production-control-supervisor/components/forklift-area/forklift-area').then((m) => m.ForkliftArea),
			},
			{
				path: 'material-supplier',
				title: 'Proveedores',
				loadComponent: () =>
					import('./feature/production-control-supervisor/components/material-supplier/material-supplier').then((m) => m.MaterialSupplier),
			},
			{
				path: 'part-number-structure',
				title: 'Estructura de Números de Parte',
				loadComponent: () =>
					import('./feature/production-control-supervisor/components/partnumber-structure/partnumber-structure').then((m) => m.PartNumberStructure),
			},
			{
				path: 'add-forklifter',
				title: 'Catálogo de Montacarguistas',
				loadComponent: () => import('./feature/production-control-supervisor/components/add-forklifter/add-forklifter').then((m) => m.AddForklifter),
			},
		],
	},
	{
		path: 'forklift-global-report',
		title: 'Reporte Global de Montacargas',
		loadComponent: () => import('./feature/forklift-global-report/forklift-global-report').then((m) => m.ForkliftGlobalReportComponent),
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
