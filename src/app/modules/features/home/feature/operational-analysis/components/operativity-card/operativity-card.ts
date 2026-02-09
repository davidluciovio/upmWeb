import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { CardOperativity } from '../../services/load-data';
import { PercentPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-operativity-card',
	imports: [PercentPipe, CommonModule],
	template: `
		<div
			class="flex flex-col gap-3 p-5 border border-l-8 border-t-0 border-b-0 border-r-0 rounded-xl -ml-0.5"
			[style.border-left-color]="getEnfasisColor().border"
		>
			<h2 class="text-xl font-bold">{{ cardData().area }}</h2>
			<div class="flex flex-row gap-2 items-end">
				<p class="text-4xl font-bold" [style.color]="getEnfasisColor().color">{{ cardData().operativity | percent: '1.2-2' }}</p>
				<p class="text-xs font-bold ml-1 bg-slate-200 dark:bg-slate-700 rounded-full px-2 py-1 text-slate-700 dark:text-slate-200">Operatividad</p>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl justify-center shadow-lg',
	},
})
export class OperativityCard implements OnInit {
	public cardData = input.required<CardOperativity>();
	constructor() {}

	ngOnInit(): void {}

	getEnfasisColor(): { border: string; color: string } {
		if (!this.cardData()) return { border: '#94a3b8', color: '#94a3b8' }; // slate-400

		// Define standard hex colors for success, warning, and error
		const successColor = '#10b981'; // emerald-500
		const warningColor = '#f59e0b'; // amber-500
		const errorColor = '#ef4444'; // red-500

		const operativity = this.cardData().operativity;
		const area = this.cardData().area.toUpperCase();

		if (area === 'ENSAMBLE I' || area === 'ENSAMBLE II' || area === 'ENSAMBLE III') {
			if (operativity >= 0.85) return { border: successColor, color: successColor };
			if (operativity >= 0.7) return { border: warningColor, color: warningColor };
			return { border: errorColor, color: errorColor };
		}

		if (area === 'PCP CORTE') {
			if (operativity >= 0.75) return { border: successColor, color: successColor };
			if (operativity >= 0.7) return { border: warningColor, color: warningColor };
			return { border: errorColor, color: errorColor };
		}

		if (area === 'PCP ESTAMPADO') {
			if (operativity >= 0.7) return { border: successColor, color: successColor };
			if (operativity >= 0.7) return { border: warningColor, color: warningColor }; // Note: original had a redundant check here, keeping simplified logic
			return { border: errorColor, color: errorColor };
		}

		return operativity < 0.9 ? { border: errorColor, color: errorColor } : { border: successColor, color: successColor };
	}
}
