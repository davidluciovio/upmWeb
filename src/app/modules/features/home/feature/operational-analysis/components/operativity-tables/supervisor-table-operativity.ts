import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Managment, Jefe, Supervisor, Leader } from '../../services/load-data';
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
	standalone: true,
	imports: [TableModule, CommonModule, FormsModule, Charts, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, RippleModule],
	template: `
		<section class="glass-effect overflow-hidden flex flex-col border border-slate-300 dark:border-slate-800 rounded-lg shadow-xl">
			<!-- Header -->
			<div class="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
							<span class="material-symbols-outlined">account_tree</span>
						</div>
						<div>
							<h2 class="text-lg font-black text-slate-800 dark:text-slate-100 italic uppercase tracking-tighter leading-none">Análisis Jerárquico</h2>
							<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gerencia / Jefe / Supervisor / Líder</p>
						</div>
					</div>

					<div
						class="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
					>
						<button
							(click)="viewMode.set('table')"
							[class]="viewMode() === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'"
							class="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all"
						>
							Tabla
						</button>
						<button
							(click)="viewMode.set('chart')"
							[class]="viewMode() === 'chart' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'"
							class="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all"
						>
							Gráfico
						</button>
					</div>
				</div>

				@if (viewMode() === 'table') {
					<p-iconfield iconPosition="left" class="w-full">
						<p-inputicon> <span class="material-symbols-outlined text-sm">search</span></p-inputicon>
						<input
							pInputText
							size="small"
							[ngModel]="searchText()"
							(ngModelChange)="searchText.set($event)"
							placeholder="Filtrar por nombre o área..."
							class="w-full rounded-xl! bg-white/50! dark:bg-slate-900/50! border-slate-200! dark:border-slate-800! text-xs"
						/>
					</p-iconfield>
				}
			</div>

			@if (viewMode() === 'table') {
				<div class="overflow-auto custom-scrollbar">
					<!-- DataKey is crucial for row expansion. Using _id ensures uniqueness. -->
					<p-table
						[value]="filteredData()"
						dataKey="_id"
						[scrollable]="true"
						scrollHeight="500px"
						styleClass="p-datatable-sm overflow-hidden"
						rowExpandMode="single"
					>
						<ng-template pTemplate="header">
							<tr class="bg-slate-50 dark:bg-slate-900/80">
								<th class="w-12 bg-transparent!"></th>
								<th
									pSortableColumn="managment"
									class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-widest py-3"
								>
									Gerencia <p-sortIcon field="managment"></p-sortIcon>
								</th>
								<th class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-widest py-3">Área</th>
								<th
									pSortableColumn="operativity"
									class="bg-transparent! text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-widest py-3 text-center"
								>
									Operatividad <p-sortIcon field="operativity"></p-sortIcon>
								</th>
							</tr>
						</ng-template>

						<ng-template pTemplate="body" let-man let-expanded="expanded">
							<tr class="bg-transparent! border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
								<td class="bg-transparent!">
									<!-- Simple Clickable Button for Toggling -->
									<button
										type="button"
										pButton
										pRipple
										[pRowToggler]="man"
										class="p-button-text p-button-rounded p-button-plain p-button-sm w-8 h-8 flex items-center justify-center p-0"
									>
										<span class="material-symbols-outlined text-sm transition-transform duration-200" [class.rotate-90]="expanded">chevron_right</span>
									</button>
								</td>
								<td class="py-3">
									<div class="flex flex-col">
										<span class="font-bold text-slate-800 dark:text-slate-100 uppercase text-xs">{{ man.managment }}</span>
										<span class="text-[8px] uppercase tracking-tighter text-indigo-500 font-black">Niv 1: Gerencia</span>
									</div>
								</td>
								<td class="py-3">
									<span
										class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700"
									>
										{{ man.area }}
									</span>
								</td>
								<td class="py-3">
									<ng-container *ngTemplateOutlet="operativityCell; context: { $implicit: man.operativity }"></ng-container>
								</td>
							</tr>
						</ng-template>

						<ng-template pTemplate="rowexpansion" let-man>
							<tr>
								<td colspan="4" class="p-0 border-none bg-slate-50/20 dark:bg-slate-900/50">
									<div class="pl-12 py-2 pr-4 bg-indigo-50/10 dark:bg-indigo-900/5 border-l-2 border-indigo-500/20">
										<p-table
											[value]="man.jefes"
											dataKey="_id"
											styleClass="p-datatable-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50"
										>
											<ng-template pTemplate="header">
												<tr class="bg-slate-100/50 dark:bg-slate-800">
													<th class="w-10"></th>
													<th class="text-[9px] font-black uppercase tracking-widest text-slate-500 py-1.5 pl-2">Jefe de Turno</th>
													<th class="text-[9px] font-black uppercase tracking-widest text-slate-500 py-1.5 text-center">Operatividad</th>
												</tr>
											</ng-template>
											<ng-template pTemplate="body" let-jefe let-jExpanded="expanded">
												<tr class="hover:bg-white/50 dark:hover:bg-slate-800/80">
													<td>
														<button
															type="button"
															pButton
															pRipple
															[pRowToggler]="jefe"
															class="p-button-text p-button-rounded p-button-plain p-button-sm w-7 h-7 flex items-center justify-center p-0"
														>
															<span class="material-symbols-outlined text-[16px] transition-transform duration-200" [class.rotate-90]="jExpanded"
																>chevron_right</span
															>
														</button>
													</td>
													<td class="pl-2">
														<div class="flex flex-col">
															<span class="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase">{{ jefe.jefe }}</span>
															<span class="text-[7px] uppercase tracking-tighter text-emerald-500 font-black">Niv 2: Jefe</span>
														</div>
													</td>
													<td>
														<ng-container *ngTemplateOutlet="operativityCell; context: { $implicit: jefe.operativity, small: true }"></ng-container>
													</td>
												</tr>
											</ng-template>
											<ng-template pTemplate="rowexpansion" let-jefe>
												<tr>
													<td colspan="3" class="p-0 border-none">
														<div class="pl-10 py-1 bg-emerald-50/5 dark:bg-emerald-900/5 border-l border-emerald-500/20">
															<p-table [value]="jefe.supervisors" dataKey="_id" styleClass="p-datatable-sm border-none">
																<ng-template pTemplate="body" let-sup let-supExpanded="expanded">
																	<tr class="hover:bg-white/50 dark:hover:bg-slate-800/50">
																		<td class="w-8">
																			<button
																				type="button"
																				pButton
																				pRipple
																				[pRowToggler]="sup"
																				class="p-button-text p-button-rounded p-button-plain p-button-sm w-6 h-6 flex items-center justify-center p-0"
																			>
																				<span class="material-symbols-outlined text-[14px] transition-transform duration-200" [class.rotate-90]="supExpanded"
																					>chevron_right</span
																				>
																			</button>
																		</td>
																		<td>
																			<div class="flex flex-col">
																				<span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{{ sup.supervisor }}</span>
																				<span class="text-[7px] uppercase tracking-tighter text-sky-500 font-black">Niv 3: Supervisor</span>
																			</div>
																		</td>
																		<td>
																			<ng-container *ngTemplateOutlet="operativityCell; context: { $implicit: sup.operativity, small: true }"></ng-container>
																		</td>
																	</tr>
																</ng-template>
																<ng-template pTemplate="rowexpansion" let-sup>
																	<tr>
																		<td colspan="3" class="p-0 border-none">
																			<div class="pl-8 py-1 bg-sky-50/5 dark:bg-sky-900/5 border-l border-sky-500/20">
																				<p-table [value]="sup.leaders" dataKey="_id" styleClass="p-datatable-sm">
																					<ng-template pTemplate="body" let-leader>
																						<tr class="border-none">
																							<td class="py-1">
																								<div class="flex flex-col">
																									<span class="text-[9px] font-bold text-slate-500 dark:text-slate-400 italic uppercase">{{ leader.leader }}</span>
																									<span class="text-[6px] uppercase tracking-tighter text-slate-400">Nivel 4: Líder</span>
																								</div>
																							</td>
																							<td>
																								<ng-container *ngTemplateOutlet="operativityCell; context: { $implicit: leader.operativity, small: true }"></ng-container>
																							</td>
																						</tr>
																					</ng-template>
																				</p-table>
																			</div>
																		</td>
																	</tr>
																</ng-template>
															</p-table>
														</div>
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
								<td colspan="4" class="text-center py-12">
									<div class="flex flex-col items-center gap-2 opacity-30">
										<span class="material-symbols-outlined text-4xl text-slate-400">search_off</span>
										<p class="text-xs font-bold uppercase text-slate-400 tracking-widest">No se encontraron resultados</p>
									</div>
								</td>
							</tr>
						</ng-template>
					</p-table>
				</div>
			}

			<ng-template #operativityCell let-val let-small="small">
				<div class="flex flex-col items-center gap-0.5">
					<span
						class="font-black"
						[class.text-[9px]]="small"
						[class.text-xs]="!small"
						[ngClass]="{
							'text-emerald-500': val >= 0.85,
							'text-amber-500': val >= 0.7 && val < 0.85,
							'text-red-500': val < 0.7,
						}"
					>
						{{ val | percent: '1.0-1' }}
					</span>
					<div
						[class]="small ? 'w-12 h-0.5' : 'w-16 h-1'"
						class="bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800"
					>
						<div
							class="h-full transition-all duration-1000 ease-out"
							[style.width.%]="val * 100"
							[ngClass]="{
								'bg-emerald-500': val >= 0.85,
								'bg-amber-500': val >= 0.7 && val < 0.85,
								'bg-red-500': val < 0.7,
							}"
						></div>
					</div>
				</div>
			</ng-template>

			<!-- Chart View -->
			@if (viewMode() === 'chart') {
				<div class="p-6 grow flex flex-col justify-center animate-fade-in bg-white/30 dark:bg-slate-900/30">
					<chart [chartOptions]="hierarchyChartOptions()"></chart>
				</div>
			}
		</section>
	`,
	styles: [
		`
			:host ::ng-deep {
				.p-datatable-sm .p-datatable-thead > tr > th {
					padding: 0.5rem;
				}
				.p-datatable-sm .p-datatable-tbody > tr > td {
					padding: 0.25rem 0.5rem;
					border: none;
				}
				.p-datatable .p-sortable-column:focus {
					box-shadow: none;
					outline: none;
				}
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorTableOperativity {
	public managmentDataOriginal = input.required<Managment[]>({ alias: 'supervisorData' });

	// Add unique IDs recursively to all levels to ensure stable expansion state
	managmentData = computed(() => {
		const addIds = (items: any[], prefix: string): any[] => {
			if (!items) return [];
			return items.map((item, idx) => {
				const uniqueId = `${prefix}_${idx}`;
				const newItem = { ...item, _id: uniqueId };

				if (item.jefes) newItem.jefes = addIds(item.jefes, uniqueId + '_j');
				if (item.supervisors) newItem.supervisors = addIds(item.supervisors, uniqueId + '_s');
				if (item.leaders) newItem.leaders = addIds(item.leaders, uniqueId + '_l');

				return newItem;
			});
		};

		return addIds(this.managmentDataOriginal(), 'root');
	});

	viewMode = signal<'table' | 'chart'>('table');
	searchText = signal('');

	filteredData = computed(() => {
		const data = [...this.managmentData()].sort((a, b) => b.operativity - a.operativity);
		const query = this.searchText().toLowerCase().trim();

		if (!query) return data;

		return data.filter(
			(m) =>
				m.managment.toLowerCase().includes(query) ||
				m.area.toLowerCase().includes(query) ||
				m.jefes.some(
					(j: any) =>
						j.jefe.toLowerCase().includes(query) ||
						j.supervisors.some(
							(s: any) => s.supervisor.toLowerCase().includes(query) || s.leaders.some((l: any) => l.leader.toLowerCase().includes(query)),
						),
				),
		);
	});

	hierarchyChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		const categories: string[] = [];
		const seriesData: number[] = [];
		const colors: string[] = [];

		const COLORS = {
			MANAGMENT: '#4f46e5', // Indigo 600
			JEFE: '#10b981', // Emerald 500
			SUPERVISOR: '#0ea5e9', // Sky 500
			LEADER: '#64748b', // Slate 500
		};

		data.forEach((m) => {
			categories.push(m.managment);
			seriesData.push(parseFloat((m.operativity * 100).toFixed(1)));
			colors.push(COLORS.MANAGMENT);

			m.jefes.forEach((j: any) => {
				categories.push(`\u00A0\u00A0↳ ${j.jefe}`);
				seriesData.push(parseFloat((j.operativity * 100).toFixed(1)));
				colors.push(COLORS.JEFE);

				j.supervisors.forEach((s: any) => {
					categories.push(`\u00A0\u00A0\u00A0\u00A0↳ ${s.supervisor}`);
					seriesData.push(parseFloat((s.operativity * 100).toFixed(1)));
					colors.push(COLORS.SUPERVISOR);
				});
			});
		});

		return {
			series: [{ name: 'Operatividad %', data: seriesData }],
			chart: {
				type: 'bar',
				height: Math.max(500, categories.length * 28),
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
				style: { fontSize: '9px', fontWeight: '900', colors: ['#475569'] },
				offsetX: 25,
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
						fontSize: '9px',
						fontWeight: '700',
						colors: '#64748b',
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
}
