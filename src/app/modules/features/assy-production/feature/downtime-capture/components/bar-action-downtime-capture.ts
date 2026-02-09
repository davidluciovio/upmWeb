import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { DowntimeCaptureResponseInterface } from '../services/load-data-downtime-capture';

@Component({
	selector: 'bar-action-downtime-capture',
	standalone: true,
	imports: [CommonModule, ButtonModule, RippleModule, TooltipModule],
	template: `
		<div class="flex items-center gap-4 mr-4">
			<div class="flex flex-col">
				<h1 class="text-xl font-black text-white uppercase tracking-tight leading-none">
					{{ data()?.lineDescription || 'Línea Desconocida' }}
				</h1>
			</div>
		</div>

		<div class="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
			<p-button
				label="Rack"
				[outlined]="true"
				severity="secondary"
				(click)="onAddRack.emit()"
				styleClass="!rounded-xl !p-2 !px-3 !bg-white/10 !text-sky-100 !border-white/10 hover:!bg-white/20 font-bold text-xs !border"
			>
				<ng-template pTemplate="icon">
					<span class="material-symbols-outlined text-base mr-2">shelves</span>
				</ng-template>
			</p-button>

			<p-button
				label="Operador"
				[outlined]="true"
				severity="secondary"
				(click)="onAddOperator.emit()"
				styleClass="!rounded-xl !p-2 !px-3 !bg-white/10 !text-sky-100 !border-white/10 hover:!bg-white/20 font-bold text-xs !border"
			>
				<ng-template pTemplate="icon">
					<span class="material-symbols-outlined text-base mr-2">person_add</span>
				</ng-template>
			</p-button>

			<p-button
				label="Alerta Material"
				[outlined]="true"
				severity="help"
				(click)="onAddMaterialAlert.emit()"
				styleClass="!rounded-xl !p-2 !px-3 !bg-amber-500/20 !text-amber-200 !border-amber-500/50 hover:!bg-amber-500/30 font-bold text-xs !border"
			>
				<ng-template pTemplate="icon">
					<span class="material-symbols-outlined text-base mr-2">notifications_active</span>
				</ng-template>
			</p-button>

			<p-button
				label="Agregar Paro"
				severity="danger"
				[outlined]="true"
				(click)="onAddDowntime.emit()"
				styleClass="!rounded-xl !p-2 !px-3 !bg-rose-500/20 !text-rose-200 !border-rose-500/50 hover:!bg-rose-500/30 font-bold text-xs !border"
			>
				<ng-template pTemplate="icon">
					<span class="material-symbols-outlined text-base mr-2">timer_off</span>
				</ng-template>
			</p-button>
			
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class:
			'flex justify-center bg-sky-900/90 dark:bg-surface-900/60 border border-surface-200/20 dark:border-surface-900/5 shadow-xl rounded-xl backdrop-blur-xl p-2',
	},
})
export class BarActionDowntimeCapture {
	public data = input.required<DowntimeCaptureResponseInterface | undefined>();

	@Output() onRefesh = new EventEmitter<void>();
	@Output() onAddDowntime = new EventEmitter<void>();
	@Output() onAddOperator = new EventEmitter<void>();
	@Output() onAddRack = new EventEmitter<void>();
	@Output() onAddMaterialAlert = new EventEmitter<void>();
}
