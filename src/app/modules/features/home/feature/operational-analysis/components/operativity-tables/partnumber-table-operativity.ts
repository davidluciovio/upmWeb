import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PartNumberOperativity } from '../../services/load-data';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
	selector: 'app-partnumber-table-operativity',
	imports: [TableModule, CommonModule, FormsModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule],
	template: `
		<section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-sm">
			<!-- Header with Search -->
			<div class="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
						Eficiencia por No. de Parte <span class="text-slate-400 font-normal">/ 品番別効率</span>
					</h2>
					<span class="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
						>{{ filteredData().length }} Elementos</span
					>
				</div>

				<p-iconfield iconPosition="left" class="w-full">
					<p-inputicon> <span class="material-symbols-outlined">search</span></p-inputicon>

					<input
						pInputText
						size="small"
						[ngModel]="searchText()"
						(ngModelChange)="searchText.set($event)"
						placeholder="Buscar 品番 / No. de Parte..."
						class="w-full rounded-xl! bg-slate-100! dark:bg-slate-900/50! border-slate-200! dark:border-slate-800!"
					/>
				</p-iconfield>
			</div>

			<!-- Table View -->
			<div class="overflow-auto ">
				<p-table [value]="filteredData()" [rowHover]="true" size="small" dataKey="partNumber" scrollable scrollHeight="495px">
					<ng-template #header>
						<tr class="bg-surface-300/80 dark:bg-surface-900/50">
							<th
								pSortableColumn="partNumber"
								class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4"
							>
								No. de Parte <p-sortIcon field="partNumber"></p-sortIcon>
							</th>
							<th pSortableColumn="area" class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4">
								Área <p-sortIcon field="area"></p-sortIcon>
							</th>
							<th
								pSortableColumn="supervisor"
								class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4"
							>
								Supervisor <p-sortIcon field="supervisor"></p-sortIcon>
							</th>
							<th pSortableColumn="leader" class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4">
								Líder <p-sortIcon field="leader"></p-sortIcon>
							</th>
							<th
								pSortableColumn="operativity"
								class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4 text-center"
								style="width: 150px"
							>
								Oper. % <p-sortIcon field="operativity"></p-sortIcon>
							</th>
							<th class="bg-transparent! w-12"></th>
						</tr>
					</ng-template>

					<ng-template pTemplate="body" let-rowData>
						<tr
							class="bg-transparent! border-b border-slate-100 dark:border-slate-800/50 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
						>
							<td class="py-4">
								<div class="flex items-center gap-2">
									<div class="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">PN</div>
									<span class="font-bold font-mono text-slate-700 dark:text-slate-200">{{ rowData.partNumber }}</span>
								</div>
							</td>
							<td class="py-4">
								<span
									class="px-3 py-1 bg-surface-200 dark:bg-surface-900/30 text-surface-600 dark:text-surface-400 rounded-full text-[10px] font-bold uppercase"
								>
									{{ rowData.area }}
								</span>
							</td>
							<td class="py-4">
								<div class="flex flex-col">
									<span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ rowData.supervisor }}</span>
								</div>
							</td>
							<td class="py-4">
								<div class="flex flex-col">
									<span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ rowData.leader }}</span>
								</div>
							</td>
							<td class="py-4">
								<div class="flex flex-col items-center gap-1">
									<span
										class="font-black text-base"
										[style.color]="rowData.operativity >= 0.85 ? '#10b981' : rowData.operativity >= 0.7 ? '#f59e0b' : '#ef4444'"
									>
										{{ rowData.operativity | percent: '1.2-2' }}
									</span>
									<div class="w-20 h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
										<div
											class="h-full transition-all duration-700"
											[style.width.%]="rowData.operativity * 100"
											[style.background-color]="rowData.operativity >= 0.85 ? '#10b981' : rowData.operativity >= 0.7 ? '#f59e0b' : '#ef4444'"
										></div>
									</div>
								</div>
							</td>
							<td class="py-4 text-center">
								<p-button
									label="Detalle"
									[text]="true"
									[rounded]="true"
									severity="secondary"
									size="small"
									(onClick)="openDetail.emit(rowData.partNumber)"
								></p-button>
							</td>
						</tr>
					</ng-template>

					<ng-template pTemplate="emptymessage">
						<tr>
							<td colspan="5" class="text-center py-12">
								<div class="flex flex-col items-center gap-2 opacity-30">
									<span class="material-symbols-outlined text-4xl">search_off</span>
									<p class="text-xs font-bold uppercase">No se encontraron resultados</p>
								</div>
							</td>
						</tr>
					</ng-template>
				</p-table>
			</div>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnumberTableOperativity {
	public partnumberData = input.required<PartNumberOperativity[]>();
	public openDetail = output<string>();
	searchText = signal('');

	filteredData = computed<PartNumberOperativity[]>(() => {
		const data = [...this.partnumberData()].sort((a, b) => a.operativity - b.operativity);
		const query = this.searchText().toLowerCase().trim();

		if (!query) return data;

		return data.filter(
			(p) =>
				p.partNumber.toLowerCase().includes(query) ||
				p.area.toLowerCase().includes(query) ||
				p.supervisor.toLowerCase().includes(query) ||
				p.leader.toLowerCase().includes(query),
		);
	});
}
