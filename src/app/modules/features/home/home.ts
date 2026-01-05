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
		{ label: 'CUMPLIMIENTO Y OPERATIVIDAD', subLabel: 'ANALISIS DE EFICIENCIA OPERATIVA', icon: 'dashboard', route: 'integrated-operativity' },
	];
}
