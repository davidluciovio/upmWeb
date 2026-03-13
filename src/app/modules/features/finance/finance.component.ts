import { Component } from '@angular/core';
import { ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
	selector: 'app-finance',
	template: `<modules-layout [modules]="items"></modules-layout>`,
	standalone: true,
	imports: [ModulesLayout],
})
export class FinanceComponent {
	items = [{ label: 'Supervisor', icon: 'supervisor_account', route: 'supervisor' }];
}
