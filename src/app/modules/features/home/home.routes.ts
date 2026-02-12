import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./home').then((m) => m.Home),
	},
	{
		path: 'operational-analysis',
		title: 'Analisis de Eficiencia Operativa',
		loadComponent: () => import('./feature/operational-analysis/operational-analysis').then((m) => m.OperationalAnalysis),
	},
	{
		path: 'operational-analysis-stamp',
		title: 'Analisis Operativo Estampado',
		loadComponent: () => import('./feature/operational-analysis-stamp/operational-analysis-stamp').then((m) => m.OperationalAnalysisStamp),
	},
	{
		path: 'global-analysis',
		title: 'Analisis Global',
		loadComponent: () => import('./feature/global-analysis/global-analysis').then((m) => m.GlobalAnalysis),
	},
];

export default HOME_ROUTES;
