import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
	selector: 'production-control',
	imports: [ModulesLayout],
	template: `<modules-layout [modules]="items"></modules-layout>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionControl {
	protected items: ModuleItem[] = [
		{ label: 'SUPERVISOR', subLabel: 'CONTROL DE PRODUCCION', icon: 'dashboard', route: 'production-control-supervisor' },
		{ label: 'SUPERVISOR', subLabel: 'REPORTES', icon: 'dashboard', route: 'forklift-global-report' },
		{ label: 'SUPERVISOR', subLabel: 'ALERTAS', icon: 'dashboard', route: 'supervisor-alert' },
		{ label: 'COMPONENTES', subLabel: 'ALERTAS', icon: 'dashboard', route: 'component-alert' },
	];
}
