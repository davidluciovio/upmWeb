import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PressGroup } from '../../operational-analysis/services/load-data';
import { CommonModule, PercentPipe } from '@angular/common';

@Component({
	selector: 'app-press-card',
	imports: [CommonModule, PercentPipe],
	template: `
		<div
			class="flex flex-col gap-3 p-5 border border-l-8 border-t-0 border-b-0 border-r-0 rounded-xl -ml-0.5 h-full"
			[ngClass]="getEnfasisColor().border"
		>
			<div class="flex justify-between items-start gap-2">
				<h2 class="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-slate-200 truncate">{{ data().pressName }}</h2>
				<span
					class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 whitespace-nowrap"
				>
					{{ data().parts.length }} PN
				</span>
			</div>
			<div class="flex flex-row gap-2 items-end mt-auto">
				<p class="text-3xl font-bold tracking-tighter" [ngClass]="getEnfasisColor().color">{{ data().totalOperativity | percent: '1.1-1' }}</p>
				<p class="text-[10px] font-bold mb-1 uppercase text-slate-400">Operatividad</p>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'glass-effect rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 block',
	},
})
export class PressCard {
	readonly data = input.required<PressGroup>();

	getEnfasisColor() {
		const op = this.data().totalOperativity;
		if (op >= 0.9) return { border: 'border-emerald-500 dark:border-emerald-600', color: 'text-emerald-500 dark:text-emerald-400' };
		if (op >= 0.8) return { border: 'border-amber-500 dark:border-amber-600', color: 'text-amber-500 dark:text-amber-400' };
		return { border: 'border-red-500 dark:border-red-600', color: 'text-red-500 dark:text-red-400' };
	}
}
