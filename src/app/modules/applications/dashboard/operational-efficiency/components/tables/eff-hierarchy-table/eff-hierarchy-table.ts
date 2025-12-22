import { Component, computed, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { EfficiencyDetailRecord } from '../../eff-detail-modal/eff-detail-modal';

export interface EffLeaderNode {
	name: string;
	work: number;
	total: number;
	oper: number;
	records: EfficiencyDetailRecord[];
}
export interface EffSupervisorNode {
	name: string;
	area: string;
	work: number;
	total: number;
	oper: number;
	leaders: EffLeaderNode[];
	records: EfficiencyDetailRecord[];
}

@Component({
	selector: 'app-eff-hierarchy-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule, Charts],
	template: `
		<section class="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden flex flex-col h-full">
			<div class="p-4 bg-base-200/50 border-b border-base-300 flex flex-col gap-4">
				<div class="flex justify-between items-center">
					<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/60 italic">Hierarchy Performance / 役職別</h2>
					<div class="flex rounded border border-base-300 bg-base-100 p-1">
						<button
							(click)="viewMode.set('table')"
							[class.bg-[#002855]]="viewMode() === 'table'"
							[class.text-white]="viewMode() === 'table'"
							[class.text-base-content/60]="viewMode() !== 'table'"
							class="px-3 py-1 text-[9px] font-bold uppercase rounded transition-colors"
						>
							Table
						</button>
						<button
							(click)="viewMode.set('chart')"
							[class.bg-[#002855]]="viewMode() === 'chart'"
							[class.text-white]="viewMode() === 'chart'"
							[class.text-base-content/60]="viewMode() !== 'chart'"
							class="px-3 py-1 text-[9px] font-bold uppercase rounded transition-colors"
						>
							Chart
						</button>
					</div>
				</div>
				<input
					type="text"
					[ngModel]="searchText()"
					(ngModelChange)="searchText.set($event)"
					placeholder="Buscar Líder o Supervisor..."
					class="w-full px-3 py-1.5 text-xs border border-base-300 rounded-md focus:outline-none focus:border-primary bg-base-100 text-base-content"
				/>
			</div>

			<!-- Table View -->
			@if (viewMode() === 'table') {
				<div class="overflow-x-auto custom-scrollbar grow max-h-[400px]">
					<table class="w-full text-left text-xs border-collapse">
						<thead class="bg-base-100 border-b border-base-300 text-base-content/40 font-bold uppercase text-[9px] sticky top-0 z-10 shadow-sm">
							<tr>
								<th class="px-4 py-3 w-8"></th>
								<th class="px-4 py-3 cursor-pointer select-none hover:bg-base-50" (click)="toggleSort('leader')">
									Leader
									<span class="ml-1 opacity-40">⇅</span>
								</th>
								<th class="px-4 py-3 text-center cursor-pointer select-none hover:bg-base-50" (click)="toggleSort('oper')">
									Oper. %
									<span class="ml-1 opacity-40">⇅</span>
								</th>
								<th class="px-4 py-3 text-center">Action</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-base-200">
							@for (sup of sortedData(); track sup.name) {
								<!-- Supervisor Row -->
								<!-- Mostramos Leaders directamente asociados o el Supervisor como grouping-->
								<!-- La logica original muestra LEADER como fila principal y Supervisor debajo -->
								<!-- Ajustaremos la visualización para iterar sobre Leaders directamente si queremos la misma UX, 
									 pero basado en el modelo, tenemos Supervisor -> Leaders. 
									 Para replicar sample.html donde dice "Leader [Supervisor]",
									 vamos a aplanar la lista si el filtro es amplio, o usar el agrupamiento.
									 -->
								<!-- En sample.html la tabla itera sobre todos los REGISTROS unicos por Leader.
								     Aqui tenemos una jerarquia Supervisor -> Leader. 
									 Vamos a mostrar Supervisor como agrupador colapsable. -->
								
								<tr class="hover:bg-base-50 transition-colors bg-base-50/30">
									<td class="px-4 py-4 text-center cursor-pointer" (click)="toggleExpand(sup.name)">
										<svg
											class="h-3 w-3 transition-transform duration-200 text-base-content/40"
											[class.rotate-90]="isExpanded(sup.name)"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M9 5l7 7-7 7" stroke-width="3" />
										</svg>
									</td>
									<td class="px-4 py-4 font-bold uppercase text-base-content">
										{{ sup.name }}
										<div class="text-[9px] text-base-content/40 font-normal tracking-wider">SUPERVISOR</div>
									</td>
									<td class="px-4 py-4 text-center font-black" [class.text-emerald-600]="sup.oper >= 85" [class.text-amber-500]="sup.oper < 85">
										{{ sup.oper | number: '1.1-1' }}%
									</td>
									<td class="px-4 py-4 text-center">
										<button
											(click)="triggerDetail(sup.name, sup.records)"
											class="text-[9px] font-bold text-primary border border-primary/20 px-3 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
										>
											AUDIT
										</button>
									</td>
								</tr>

								@if (isExpanded(sup.name)) {
									@for (leader of sup.leaders; track leader.name) {
										<tr class="hover:bg-base-50 transition-colors border-l-4 border-l-primary/10">
											<td class="px-4 py-3"></td>
											<td class="px-4 py-3 font-semibold uppercase text-base-content/80 pl-8 text-[11px] flex flex-col">
												<span>{{ leader.name }}</span>
												<span class="text-[8px] text-base-content/30 tracking-widest">LEADER</span>
											</td>
											<td
												class="px-4 py-3 text-center font-bold text-[11px]"
												[class.text-emerald-600]="leader.oper >= 85"
												[class.text-amber-500]="leader.oper < 85"
											>
												{{ leader.oper | number: '1.1-1' }}%
											</td>
											<td class="px-4 py-3 text-center">
												<button
													(click)="triggerDetail(leader.name, leader.records)"
													class="text-[8px] font-bold text-base-content/60 bg-base-200 px-2 py-1 rounded hover:bg-base-300"
												>
													LOG
												</button>
											</td>
										</tr>
									}
								}
							}
						</tbody>
					</table>
				</div>
			}

			<!-- Chart View -->
			@if (viewMode() === 'chart') {
				<div class="p-4 grow flex flex-col">
					<chart [chartOptions]="hierarchyChartOptions()"></chart>
				</div>
			}
		</section>
	`,
	styles: [
		`
			.custom-scrollbar::-webkit-scrollbar {
				width: 4px;
				height: 4px;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb {
				background: #cbd5e1;
				border-radius: 10px;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffHierarchyTableComponent {
	private _data = signal<EffSupervisorNode[]>([]);
	@Input({ required: true }) set data(val: EffSupervisorNode[]) {
		this._data.set(val);
	}

	@Output() openDetail = new EventEmitter<{ title: string; records: EfficiencyDetailRecord[] }>();

	viewMode = signal<'table' | 'chart'>('table');
	searchText = signal('');
	sortField = signal<'leader' | 'oper'>('leader');
	sortOrder = signal<'asc' | 'desc'>('asc');
	expandedSupervisors = signal<Set<string>>(new Set());

	// Filtered & Sorted Logic
	sortedData = computed(() => {
		let items = this._data();
		const query = this.searchText().toLowerCase().trim();

		// Filter
		if (query) {
			items = items.filter((s) => s.name.toLowerCase().includes(query) || s.leaders.some((l) => l.name.toLowerCase().includes(query)));
		}

		// Sort
		const field = this.sortField();
		const order = this.sortOrder();

		return [...items].sort((a, b) => {
			let valA: any = field === 'leader' ? a.name : a.oper;
			let valB: any = field === 'leader' ? b.name : b.oper;

			if (valA < valB) return order === 'asc' ? -1 : 1;
			if (valA > valB) return order === 'asc' ? 1 : -1;
			return 0;
		});
	});

	hierarchyChartOptions = computed<ChartOptions>(() => {
		const data = this.sortedData();
		const categories: string[] = [];
		const seriesData: number[] = [];
		const colors: string[] = [];

		for (const sup of data) {
			categories.push(sup.name);
			seriesData.push(parseFloat(sup.oper.toFixed(1)));
			colors.push('#002855');

			// If expanded, show leaders? Or simply show all hierarchy flattened in chart?
			// Standard behavior based on sample.html seems to be leader focused, but let's stick to showing active view.
			// Let's iterate leaders for the chart if we want detail.
			// For now, let's keep it simple: Supervisors and Leaders flattened or just Supervisors?
			// The sample shows "Hierarchy Performance", implying flattened list.
			// Let's append leaders with indent.
			for (const lid of sup.leaders) {
				categories.push(`\u00A0\u00A0↳ ${lid.name}`);
				seriesData.push(parseFloat(lid.oper.toFixed(1)));
				colors.push('#7BB1FA');
			}
		}

		return {
			series: [{ name: 'Operativity %', data: seriesData }],
			chart: {
				type: 'bar',
				height: Math.max(400, categories.length * 30),
				toolbar: { show: false },
				animations: { enabled: false },
				fontFamily: 'Inter, sans-serif',
			},
			plotOptions: {
				bar: { horizontal: true, distributed: true, borderRadius: 2, barHeight: '70%', dataLabels: { position: 'right' } },
			},
			colors: colors,
			dataLabels: {
				enabled: true,
				textAnchor: 'start',
				formatter: (val: number) => val + '%',
				offsetX: 0,
				style: { fontSize: '11px', colors: ['#333'] },
			},
			xaxis: { max: 100, labels: { show: false } },
			yaxis: { labels: { show: true, style: { fontSize: '11px' } } },
			grid: { show: false },
			legend: { show: false },
			tooltip: { theme: 'light', y: { formatter: (val: number) => val + '%' } },
		} as any;
	});

	toggleSort(field: 'leader' | 'oper') {
		if (this.sortField() === field) {
			this.sortOrder.update((o) => (o === 'asc' ? 'desc' : 'asc'));
		} else {
			this.sortField.set(field);
			this.sortOrder.set('asc');
		}
	}

	toggleExpand(name: string) {
		const current = new Set(this.expandedSupervisors());
		if (current.has(name)) current.delete(name);
		else current.add(name);
		this.expandedSupervisors.set(current);
	}

	isExpanded(name: string): boolean {
		return this.expandedSupervisors().has(name);
	}

	triggerDetail(title: string, records: EfficiencyDetailRecord[]) {
		this.openDetail.emit({ title, records });
	}
}
