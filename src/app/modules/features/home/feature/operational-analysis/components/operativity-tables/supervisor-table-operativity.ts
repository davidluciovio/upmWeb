import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SupervisorOperativity } from '../../services/load-data';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { RippleModule } from 'primeng/ripple';

@Component({
	selector: 'app-supervisor-table-operativity',
	imports: [TableModule, CommonModule, FormsModule, Charts, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, RippleModule],
	template: `
		<section class="glass-effect overflow-hidden flex flex-col border border-slate-300 dark:border-slate-800 rounded-lg">
			<!-- Header with Search and Toggle -->
			<div class="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
						Análisis Jerárquico <span class="text-slate-400 font-normal">/ 役職別分析</span>
					</h2>

					<div class="flex items-center gap-2 p-1 bg-slate-300 dark:bg-slate-900 rounded-xl">
						<button
							(click)="viewMode.set('table')"
							[class.bg-slate-200]="viewMode() === 'table'"
							[class.dark:bg-slate-700]="viewMode() === 'table'"
							[class.shadow-sm]="viewMode() === 'table'"
							[class.text-sky-600]="viewMode() === 'table'"
							[class.text-slate-500]="viewMode() !== 'table'"
							class="px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all"
						>
							Tabla
						</button>
						<button
							(click)="viewMode.set('chart')"
							[class.bg-slate-200]="viewMode() === 'chart'"
							[class.dark:bg-slate-700]="viewMode() === 'chart'"
							[class.shadow-sm]="viewMode() === 'chart'"
							[class.text-sky-600]="viewMode() === 'chart'"
							[class.text-slate-500]="viewMode() !== 'chart'"
							class="px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all"
						>
							Gráfico
						</button>
					</div>
				</div>

				@if (viewMode() === 'table') {
					<p-iconfield iconPosition="left" class="w-full">
						<p-inputicon> <span class="material-symbols-outlined">search</span></p-inputicon>

						<input
							pInputText
							size="small"
							[ngModel]="searchText()"
							(ngModelChange)="searchText.set($event)"
							placeholder="Filtrar por supervisor o área..."
							class="w-full rounded-xl! bg-slate-100! dark:bg-slate-900/50! border-slate-200! dark:border-slate-800!"
						/>
					</p-iconfield>
				}
			</div>

			@if (viewMode() === 'table') {
				<div class="overflow-auto custom-scrollbar">
					<p-table [value]="filteredData()" dataKey="supervisor" [expandedRowKeys]="expandedRows()" scrollable scrollHeight="490px">
						<ng-template #header>
							<tr class="bg-surface-300/80 dark:bg-surface-900/50">
								<th class="bg-transparent!"></th>
								<th
									pSortableColumn="supervisor"
									class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4"
								>
									Supervisor <p-sortIcon field="supervisor"></p-sortIcon>
								</th>
								<th
									pSortableColumn="area"
									class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4"
									style="width: 25%"
								>
									Área <p-sortIcon field="area"></p-sortIcon>
								</th>
								<th
									pSortableColumn="operativity"
									class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4 text-center"
									style="width: 30%"
								>
									Operatividad <p-sortIcon field="operativity"></p-sortIcon>
								</th>
							</tr>
						</ng-template>

						<ng-template pTemplate="body" let-rowData let-expanded="expanded">
							<tr
								class="bg-transparent! border-b border-slate-100 dark:border-slate-800/50 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
							>
								<td class="bg-transparent!">
									<button type="button" pButton pRipple [pRowToggler]="rowData" class="p-button-text p-button-rounded p-button-plain p-button-sm">
										<span class="material-symbols-outlined transition-transform duration-200" [class.rotate-90]="expanded">chevron_right</span>
									</button>
								</td>
								<td class="py-4">
									<div class="flex flex-col">
										<span class="font-bold text-slate-700 dark:text-slate-200">{{ rowData.supervisor }}</span>
										<span class="text-[9px] uppercase tracking-tighter opacity-40 font-black">Cargo: Supervisor</span>
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
									<div class="flex flex-col items-center gap-1">
										<span
											class="font-black text-sm"
											[ngClass]="{
												'text-emerald-500': rowData.operativity >= 0.85,
												'text-amber-500': rowData.operativity >= 0.7 && rowData.operativity < 0.85,
												'text-red-500': rowData.operativity < 0.7,
											}"
										>
											{{ rowData.operativity | percent: '1.1-1' }}
										</span>
										<div class="w-20 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
											<div
												class="h-full transition-all duration-700"
												[style.width.%]="rowData.operativity * 100"
												[ngClass]="{
													'bg-emerald-500': rowData.operativity >= 0.85,
													'bg-amber-500': rowData.operativity >= 0.7 && rowData.operativity < 0.85,
													'bg-red-500': rowData.operativity < 0.7,
												}"
											></div>
										</div>
									</div>
								</td>
							</tr>
						</ng-template>

						<ng-template #expandedrow let-rowData>
							<tr
								class="bg-transparent! border-b border-slate-100 dark:border-slate-800/50 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
							>
								<td colspan="4" class="p-0 border-none bg-transparent!">
									<div class="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl border-l-4 border-l-sky-500/30">
										<h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">
											Líderes a cargo <span class="text-sky-400">/ 担当者</span>
										</h4>
										<p-table [value]="rowData.leaders" size="small" styleClass="p-datatable-sm" [tableStyle]="{ 'min-width': '100%' }">
											<ng-template #header>
												<tr class="bg-surface-50 dark:bg-surface-900">
													<th class="p-2 text-xs font-bold text-slate-500 uppercase">Líder</th>
													<th class="p-2 text-xs font-bold text-slate-500 uppercase text-right" pSortableColumn="operativity">
														Operatividad <p-sortIcon field="operativity"></p-sortIcon>
													</th>
												</tr>
											</ng-template>
											<ng-template #body let-leader>
												<tr class="border-b border-surface-200 dark:border-surface-700 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
													<td class="p-2">
														<div class="flex flex-col">
															<span class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{{ leader.leader }}</span>
															<span class="text-[9px] opacity-40 font-bold uppercase tracking-tighter">Leader</span>
														</div>
													</td>
													<td class="p-2">
														<div class="flex flex-col items-end gap-1">
															<span
																class="text-xs font-black"
																[class.text-emerald-500]="leader.operativity >= 0.85"
																[class.text-amber-500]="leader.operativity < 0.85"
															>
																{{ leader.operativity | percent: '1.1-1' }}
															</span>
															<div class="w-16 h-1 bg-slate-100 dark:bg-slate-900 rounded-full">
																<div
																	class="h-full rounded-full"
																	[style.width.%]="leader.operativity * 100"
																	[class.bg-emerald-500]="leader.operativity >= 0.85"
																	[class.bg-amber-500]="leader.operativity < 0.85"
																></div>
															</div>
														</div>
													</td>
												</tr>
											</ng-template>
											<ng-template #emptymessage>
												<tr>
													<td colspan="2" class="p-2 text-center text-xs text-slate-400 italic">No hay líderes asignados.</td>
												</tr>
											</ng-template>
										</p-table>
									</div>
								</td>
							</tr>
						</ng-template>

						<ng-template pTemplate="emptymessage">
							<tr>
								<td colspan="4" class="text-center py-12">
									<div class="flex flex-col items-center gap-2 opacity-30">
										<span class="material-symbols-outlined text-4xl">search_off</span>
										<p class="text-xs font-bold uppercase">No se encontraron resultados</p>
									</div>
								</td>
							</tr>
						</ng-template>
					</p-table>
				</div>
			}

			<!-- Chart View -->
			@if (viewMode() === 'chart') {
				<div class="p-6 grow flex flex-col justify-center animate-fade-in">
					<chart [chartOptions]="hierarchyChartOptions()"></chart>
				</div>
			}
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorTableOperativity {
	public supervisorData = input.required<SupervisorOperativity[]>();

	viewMode = signal<'table' | 'chart'>('table');
	searchText = signal('');
	expandedRows = signal<Record<string, boolean>>({});

	filteredData = computed(() => {
		const data = [...this.supervisorData()].sort((a, b) => a.operativity - b.operativity);
		const query = this.searchText().toLowerCase().trim();

		if (!query) return data;

		return data.filter(
			(s) =>
				s.supervisor.toLowerCase().includes(query) ||
				s.area.toLowerCase().includes(query) ||
				s.leaders.some((l: any) => l.leader.toLowerCase().includes(query)),
		);
	});

	hierarchyChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		const categories: string[] = [];
		const seriesData: number[] = [];
		const colors: string[] = [];

		const SUPERVISOR_COLOR = '#4f46e5'; // sky 600
		const LEADER_COLOR = '#818cf8'; // sky 400

		for (const sup of data) {
			categories.push(sup.supervisor);
			seriesData.push(parseFloat((sup.operativity * 100).toFixed(1)));
			colors.push(SUPERVISOR_COLOR);

			for (const lid of sup.leaders) {
				categories.push(`\u00A0\u00A0\u00A0↳ ${lid.leader}`);
				seriesData.push(parseFloat((lid.operativity * 100).toFixed(1)));
				colors.push(LEADER_COLOR);
			}
		}

		return {
			series: [{ name: 'Operatividad %', data: seriesData }],
			chart: {
				type: 'bar',
				height: Math.max(450, categories.length * 35),
				toolbar: { show: false },
				animations: { enabled: true, speed: 800 },
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
			},
			plotOptions: {
				bar: {
					horizontal: true,
					distributed: true,
					borderRadius: 4,
					barHeight: '70%',
					dataLabels: { position: 'top' },
				},
			},
			colors: colors,
			dataLabels: {
				enabled: true,
				formatter: (val: number) => val + '%',
				style: { fontSize: '10px', fontWeight: '900', colors: ['#6366f1'] },
				offsetX: 30,
			},
			xaxis: {
				categories: categories,
				max: 100,
				labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: '700' } },
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				labels: {
					show: true,
					style: {
						fontSize: '11px',
						fontWeight: '700',
						colors: '#475569',
					},
				},
			},
			grid: {
				borderColor: 'rgba(226, 232, 240, 0.1)',
				xaxis: { lines: { show: true } },
				yaxis: { lines: { show: false } },
			},
			legend: { show: false },
			tooltip: {
				theme: 'dark',
				y: { formatter: (val: number) => val + '%' },
			},
		} as any;
	});

	constructor() {}
}
