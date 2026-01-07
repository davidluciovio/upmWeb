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
	
];

export default HOME_ROUTES;
