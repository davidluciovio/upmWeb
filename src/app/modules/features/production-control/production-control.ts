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
		{ label: 'COMPONENTES', subLabel: 'REPORTES', icon: 'dashboard', route: 'component-alert-report' },
		{ label: 'MONTACARGUISTA', subLabel: 'VISTA OPERATIVA', icon: 'forklift', route: 'forklifter-view' },
	];
}
