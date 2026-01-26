import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
	selector: 'home',
	imports: [ModulesLayout],
	template: `<modules-layout [modules]="items"></modules-layout>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
	protected items: ModuleItem[] = [
		{ label: 'OPERATIVIDAD', subLabel: 'ANALISIS DE EFICIENCIA OPERATIVA', icon: 'dashboard', route: 'operational-analysis' },
		{ label: 'OPERATIVIDAD ESTAMPADO', subLabel: 'ANALISIS OPERATIVO ESTAMPADO', icon: 'dashboard', route: 'operational-analysis-stamp' },
	];
}
