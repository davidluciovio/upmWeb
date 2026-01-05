import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./home').then((m) => m.Home),
	},
	{
        path: 'integrated-operativity',
        title: 'Analisis de Eficiencia Operativa',
        loadComponent: () => import('./feature/integrated-operativity/integrated-operativity').then((m) => m.IntegratedOperativity),
    }
];

export default HOME_ROUTES;
