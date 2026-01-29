import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { PartNumberDataProduction, HourlyProductionData } from '../services/load-data-downtime-capture';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
	selector: 'table-hourly-production',
	standalone: true,
	imports: [TableModule, ButtonModule, RippleModule, CommonModule],
	providers: [DecimalPipe],
	template: `
		<div class="glass-effect rounded-lg border border-slate-300 dark:border-slate-800 overflow-hidden shadow-lg animate-fade-in">
			<p-table [value]="data()" dataKey="partNumberId" [tableStyle]="{ minWidth: '60rem' }" styleClass="p-datatable-sm p-datatable-gridlines">
				<ng-template pTemplate="header">
					<tr class="bg-slate-50 dark:bg-surface-900">
						<th style="width: 3rem"></th>
						<th pSortableColumn="partNumberName">No. Parte <p-sortIcon field="partNumberName" /></th>
						<th>Descripción</th>
						<th>Modelo</th>
						<th class="text-center">Prod. Total</th>
						<th class="text-center">Obj. Total</th>
						<th class="text-center">Eficiencia</th>
					</tr>
				</ng-template>

				<ng-template pTemplate="body" let-part let-expanded="expanded">
					<tr class="hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors">
						<td>
							<p-button
								type="button"
								pRipple
								[pRowToggler]="part"
								[icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
								[text]="true"
								[rounded]="true"
								severity="secondary"
							/>
						</td>
						<td class="font-bold text-primary">{{ part.partNumberName }}</td>
						<td class="text-sm">{{ part.partNumberDescription }}</td>
						<td>
							<span class="px-2 py-1 bg-slate-100 dark:bg-surface-700 rounded text-xs font-medium">{{ part.modelName }}</span>
						</td>
						<td class="text-center font-semibold text-emerald-600">{{ getTotalProduced(part) | number }}</td>
						<td class="text-center font-semibold text-sky-600">{{ getTotalObjective(part) | number }}</td>
						<td class="text-center">
							<div class="flex flex-col items-center gap-1">
								<span [class]="getEfficiencyClass(getTotalEfficiency(part))" class="font-bold">
									{{ getTotalEfficiency(part) | percent: '1.0-1' }}
								</span>
								<div class="w-16 bg-slate-200 dark:bg-surface-700 h-1 rounded-full overflow-hidden">
									<div
										class="h-full transition-all duration-500"
										[style.width.%]="getTotalEfficiency(part) * 100"
										[class]="getEfficiencyBgClass(getTotalEfficiency(part))"
									></div>
								</div>
							</div>
						</td>
					</tr>
				</ng-template>

				<ng-template pTemplate="rowexpansion" let-part>
					<tr>
						<td colspan="7" class="p-0 bg-slate-50/50 dark:bg-surface-900/30">
							<div class="p-4 border-l-4 border-primary ml-12 my-2">
								<h4 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Detalle por Hora</h4>
								<p-table
									[value]="part.hourlyProductionDatas"
									styleClass="p-datatable-sm shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
								>
									<ng-template pTemplate="header">
										<tr class="bg-slate-100 dark:bg-surface-800">
											<th>Inicio</th>
											<th>Fin</th>
											<th class="text-center text-emerald-600">Producido</th>
											<th class="text-center text-sky-600">Objetivo</th>
											<th class="text-center">Downtime Total</th>
											<th class="text-center">Efectividad</th>
										</tr>
									</ng-template>
									<ng-template pTemplate="body" let-hour>
										<tr class="dark:bg-surface-900/50">
											<td class="text-xs font-mono font-bold">{{ hour.startProductionDate | date: 'HH:mm' }}</td>
											<td class="text-xs font-mono text-slate-500">{{ hour.endProductionDate | date: 'HH:mm' }}</td>
											<td class="text-center font-bold">{{ hour.producedQuantity }}</td>
											<td class="text-center">{{ hour.objetiveQuantity }}</td>
											<td class="text-center text-xs">
												<span class="text-red-400 font-medium">{{ hour.totalDowntime }} min</span>
											</td>
											<td class="text-center font-bold" [class]="getEfficiencyClass(hour.efectivity / 100)">
												{{ hour.efectivity / 100 | percent: '1.0-0' }}
											</td>
										</tr>
									</ng-template>
								</p-table>
							</div>
						</td>
					</tr>
				</ng-template>

				<ng-template pTemplate="emptymessage">
					<tr>
						<td colspan="7" class="text-center p-8 text-slate-400 italic">No hay datos de producción para este periodo.</td>
					</tr>
				</ng-template>
			</p-table>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHourlyProduction implements OnInit {
	public data = input.required<PartNumberDataProduction[]>();

	getTotalProduced(part: PartNumberDataProduction): number {
		return part.hourlyProductionDatas?.reduce((sum, h) => sum + h.producedQuantity, 0) || 0;
	}

	getTotalObjective(part: PartNumberDataProduction): number {
		return part.hourlyProductionDatas?.reduce((sum, h) => sum + h.objetiveQuantity, 0) || 0;
	}

	getTotalEfficiency(part: PartNumberDataProduction): number {
		const objective = this.getTotalObjective(part);
		if (objective === 0) return 0;
		return this.getTotalProduced(part) / objective;
	}

	getEfficiencyClass(value: number): string {
		if (value >= 0.9) return 'text-emerald-500';
		if (value >= 0.8) return 'text-orange-500';
		return 'text-red-500';
	}

	getEfficiencyBgClass(value: number): string {
		if (value >= 0.9) return 'bg-emerald-500';
		if (value >= 0.8) return 'bg-orange-500';
		return 'bg-red-500';
	}

	constructor() {}

	ngOnInit() {}
}
