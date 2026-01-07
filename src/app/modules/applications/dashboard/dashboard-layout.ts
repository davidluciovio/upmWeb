import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
	selector: 'dashboard-layout',
	imports: [ModulesLayout],
	template: `<modules-layout [modules]="items"></modules-layout>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout {
	protected items: ModuleItem[] = [
		{ label: 'ACHIEVEMENT DASHBOARD', subLabel: '目標達成率管理', icon: 'dashboard', route: 'achievement-dashboard' },
		{ label: 'OPERATIONAL EFFICIENCY', subLabel: '稼働率分析ダッシュボード', icon: 'dashboard', route: 'operational-efficiency' },
		// { label: 'SLIDES DASHBOARD', subLabel: 'スライドダッシュボード', icon: 'dashboard', route: 'slides-dashboard' },
	];
}
