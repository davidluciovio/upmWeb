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

import { LanguageService } from '../../services/language.service';
import { inject } from '@angular/core';

@Component({
	selector: 'app-supervisor-table-operativity',
	standalone: true,
	imports: [CommonModule, FormsModule, Charts, InputTextModule, IconFieldModule, InputIconModule, TooltipModule, ButtonModule],
	template: `
		<section class="supervisor-analysis-section">
			<!-- Header -->
			<div class="supervisor-header">
				<div class="header-main-row">
					<div class="header-info-group">
						<div class="header-icon-box">
							<span class="material-symbols-outlined">account_tree</span>
						</div>
						<div class="header-text-group">
							<h2 class="header-title">{{ langService.translateDual('hierarchicalAnalysis') }}</h2>
							<p class="header-subtitle">{{ langService.translateDual('expandableCardsView') }}</p>
						</div>
					</div>

					<div class="view-mode-selector">
						<button (click)="viewMode.set('list')" class="view-mode-btn" [class.active]="viewMode() === 'list'">
							{{ langService.translateDual('list') }}
						</button>
						<button (click)="viewMode.set('chart')" class="view-mode-btn" [class.active]="viewMode() === 'chart'">
							{{ langService.translateDual('chart') }}
						</button>
					</div>
				</div>

				@if (viewMode() === 'list') {
					<div class="search-container">
						<p-iconfield iconPosition="left" class="width-full">
							<p-inputicon> <span class="material-symbols-outlined text-sm">search</span></p-inputicon>
							<input
								pInputText
								size="small"
								[ngModel]="searchText()"
								(ngModelChange)="searchText.set($event)"
								[placeholder]="langService.translateDual('filterPlaceholder')"
								class="search-input"
							/>
						</p-iconfield>
					</div>
				}
			</div>

			<!-- List View -->
			@if (viewMode() === 'list') {
				<div class="list-view-container custom-scrollbar">
					@for (man of filteredData(); track man._id) {
						<!-- LEVEL 1: GERENCIA -->
						<div class="level-card level-1-card">
							<div (click)="toggle(man._id)" class="level-header level-1-header">
								<div class="header-content">
									<div class="level-avatar level-1-avatar">
										<span class="material-symbols-outlined icon-sm">domain</span>
									</div>
									<div class="text-group">
										<span class="title-primary">{{ man.managment }}</span>
										<span class="subtitle-secondary">{{ man.area }}</span>
									</div>
								</div>

								<div class="actions-group">
									<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: man.operativity }"></ng-container>
									<p-button
										(click)="onViewDaily($event, man, 'gerencia')"
										severity="secondary"
										[label]="langService.translateDual('detail')"
										size="small"
										class="detail-btn"
									></p-button>
									<span class="material-symbols-outlined expand-icon" [class.expanded]="isExpanded(man._id)"> chevron_right </span>
								</div>
							</div>

							<!-- Level 1 Body -->
							@if (isExpanded(man._id)) {
								<div class="level-body level-1-body animate-fade-in-down">
									@for (jefe of man.jefes; track jefe._id) {
										<!-- LEVEL 2: JEFE -->
										<div class="level-card level-2-card">
											<div (click)="toggle(jefe._id)" class="level-header level-2-header">
												<div class="header-content">
													<div class="level-avatar level-2-avatar">
														<span class="material-symbols-outlined icon-xs">person</span>
													</div>
													<div class="text-group">
														<span class="title-secondary">{{ jefe.jefe }}</span>
														<span class="label-accent">{{ langService.translateDual('jefeTurno') }}</span>
													</div>
												</div>
												<div class="actions-group">
													<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: jefe.operativity, small: true }"></ng-container>
													<p-button
														(click)="onViewDaily($event, jefe, 'jefe')"
														severity="secondary"
														[label]="langService.translateDual('detail')"
														size="small"
														class="detail-btn"
													></p-button>
													<span class="material-symbols-outlined expand-icon icon-sm" [class.expanded]="isExpanded(jefe._id)"> chevron_right </span>
												</div>
											</div>

											<!-- Level 2 Body -->
											@if (isExpanded(jefe._id)) {
												<div class="level-body level-2-body animate-fade-in-down">
													@for (sup of jefe.supervisors; track sup._id) {
														<!-- LEVEL 3: SUPERVISOR -->
														<div class="level-card level-3-card">
															<div (click)="toggle(sup._id)" class="level-header level-3-header">
																<div class="header-content">
																	<div class="level-indicator-bar bg-sky"></div>
																	<div class="text-group">
																		<span class="title-tertiary">{{ sup.supervisor }}</span>
																		<span class="label-sky">{{ langService.translateDual('supervisors') }}</span>
																	</div>
																</div>
																<div class="actions-group">
																	<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: sup.operativity, small: true }"></ng-container>
																	<p-button
																		(click)="onViewDaily($event, sup, 'supervisor')"
																		severity="secondary"
																		[label]="langService.translateDual('detail')"
																		size="small"
																		class="detail-btn"
																	></p-button>
																	<span class="material-symbols-outlined expand-icon icon-xs" [class.expanded]="isExpanded(sup._id)"> chevron_right </span>
																</div>
															</div>

															<!-- Level 3 Body -->
															@if (isExpanded(sup._id)) {
																<div class="level-body level-3-body animate-fade-in-down">
																	@for (leader of sup.leaders; track leader._id) {
																		<!-- LEVEL 4: LEADER -->
																		<div class="level-4-item">
																			<div class="header-content">
																				<div class="level-dot-neutral"></div>
																				<span class="title-quaternary">{{ leader.leader }}</span>
																			</div>
																			<div class="actions-group-small">
																				<ng-container *ngTemplateOutlet="operativityPercent; context: { $implicit: leader.operativity }"></ng-container>
																				<p-button
																					(click)="onViewDaily($event, leader, 'leader')"
																					severity="secondary"
																					[label]="langService.translateDual('detail')"
																					size="small"
																					class="detail-btn-mini"
																				></p-button>
																			</div>
																		</div>
																	} @empty {
																		<div class="empty-state-mini">{{ langService.translateDual('noLeaders') }}</div>
																	}
																</div>
															}
														</div>
													} @empty {
														<div class="empty-state-small">{{ langService.translateDual('noSupervisors') }}</div>
													}
												</div>
											}
										</div>
									} @empty {
										<div class="empty-state-small">{{ langService.translateDual('noJefes') }}</div>
									}
								</div>
							}
						</div>
					} @empty {
						<div class="empty-results-container">
							<span class="material-symbols-outlined icon-xl">search_off</span>
							<p class="empty-results-text">{{ langService.translateDual('noResults') }}</p>
						</div>
					}
				</div>
			}

			<!-- Chart View -->
			@if (viewMode() === 'chart') {
				<div class="chart-view-container animate-fade-in">
					<chart [chartOptions]="hierarchyChartOptions()"></chart>
				</div>
			}
		</section>

		<!-- TEMPLATES -->
		<ng-template #operativityBadge let-val let-small="small">
			<div
				class="badge-container"
				[class.small]="small"
				[style.background-color]="val >= 0.85 ? '#f0fdf4' : val >= 0.7 ? '#fffbeb' : '#fef2f2'"
				[style.border-color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'"
				[style.color]="val >= 0.85 ? '#065f46' : val >= 0.7 ? '#92400e' : '#991b1b'"
			>
				<div class="badge-dot" [class.small]="small" [style.background-color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'"></div>
				<span class="badge-text" [class.small]="small">{{ val | percent: '1.2-2' }}</span>
			</div>
		</ng-template>

		<ng-template #operativityPercent let-val>
			<span class="percent-text" [style.color]="val >= 0.85 ? '#10b981' : val >= 0.7 ? '#f59e0b' : '#ef4444'">
				{{ val | percent: '1.2-2' }}
			</span>
		</ng-template>
	`,
	styleUrl: './supervisor-table-operativity.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorTableOperativity {
	public managmentDataOriginal = input.required<Managment[]>({ alias: 'supervisorData' });
	public viewDailyDetail = output<{ item: any; type: string }>();

	public readonly langService = inject(LanguageService);

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
			series: [{ name: `${this.langService.translateDual('operativity')} %`, data: seriesData }],
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
