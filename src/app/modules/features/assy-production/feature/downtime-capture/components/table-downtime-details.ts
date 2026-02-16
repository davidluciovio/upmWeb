import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PartNumberDataProduction, DowntimeRegister } from '../services/load-data-downtime-capture';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

interface FlattenedDowntimeDetail extends DowntimeRegister {
	partNumberName: string;
	modelName: string;
}

@Component({
	selector: 'table-downtime-details',
	standalone: true,
	imports: [TableModule, CommonModule],
	template: `
		<div class="rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
			<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
						<span class="material-symbols-outlined font-bold">running_with_errors</span>
					</div>
					<div>
						<h2 class="text-md font-black text-slate-800 dark:text-white italic uppercase tracking-tighter leading-none">Detalle de Paros</h2>
					</div>
				</div>
				<span
					class="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700"
				>
					{{ flattenedDowntimes().length }} REGISTROS
				</span>
			</div>

			<p-table [value]="flattenedDowntimes()" size="small" scrollable scrollHeight="250px">
				<ng-template pTemplate="header">
					<tr>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Inicio</th>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Fin</th>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Minutos</th>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">No. Parte</th>
						<th class="bg-transparent! py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Razón</th>
					</tr>
				</ng-template>

				<ng-template pTemplate="body" let-record>
					<tr class="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors border-b border-slate-100 dark:border-slate-800/50">
						<td class="py-3 px-4">
							<div class="flex items-center gap-2">
								<span class="material-symbols-outlined text-sm text-slate-400 font-bold">schedule</span>
								<span class="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{{ record.startDowntimeDatetime | date: 'HH:mm' }}</span>
							</div>
						</td>
						<td class="py-3 px-4">
							<div class="flex items-center gap-2">
								<span class="material-symbols-outlined text-sm text-slate-400 font-bold">schedule</span>
								<span class="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{{ record.endDowntimeDatetime | date: 'HH:mm' }}</span>
							</div>
						</td>
						<td class="py-3 px-4 text-center">
							<span
								class="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-black inline-block min-w-[40px]"
							>
								{{ getDuration(record.startDowntimeDatetime, record.endDowntimeDatetime) }} min
							</span>
						</td>
						<td class="py-3 px-4">
							<div class="flex flex-col">
								<span class="font-black font-mono text-xs text-slate-800 dark:text-indigo-400">{{ record.partNumberName }}</span>
								<span class="text-[9px] text-slate-400 uppercase font-bold">{{ record.modelName }}</span>
							</div>
						</td>
						
						<td class="py-3 px-4">
							<span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ record.downtimeReason || 'Sin razón especificada' }}</span>
						</td>
					</tr>
				</ng-template>

				<ng-template pTemplate="emptymessage">
					<tr>
						<td colspan="6" class="text-center p-12">
							<div class="flex flex-col items-center gap-3 opacity-20">
								<span class="material-symbols-outlined text-6xl">verified</span>
								<p class="text-sm font-black uppercase tracking-widest">No hay paros registrados en este periodo</p>
							</div>
						</td>
					</tr>
				</ng-template>
			</p-table>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDowntimeDetails {
	public data = input.required<PartNumberDataProduction[]>();

	protected flattenedDowntimes = computed(() => {
		const result: FlattenedDowntimeDetail[] = [];
		this.data().forEach((part) => {
			if (part.downtimeRegisters) {
				part.downtimeRegisters.forEach((downtime) => {
					result.push({
						...downtime,
						partNumberName: part.partNumberName,
						modelName: part.modelName,
					});
				});
			}
		});
		return result.sort((a, b) => new Date(b.startDowntimeDatetime).getTime() - new Date(a.startDowntimeDatetime).getTime());
	});

	getDuration(start: string, end: string): number {
		const startDate = new Date(start);
		const endDate = new Date(end);
		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
		const diffMs = endDate.getTime() - startDate.getTime();
		return Math.round(diffMs / 60000);
	}
}
