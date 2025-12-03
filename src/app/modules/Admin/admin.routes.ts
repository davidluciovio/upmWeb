import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./layout/admin-layout').then((m) => m.AdminLayout),
		loadChildren: () => [
			{
				path: 'model',
				title:'Modelos',
				loadComponent: () => import('./pages/model-mangment/model-mangment').then((m) => m.ModelMangment),
			},
			{
				path: 'line',
				title:'Lineas',
				loadComponent: () => import('./pages/line-managment/line-managment').then((m) => m.LineManagment),
			},
			{
				path: 'area',
				title:'Areas',
				loadComponent: () => import('./pages/area-managment/area-managment').then((m) => m.AreaManagment),
			},
			{
				path: 'location',
				title:'Ubicaciones',
				loadComponent: () => import('./pages/location-managment/location-managment').then((m) => m.LocationManagment),
			},
			{
				path: 'part-number',
				title:'Números de Parte',
				loadComponent: () => import('./pages/part-number-managment/part-number-managment').then((m) => m.PartNumberManagment),
			},
			{
				path: 'part-number-logistics',
				title:'Logistica de Partes',
				loadComponent: () => import('./pages/part-number-logistics-managment/part-number-logistics-managment').then((m) => m.PartNumberLogisticsManagment),
			},
			{
				path: 'production-station',
				title:'Estaciones de Producción',
				loadComponent: () => import('./pages/production-station-managment/production-station-managment').then((m) => m.ProductionStationManagment),
			},
		],
	},
];

export default ADMIN_ROUTES;
