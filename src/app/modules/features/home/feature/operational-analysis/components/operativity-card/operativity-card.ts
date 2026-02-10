import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { CardOperativity } from '../../services/load-data';
import { PercentPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-operativity-card',
	imports: [PercentPipe, CommonModule],
	template: `
		<div class="operativity-card-container" [style.border-left-color]="getEnfasisColor().border">
			<h2 class="area-title">{{ cardData().area }}</h2>
			<div class="value-container">
				<p class="operativity-value" [style.color]="getEnfasisColor().color">{{ cardData().operativity | percent: '1.2-2' }}</p>
				<p class="operativity-badge">Operatividad</p>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'operativity-card-host',
	},
	styles: [
		`
			.operativity-card-host {
				display: block;
				border: 1px solid #e2e8f0;
				border-radius: 1rem;
				box-shadow:
					0 10px 15px -3px rgba(0, 0, 0, 0.1),
					0 4px 6px -2px rgba(0, 0, 0, 0.05);
				overflow: hidden;
			}

			.operativity-card-container {
        display: flex;
				flex-direction: column;
				gap: 0.75rem;
				padding: 1.25rem;
				border-left: 8px solid transparent;
        border-radius: 1rem;
        background-color: rgba(255, 255, 255, 0.6);
			}

			.area-title {
				font-size: 1.25rem;
				font-weight: 700;
				margin: 0;
				color: #1e293b;
			}

			.value-container {
				display: flex;
				flex-direction: row;
				gap: 0.5rem;
				align-items: flex-end;
			}

			.operativity-value {
				font-size: 2.25rem;
				font-weight: 700;
				margin: 0;
				line-height: 1;
			}

			.operativity-badge {
				font-size: 0.75rem;
				font-weight: 700;
				margin-left: 0.25rem;
				background-color: #e2e8f0;
				border-radius: 9999px;
				padding: 0.25rem 0.5rem;
				color: #334155;
			}

			:host-context(.dark-mode) .operativity-card-host {
				background-color: #0f172a;
				border-color: #1e293b;
			}
			:host-context(.dark-mode) .operativity-card-container {
				background-color: #0f172a;
			}
      :host-context(.dark-mode) .area-title {
				color: #f8fafc;
			}
			:host-context(.dark-mode) .operativity-badge {
				background-color: #334155;
				color: #e2e8f0;
			}
		`,
	],
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
