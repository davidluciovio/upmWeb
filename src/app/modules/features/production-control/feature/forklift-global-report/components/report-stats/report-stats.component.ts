import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusFilterType = 'ALL' | 'CRITICAL' | 'ACTIVE' | 'COMPLETED';

@Component({
	selector: 'forklift-report-stats',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 px-2">
			<!-- Total -->
			<div
				(click)="onFilterChange.emit('ALL')"
				[ngClass]="{
					'ring-4 ring-primary-500/20 border-primary-500/50 scale-[1.02] bg-primary-500/5': currentFilter() === 'ALL',
				}"
				class="bg-surface-0 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800 rounded-4xl p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl group"
			>
				<div class="flex justify-between items-center mb-4">
					<div class="bg-primary-500/10 p-2 rounded-xl text-primary-500">
						<span class="material-symbols-outlined text-2xl">all_inclusive</span>
					</div>
					<span class="text-[10px] font-black tracking-[0.2em] text-surface-400 uppercase">Volumen Total</span>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-4xl font-black m-0 text-surface-900 dark:text-surface-0 tracking-tighter">
						{{ stats().total }}
					</p>
					<span class="text-[10px] font-bold text-surface-400 uppercase">Alertas</span>
				</div>
			</div>

			<!-- Críticos -->
			<div
				(click)="onFilterChange.emit('CRITICAL')"
				[ngClass]="{
					'ring-4 ring-red-500/20 border-red-500/50 scale-[1.02] bg-red-500/5': currentFilter() === 'CRITICAL',
				}"
				class="bg-surface-0 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800 rounded-4xl p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl group"
			>
				<div class="flex justify-between items-center mb-4">
					<div class="bg-red-500/10 p-2 rounded-xl text-red-500">
						<span class="material-symbols-outlined text-2xl animate-pulse">warning</span>
					</div>
					<span class="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">Críticos</span>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-4xl font-black m-0 text-red-600 dark:text-red-400 tracking-tighter">
						{{ stats().critical }}
					</p>
					<span class="text-[10px] font-bold text-red-400 uppercase">Rupturas</span>
				</div>
			</div>

			<!-- Pendientes -->
			<div
				(click)="onFilterChange.emit('ACTIVE')"
				[ngClass]="{
					'ring-4 ring-amber-500/20 border-amber-500/50 scale-[1.02] bg-amber-500/5': currentFilter() === 'ACTIVE',
				}"
				class="bg-surface-0 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800 rounded-4xl p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl group"
			>
				<div class="flex justify-between items-center mb-4">
					<div class="bg-amber-500/10 p-2 rounded-xl text-amber-500">
						<span class="material-symbols-outlined text-2xl">timeline</span>
					</div>
					<span class="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase">En Proceso</span>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-4xl font-black m-0 text-amber-600 dark:text-amber-400 tracking-tighter">
						{{ stats().active }}
					</p>
					<span class="text-[10px] font-bold text-amber-400 uppercase">Pedidos</span>
				</div>
			</div>

			<!-- Completados -->
			<div
				(click)="onFilterChange.emit('COMPLETED')"
				[ngClass]="{
					'ring-4 ring-green-500/20 border-green-500/50 scale-[1.02] bg-green-500/5': currentFilter() === 'COMPLETED',
				}"
				class="bg-surface-0 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800 rounded-4xl p-6 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl group"
			>
				<div class="flex justify-between items-center mb-4">
					<div class="bg-green-500/10 p-2 rounded-xl text-green-500">
						<span class="material-symbols-outlined text-2xl">task_alt</span>
					</div>
					<span class="text-[10px] font-black tracking-[0.2em] text-green-500 uppercase">Surtidos</span>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-4xl font-black m-0 text-green-600 dark:text-green-400 tracking-tighter">
						{{ stats().completed }}
					</p>
					<span class="text-[10px] font-bold text-green-400 uppercase">Cerrados</span>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftReportStatsComponent {
	stats = input.required<{ total: number; critical: number; active: number; completed: number }>();
	currentFilter = input.required<StatusFilterType>();

	onFilterChange = output<StatusFilterType>();
}
