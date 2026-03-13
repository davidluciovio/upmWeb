import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./finance.component').then((m) => m.FinanceComponent),
	},
	{
		path: 'supervisor',
		title: 'Supervisor',
		loadComponent: () => import('./feature/finance-supervisor/finance-supervisor').then((m) => m.FinanceSupervisor),
		children: [
			{
				path: 'profit',
				title: 'Profit',
				loadComponent: () => import('./feature/finance-supervisor/components/profit/profit').then((m) => m.Profit),
			},
			{
				path: 'product-category',
				title: 'Categoría de Producto',
				loadComponent: () => import('./feature/finance-supervisor/components/product-category/product-category').then((m) => m.ProductCategory), 
			},
			{
				path: 'cost-type',
				title: 'Tipo de Costo',
				loadComponent: () => import('./feature/finance-supervisor/components/cost-type/cost-type').then((m) => m.CostType),
			},
			{
				path: 'product',
				title: 'Producto',
				loadComponent: () => import('./feature/finance-supervisor/components/product/product').then((m) => m.Product),
			},
			{
				path: 'business-plan',
				title: 'Plan de Negocio',
				loadComponent: () => import('./feature/finance-supervisor/components/business-plan/business-plan').then((m) => m.BusinessPlan),
			},
			{
				path: 'annual-budget',
				title: 'Presupuesto Anual',
				loadComponent: () => import('./feature/finance-supervisor/components/annual-budget/annual-budget').then((m) => m.AnnualBudget),
			},
			{
				path: 'monthly-budget',
				title: 'Presupuesto Mensual',
				loadComponent: () => import('./feature/finance-supervisor/components/monthly-budget/monthly-budget').then((m) => m.MonthlyBudget),
			},
			{
				path: 'budget-type',
				title: 'Tipo de Presupuesto',
				loadComponent: () => import('./feature/finance-supervisor/components/budget-type/budget-type').then((m) => m.BudgetType),
			},
		],
	},
];

export default FINANCE_ROUTES;