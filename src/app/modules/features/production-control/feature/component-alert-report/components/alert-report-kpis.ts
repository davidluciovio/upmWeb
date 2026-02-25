import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
	selector: 'alert-report-kpis',
	standalone: true,
	imports: [CommonModule, DecimalPipe],
	template: `
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
			@for (kpi of kpiList(); track $index) {
				<div class="glass-effect p-6 relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 border border-white/40 shadow-xl">
					<div class="flex flex-col gap-4 relative z-10">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ kpi.label }}</span>
							<span
								class="material-symbols-outlined text-(--kpi-color) opacity-80 group-hover:scale-125 transition-transform duration-500"
								[style.--kpi-color]="getColorHex(kpi.color)"
								>{{ kpi.icon }}</span
							>
						</div>
						<div class="flex items-baseline gap-1">
							<h3 class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
								{{ kpi.val | number: '1.0-1' }}
							</h3>
							@if (kpi.suffix) {
								<span class="text-xs font-bold text-slate-400 tracking-tight">{{ kpi.suffix }}</span>
							}
						</div>
					</div>
					<div
						class="absolute -right-4 -bottom-4 w-20 h-20 bg-(--kpi-bg) rounded-full blur-2xl group-hover:bg-(--kpi-bg-hover) transition-all duration-700"
						[style.--kpi-bg]="getBgHex(kpi.color, 0.05)"
						[style.--kpi-bg-hover]="getBgHex(kpi.color, 0.2)"
					></div>
				</div>
			}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertReportKpisComponent {
	kpiData = input.required<{
		total: number;
		pending: number;
		inProcess: number;
		completed: number;
		cancelled: number;
		critical: number;
		avgResponseTime: number;
	}>();

	protected kpiList = () => {
		const data = this.kpiData();
		return [
			{ label: 'Total Alertas', val: data.total, icon: 'database', color: 'indigo' },
			{ label: 'Pendientes', val: data.pending, icon: 'hourglass_empty', color: 'sky' },
			{ label: 'En Proceso', val: data.inProcess, icon: 'forklift', color: 'amber' },
			{ label: 'Completados', val: data.completed, icon: 'check_circle', color: 'emerald' },
			{ label: 'Cancelados', val: data.cancelled, icon: 'cancel', color: 'rose' },
			{ label: 'Críticos', val: data.critical, icon: 'warning', color: 'orange' },
			{ label: 'Promedio', val: data.avgResponseTime, icon: 'bolt', color: 'violet', suffix: 'min' },
		];
	};

	protected getColorHex(color: string): string {
		const colors: Record<string, string> = {
			indigo: '#6366f1',
			sky: '#0ea5e9',
			amber: '#f59e0b',
			rose: '#f43f5e',
			emerald: '#10b981',
		};
		return colors[color] || '#64748b';
	}

	protected getBgHex(color: string, alpha: number): string {
		const colors: Record<string, string> = {
			indigo: `rgba(99, 102, 241, ${alpha})`,
			sky: `rgba(14, 165, 233, ${alpha})`,
			amber: `rgba(245, 158, 11, ${alpha})`,
			rose: `rgba(244, 63, 94, ${alpha})`,
			emerald: `rgba(16, 185, 129, ${alpha})`,
		};
		return colors[color] || `rgba(100, 116, 139, ${alpha})`;
	}
}
