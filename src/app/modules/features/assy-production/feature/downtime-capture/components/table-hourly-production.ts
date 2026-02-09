import { ChangeDetectionStrategy, Component, computed, input, OnInit } from '@angular/core';
import { PartNumberDataProduction, HourlyProductionData } from '../services/load-data-downtime-capture';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule, DecimalPipe } from '@angular/common';

interface FlattenedHourlyData extends HourlyProductionData {
	partNumberName: string;
	partNumberDescription: string;
	modelName: string;
}

@Component({
	selector: 'table-hourly-production',
	standalone: true,
	imports: [TableModule, ButtonModule, RippleModule, CommonModule],
	providers: [DecimalPipe],
	template: `
		<div class="rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
			<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
						<span class="material-symbols-outlined">history_toggle_off</span>
					</div>
					<div>
						<h2 class="text-md font-black text-slate-800 dark:text-white italic uppercase tracking-tighter leading-none">Registro de Producción</h2>
					</div>
				</div>
				<span
					class="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700"
				>
					{{ flattenedData().length }} REGISTROS
				</span>
			</div>

			<p-table
				[value]="flattenedData()"
				[tableStyle]="{ minWidth: '60rem' }"
				size="small"
				scrollable
				scrollHeight="250px"
			>
				<ng-template pTemplate="header">
					<tr>
						<th
							pSortableColumn="startProductionDate"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
						>
							Horario <p-sortIcon field="startProductionDate" />
						</th>
						<th
							pSortableColumn="partNumberName"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
						>
							No. Parte <p-sortIcon field="partNumberName" />
						</th>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Modelo</th>
						<th
							pSortableColumn="producedQuantity"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Producido <p-sortIcon field="producedQuantity" />
						</th>
						<th
							pSortableColumn="objetiveQuantity"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Objetivo <p-sortIcon field="objetiveQuantity" />
						</th>
						<th
							pSortableColumn="totalWorkingTime"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Trabajado (min) <p-sortIcon field="totalWorkingTime" />
						</th>
						<th
							pSortableColumn="downtimeP"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Paros P (min) <p-sortIcon field="downtimeP" />
						</th>
						<th
							pSortableColumn="downtimeNP"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Paros NP (min) <p-sortIcon field="downtimeNP" />
						</th>
						<th
							pSortableColumn="efectivity"
							class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center"
						>
							Efectividad <p-sortIcon field="efectivity" />
						</th>
					</tr>
				</ng-template>

				<ng-template pTemplate="body" let-record>
					<tr class="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-b border-slate-100 dark:border-slate-800/50">
						<td class="py-3 px-4">
							<div class="flex items-center gap-2">
								<span class="material-symbols-outlined text-sm text-slate-400">schedule</span>
								<span class="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
									{{ record.startProductionDate | date: 'HH:mm' }} - {{ record.endProductionDate | date: 'HH:mm' }}
								</span>
							</div>
						</td>
						<td>
							<div class="flex items-center gap-2">
								<!-- <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
									<span class="material-symbols-outlined text-lg">inventory_2</span>
								</div> -->
								<span class="font-black font-mono text-xs text-slate-800 dark:text-indigo-400">{{ record.partNumberName }}</span>
							</div>
						</td>
						<td>
							<span
								class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700"
							>
								{{ record.modelName }}
							</span>
						</td>
						<td class="text-center">
							<span class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ record.producedQuantity | number }}</span>
						</td>
						<td class="text-center">
							<span class="text-xs font-bold text-slate-400">{{ record.objetiveQuantity | number }}</span>
						</td>
						<td class="text-center">
							<span class="text-xs font-bold text-slate-400">{{ record.totalWorkingTime | number: '1.0-0' }}</span>
						</td>
						<td class="text-center">
							<span
								[class]="
									record.downtimeP > 0
										? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
										: 'text-slate-300 opacity-40'
								"
								class="px-2 py-0.5 rounded-lg text-[10px] font-black inline-block min-w-[40px]"
							>
								{{ record.downtimeP || 0 | number }}
							</span>
						</td>
						<td class="text-center">
							<span
								[class]="
									record.downtimeNP > 0
										? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
										: 'text-slate-300 opacity-40'
								"
								class="px-2 py-0.5 rounded-lg text-[10px] font-black inline-block min-w-[40px]"
							>
								{{ record.downtimeNP || 0 | number }}
							</span>
						</td>
						<td class="text-center">
							<div class="flex flex-col items-center gap-1.5">
								<span [class]="getEfficiencyClass(record.efectivity)" class="text-xs font-black italic">
									{{ record.efectivity | percent: '1.0-0' }}
								</span>
								<div class="w-16 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
									<div
										class="h-full transition-all duration-1000 ease-out"
										[style.width.%]="record.efectivity * 100"
										[class]="getEfficiencyBgClass(record.efectivity)"
									></div>
								</div>
							</div>
						</td>
					</tr>
				</ng-template>

				<ng-template pTemplate="emptymessage">
					<tr>
						<td colspan="8" class="text-center p-12">
							<div class="flex flex-col items-center gap-3 opacity-20">
								<span class="material-symbols-outlined text-6xl">data_alert</span>
								<p class="text-sm font-black uppercase tracking-widest">No hay registros de producción disponibles</p>
							</div>
						</td>
					</tr>
				</ng-template>
				<ng-template pTemplate="footer">
					<tr
						class="sticky bottom-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.05)]"
					>
						<td colspan="3" class="py-4 px-6 text-right">
							<div class="flex items-center justify-end gap-2 text-indigo-900 dark:text-indigo-200">
								<span class="material-symbols-outlined text-lg">functions</span>
								<span class="text-[10px] font-black uppercase tracking-widest">Totales Operativos</span>
							</div>
						</td>
						<td class="py-4 px-4 text-center">
							<span class="font-black text-sm text-indigo-600 dark:text-indigo-400 tabular-nums">{{ totals().producedQuantity | number }}</span>
						</td>
						<td class="py-4 px-4 text-center">
							<span class="font-bold text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ totals().objetiveQuantity | number }}</span>
						</td>
						<td class="py-4 px-4 text-center">
							<span class="font-bold text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ totals().totalWorkingTime | number: '1.0-0' }}</span>
						</td>
						<td class="py-4 px-4 text-center">
							<div
								*ngIf="totals().downtimeP > 0"
								class="inline-flex items-center justify-center px-2 py-0.5 rounded bg-sky-100/50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800"
							>
								<span class="text-sky-700 dark:text-sky-400 font-bold text-xs tabular-nums">{{ totals().downtimeP | number }}</span>
							</div>
							<span *ngIf="totals().downtimeP === 0" class="text-slate-300 dark:text-slate-700 font-bold text-xs">-</span>
						</td>
						<td class="py-4 px-4 text-center">
							<div
								*ngIf="totals().downtimeNP > 0"
								class="inline-flex items-center justify-center px-2 py-0.5 rounded bg-rose-100/50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800"
							>
								<span class="text-rose-700 dark:text-rose-400 font-bold text-xs tabular-nums">{{ totals().downtimeNP | number }}</span>
							</div>
							<span *ngIf="totals().downtimeNP === 0" class="text-slate-300 dark:text-slate-700 font-bold text-xs">-</span>
						</td>
						<td class="py-4 px-4 text-center last:pr-6">
							<div class="flex flex-col items-end gap-1 w-full max-w-[100px] ml-auto">
								<span [class]="getEfficiencyClass(totals().efectivity)" class="text-xs font-black tabular-nums">
									{{ totals().efectivity | percent: '1.0-0' }}
								</span>
								<div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
										[style.width.%]="totals().efectivity * 100"
										[class]="getEfficiencyBgClass(totals().efectivity)"
									></div>
								</div>
							</div>
						</td>
					</tr>
				</ng-template>
			</p-table>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHourlyProduction implements OnInit {
	public data = input.required<PartNumberDataProduction[]>();

	protected flattenedData = computed(() => {
		const result: FlattenedHourlyData[] = [];
		this.data().forEach((part) => {
			part.hourlyProductionDatas.forEach((hour) => {
				result.push({
					...hour,
					partNumberName: part.partNumberName,
					partNumberDescription: part.partNumberDescription,
					modelName: part.modelName,
				});
			});
		});

		return result.sort((a, b) => new Date(b.startProductionDate).getTime() - new Date(a.startProductionDate).getTime());
	});

	protected totals = computed(() => {
		const data = this.flattenedData();
		const totals = data.reduce(
			(acc, curr) => ({
				producedQuantity: acc.producedQuantity + (curr.producedQuantity || 0),
				objetiveQuantity: acc.objetiveQuantity + (curr.objetiveQuantity || 0),
				totalWorkingTime: acc.totalWorkingTime + (curr.totalWorkingTime || 0),
				downtimeP: acc.downtimeP + (curr.downtimeP || 0),
				downtimeNP: acc.downtimeNP + (curr.downtimeNP || 0),
			}),
			{
				producedQuantity: 0,
				objetiveQuantity: 0,
				totalWorkingTime: 0,
				downtimeP: 0,
				downtimeNP: 0,
			},
		);

		return {
			...totals,
			efectivity: totals.objetiveQuantity > 0 ? totals.producedQuantity / totals.objetiveQuantity : 0,
		};
	});

	getEfficiencyClass(value: number): string {
		if (value >= 0.85) return 'text-emerald-500';
		if (value >= 0.75) return 'text-orange-500';
		return 'text-red-500';
	}

	getEfficiencyBgClass(value: number): string {
		if (value >= 0.85) return 'bg-emerald-500';
		if (value >= 0.75) return 'bg-orange-500';
		return 'bg-red-500';
	}

	constructor() {}

	ngOnInit() {}
}
