import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Managment } from '../../services/load-data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-supervisor-table-operativity',
	standalone: true,
	imports: [CommonModule, FormsModule, Charts, InputTextModule, IconFieldModule, InputIconModule, TooltipModule, ButtonModule],
	template: `
		<section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
							<span class="material-symbols-outlined">account_tree</span>
						</div>
						<div>
							<h2 class="text-lg font-black text-slate-800 dark:text-slate-100 italic uppercase tracking-tighter leading-none">Análisis Jerárquico</h2>
							<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Vista de Tarjetas Expandibles</p>
						</div>
					</div>

					<div
						class="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
					>
						<button
							(click)="viewMode.set('list')"
							[class]="viewMode() === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'"
							class="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all"
						>
							Lista
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

				@if (viewMode() === 'list') {
					<p-iconfield iconPosition="left" class="w-full">
						<p-inputicon> <span class="material-symbols-outlined text-sm">search</span></p-inputicon>
						<input
							pInputText
							size="small"
							[ngModel]="searchText()"
							(ngModelChange)="searchText.set($event)"
							placeholder="Filtrar por nombre, área..."
							class="w-full rounded-xl! bg-white/50! dark:bg-slate-900/50! border-slate-200! dark:border-slate-800! text-xs"
						/>
					</p-iconfield>
				}
			</div>

			<!-- List View (Custom Expansion) -->
			@if (viewMode() === 'list') {
				<div class="overflow-y-auto custom-scrollbar h-fit p-4 flex flex-col gap-3 bg-slate-50/30 dark:bg-slate-900/10">
					@for (man of filteredData(); track man._id) {
						<!-- LEVEL 1: GERENCIA -->
						<div
							class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50/50 dark:bg-slate-800/50 transition-all duration-200 hover:shadow-md"
						>
							<div
								(click)="toggle(man._id)"
								class="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
							>
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
										<span class="material-symbols-outlined text-sm">domain</span>
									</div>
									<div class="flex flex-col">
										<span class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{{ man.managment }}</span>
										<span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{{ man.area }}</span>
									</div>
								</div>

								<div class="flex items-center gap-4">
									<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: man.operativity }"></ng-container>
									<p-button
										(click)="onViewDaily($event, man, 'gerencia')"
										severity="secondary"
										label="Detalle"
										size="small"
										pTooltip="Ver detalle diario"
										tooltipPosition="bottom"
									></p-button>
									<span class="material-symbols-outlined text-slate-400 text-lg transition-transform duration-300" [class.rotate-90]="isExpanded(man._id)">
										chevron_right
									</span>
								</div>
							</div>

							<!-- Level 1 Body -->
							@if (isExpanded(man._id)) {
								<div
									class="bg-indigo-50/30 dark:bg-indigo-900/5 border-t border-slate-100 dark:border-slate-700/50 p-2 pl-4 md:pl-8 flex flex-col gap-2 animate-fade-in-down"
								>
									@for (jefe of man.jefes; track jefe._id) {
										<!-- LEVEL 2: JEFE -->
										<div class="rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 overflow-hidden">
											<div
												(click)="toggle(jefe._id)"
												class="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
											>
												<div class="flex items-center gap-3">
													<div
														class="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
													>
														<span class="material-symbols-outlined text-xs">person</span>
													</div>
													<div class="flex flex-col">
														<span class="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase">{{ jefe.jefe }}</span>
														<span class="text-[8px] uppercase tracking-wider text-emerald-500 font-bold">Jefe de Turno</span>
													</div>
												</div>
												<div class="flex items-center gap-3">
													<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: jefe.operativity, small: true }"></ng-container>
													<p-button
														(click)="onViewDaily($event, jefe, 'jefe')"
														severity="secondary"
														label="Detalle"
														size="small"
														pTooltip="Ver detalle diario"
														tooltipPosition="bottom"
													></p-button>
													<span
														class="material-symbols-outlined text-slate-400 text-sm transition-transform duration-300"
														[class.rotate-90]="isExpanded(jefe._id)"
													>
														chevron_right
													</span>
												</div>
											</div>

											<!-- Level 2 Body -->
											@if (isExpanded(jefe._id)) {
												<div
													class="bg-emerald-50/30 dark:bg-emerald-900/5 border-t border-slate-100 dark:border-slate-700/30 p-2 pl-4 md:pl-8 flex flex-col gap-2 animate-fade-in-down"
												>
													@for (sup of jefe.supervisors; track sup._id) {
														<!-- LEVEL 3: SUPERVISOR -->
														<div class="rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/50 overflow-hidden">
															<div
																(click)="toggle(sup._id)"
																class="p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
															>
																<div class="flex items-center gap-3">
																	<div class="w-1.5 h-6 rounded-full bg-sky-400"></div>
																	<div class="flex flex-col">
																		<span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">{{ sup.supervisor }}</span>
																		<span class="text-[7px] uppercase tracking-wider text-sky-500 font-bold">Supervisor</span>
																	</div>
																</div>
																<div class="flex items-center gap-3">
																	<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: sup.operativity, small: true }"></ng-container>
																	<p-button
																		(click)="onViewDaily($event, sup, 'supervisor')"
																		severity="secondary"
																		label="Detalle"
																		size="small"
																		pTooltip="Ver detalle diario"
																		tooltipPosition="bottom"
																	></p-button>
																	<span
																		class="material-symbols-outlined text-slate-400 text-xs transition-transform duration-300"
																		[class.rotate-90]="isExpanded(sup._id)"
																	>
																		chevron_right
																	</span>
																</div>
															</div>

															<!-- Level 3 Body -->
															@if (isExpanded(sup._id)) {
																<div
																	class="bg-sky-50/30 dark:bg-sky-900/5 border-t border-slate-100 dark:border-slate-700/30 p-2 pl-4 flex flex-col gap-1.5 animate-fade-in-down"
																>
																	@for (leader of sup.leaders; track leader._id) {
																		<!-- LEVEL 4: LEADER -->
																		<div
																			class="flex items-center justify-between p-2 rounded-md bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors"
																		>
																			<div class="flex items-center gap-2">
																				<div class="w-1 h-1 rounded-full bg-slate-400"></div>
																				<span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase italic">{{ leader.leader }}</span>
																			</div>
																			<div class="flex items-center gap-2">
																				<ng-container *ngTemplateOutlet="operativityPercent; context: { $implicit: leader.operativity }"></ng-container>
																				<p-button
																					(click)="onViewDaily($event, leader, 'leader')"
																					severity="secondary"
																					label="Detalle"
																					size="small"
																					pTooltip="Ver detalle diario"
																					tooltipPosition="bottom"
																				></p-button>
																			</div>
																		</div>
																	} @empty {
																		<div class="p-2 text-center text-[9px] text-slate-400 italic">Sin líderes asignados</div>
																	}
																</div>
															}
														</div>
													} @empty {
														<div class="p-2 text-center text-[10px] text-slate-400 italic">Sin supervisores asignados</div>
													}
												</div>
											}
										</div>
									} @empty {
										<div class="p-2 text-center text-[10px] text-slate-400 italic">Sin jefes de turno asignados</div>
									}
								</div>
							}
						</div>
					} @empty {
						<div class="flex flex-col items-center justify-center py-20 opacity-50">
							<span class="material-symbols-outlined text-4xl text-slate-300">search_off</span>
							<p class="text-sm font-bold text-slate-400 mt-2">No se encontraron resultados</p>
						</div>
					}
				</div>
			}

			<!-- Chart View -->
			@if (viewMode() === 'chart') {
				<div class="p-6 grow flex flex-col justify-center animate-fade-in bg-white/30 dark:bg-slate-900/30 min-h-[500px]">
					<chart [chartOptions]="hierarchyChartOptions()"></chart>
				</div>
			}
		</section>

		<!-- TEMPLATES -->
		<ng-template #operativityBadge let-val let-small="small">
			<div
				class="px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1.5"
				[style.background-color]="val >= 0.85 ? '#f0fdf4' : val >= 0.7 ? '#fffbeb' : '#fef2f2'"
				[style.border-color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'"
				[style.color]="val >= 0.85 ? '#065f46' : val >= 0.7 ? '#92400e' : '#991b1b'"
			>
				<div
					class="rounded-full"
					[class]="small ? 'w-1.5 h-1.5' : 'w-2 h-2'"
					[style.background-color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'"
				></div>
				<span class="font-black" [class]="small ? 'text-[10px]' : 'text-sm'">{{ val | percent: '1.2-2' }}</span>
			</div>
		</ng-template>

		<ng-template #operativityPercent let-val>
			<span class="text-[12px] font-black" [style.color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'">
				{{ val | percent: '1.2-2' }}
			</span>
		</ng-template>
	`,
	styles: [
		`
			.animate-fade-in-down {
				animation: fadeInDown 0.2s ease-out;
			}
			@keyframes fadeInDown {
				from {
					opacity: 0;
					transform: translateY(-5px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorTableOperativity {
	public managmentDataOriginal = input.required<Managment[]>({ alias: 'supervisorData' });
	public viewDailyDetail = output<{ item: any; type: string }>();

	// Manage expansion state manually
	private expandedItems = signal<Set<string>>(new Set());

	// Add unique IDs recursively to all levels to ensure stable expansion state
	managmentData = computed(() => {
		const addIds = (items: any[], prefix: string): any[] => {
			if (!items) return [];
			return items.map((item, idx) => {
				const uniqueId = item._id || `${prefix}_${idx}`; // Keep existing or create new
				const newItem = { ...item, _id: uniqueId };

				if (item.jefes) newItem.jefes = addIds(item.jefes, uniqueId + '_j');
				if (item.supervisors) newItem.supervisors = addIds(item.supervisors, uniqueId + '_s');
				if (item.leaders) newItem.leaders = addIds(item.leaders, uniqueId + '_l');

				return newItem;
			});
		};

		return addIds(this.managmentDataOriginal(), 'root');
	});

	viewMode = signal<'list' | 'chart'>('list');
	searchText = signal('');

	filteredData = computed(() => {
		const data = [...this.managmentData()].sort((a, b) => b.operativity - a.operativity);
		const query = this.searchText().toLowerCase().trim();

		if (!query) return data;

		// Deep filter
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

	toggle(id: string) {
		const current = new Set(this.expandedItems());
		if (current.has(id)) {
			current.delete(id);
		} else {
			current.add(id);
		}
		this.expandedItems.set(current);
	}

	onViewDaily(event: Event, item: any, type: string) {
		event.stopPropagation();
		this.viewDailyDetail.emit({ item, type });
		console.log('View daily for', item, type);
	}

	isExpanded(id: string): boolean {
		return this.expandedItems().has(id);
	}

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
