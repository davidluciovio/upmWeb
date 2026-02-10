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
		<section class="supervisor-analysis-section">
			<!-- Header -->
			<div class="supervisor-header">
				<div class="header-main-row">
					<div class="header-info-group">
						<div class="header-icon-box">
							<span class="material-symbols-outlined">account_tree</span>
						</div>
						<div class="header-text-group">
							<h2 class="header-title">Análisis Jerárquico</h2>
							<p class="header-subtitle">Vista de Tarjetas Expandibles</p>
						</div>
					</div>

					<div class="view-mode-selector">
						<button (click)="viewMode.set('list')" class="view-mode-btn" [class.active]="viewMode() === 'list'">Lista</button>
						<button (click)="viewMode.set('chart')" class="view-mode-btn" [class.active]="viewMode() === 'chart'">Gráfico</button>
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
								placeholder="Filtrar por nombre, área..."
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
									<p-button (click)="onViewDaily($event, man, 'gerencia')" severity="secondary" label="Detalle" size="small" class="detail-btn"></p-button>
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
														<span class="label-accent">Jefe de Turno</span>
													</div>
												</div>
												<div class="actions-group">
													<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: jefe.operativity, small: true }"></ng-container>
													<p-button (click)="onViewDaily($event, jefe, 'jefe')" severity="secondary" label="Detalle" size="small" class="detail-btn"></p-button>
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
																		<span class="label-sky">Supervisor</span>
																	</div>
																</div>
																<div class="actions-group">
																	<ng-container *ngTemplateOutlet="operativityBadge; context: { $implicit: sup.operativity, small: true }"></ng-container>
																	<p-button
																		(click)="onViewDaily($event, sup, 'supervisor')"
																		severity="secondary"
																		label="Detalle"
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
																					label="Detalle"
																					size="small"
																					class="detail-btn-mini"
																				></p-button>
																			</div>
																		</div>
																	} @empty {
																		<div class="empty-state-mini">Sin líderes asignados</div>
																	}
																</div>
															}
														</div>
													} @empty {
														<div class="empty-state-small">Sin supervisores asignados</div>
													}
												</div>
											}
										</div>
									} @empty {
										<div class="empty-state-small">Sin jefes de turno asignados</div>
									}
								</div>
							}
						</div>
					} @empty {
						<div class="empty-results-container">
							<span class="material-symbols-outlined icon-xl">search_off</span>
							<p class="empty-results-text">No se encontraron resultados</p>
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
	styles: [
		`
			.supervisor-analysis-section {
				display: flex;
				flex-direction: column;
				background-color: rgba(255, 255, 255, 0.6);
				border: 1px solid #e2e8f0;
				border-radius: 0.5rem;
				box-shadow:
					0 20px 25px -5px rgba(0, 0, 0, 0.1),
					0 10px 10px -5px rgba(0, 0, 0, 0.04);
				overflow: hidden;
			}

			:host-context(.dark-mode) .supervisor-analysis-section {
				background-color: #0f172a;
				border-color: #1e293b;
			}

			.supervisor-header {
				padding: 1.5rem;
				border-bottom: 1px solid #e2e8f0;
				display: flex;
				flex-direction: column;
				gap: 1rem;
				background-color: rgba(248, 250, 252, 0.5);
			}

			:host-context(.dark-mode) .supervisor-header {
				border-color: #1e293b;
				background-color: rgba(15, 23, 42, 0.5);
			}

			.header-main-row {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: flex-start;
				gap: 1rem;
			}
			@media (min-width: 640px) {
				.header-main-row {
					flex-direction: row;
					align-items: center;
				}
			}

			.header-info-group {
				display: flex;
				align-items: center;
				gap: 0.75rem;
			}
			.header-icon-box {
				width: 2.5rem;
				height: 2.5rem;
				border-radius: 0.75rem;
				background-color: rgba(79, 70, 229, 0.1);
				display: flex;
				align-items: center;
				justify-content: center;
				color: #4f46e5;
			}
			.header-text-group {
				display: flex;
				flex-direction: column;
			}
			.header-title {
				font-size: 1.125rem;
				font-weight: 900;
				color: #1e293b;
				text-transform: uppercase;
				font-style: italic;
				letter-spacing: -0.05em;
				line-height: 1;
				margin: 0;
			}
			:host-context(.dark-mode) .header-title {
				color: #f1f5f9;
			}
			.header-subtitle {
				font-size: 10px;
				font-weight: 700;
				color: #94a3b8;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				margin-top: 0.25rem;
				margin-bottom: 0;
			}

			.view-mode-selector {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				padding: 0.25rem;
				background-color: rgba(226, 232, 240, 0.5);
				border-radius: 0.75rem;
				border: 1px solid #e2e8f0;
				box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
			}
			:host-context(.dark-mode) .view-mode-selector {
				background-color: rgba(30, 41, 59, 0.5);
				border-color: #334155;
			}
			.view-mode-btn {
				padding: 0.375rem 1rem;
				font-size: 10px;
				font-weight: 900;
				text-transform: uppercase;
				border-radius: 0.5rem;
				transition: all 0.2s;
				border: none;
				background: transparent;
				cursor: pointer;
				color: #64748b;
			}
			.view-mode-btn.active {
				background-color: #ffffff;
				color: #4f46e5;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
			}
			:host-context(.dark-mode) .view-mode-btn.active {
				background-color: #334155;
				color: #818cf8;
			}

			.search-container {
				width: 100%;
			}
			::ng-deep .search-input {
				width: 100% !important;
				border-radius: 0.75rem !important;
				font-size: 0.75rem !important;
				background-color: rgba(255, 255, 255, 0.5) !important;
				border-color: #e2e8f0 !important;
			}
			:host-context(.dark-mode) ::ng-deep .search-input {
				background-color: rgba(15, 23, 42, 0.5) !important;
				border-color: #1e293b !important;
				color: #e2e8f0 !important;
			}

			.list-view-container {
				overflow-y: auto;
				height: fit-content;
				padding: 1rem;
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				background-color: rgba(248, 250, 252, 0.3);
			}
			:host-context(.dark-mode) .list-view-container {
				background-color: rgba(15, 23, 42, 0.1);
			}

			.level-card {
				border: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				overflow: hidden;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				transition: all 0.2s;
			}
			.level-card:hover {
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
			}
			:host-context(.dark-mode) .level-card {
				border-color: #334155;
			}

			.level-1-card {
				background-color: rgba(248, 250, 252, 0.5);
			}
			:host-context(.dark-mode) .level-1-card {
				background-color: rgba(30, 41, 59, 0.5);
			}

			.level-header {
				padding: 0.75rem;
				display: flex;
				items-center: center;
				justify-content: space-between;
				cursor: pointer;
				transition: background-color 0.2s;
			}
			.level-1-header:hover {
				background-color: #f8fafc;
			}
			:host-context(.dark-mode) .level-1-header:hover {
				background-color: rgba(51, 65, 85, 0.5);
			}

			.header-content {
				display: flex;
				align-items: center;
				gap: 0.75rem;
			}
			.level-avatar {
				width: 2rem;
				height: 2rem;
				border-radius: 9999px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.level-1-avatar {
				background-color: #e0e7ff;
				color: #4f46e5;
			}
			:host-context(.dark-mode) .level-1-avatar {
				background-color: rgba(49, 46, 129, 0.3);
				color: #818cf8;
			}

			.text-group {
				display: flex;
				flex-direction: column;
			}
			.title-primary {
				font-size: 0.75rem;
				font-weight: 700;
				color: #334155;
				text-transform: uppercase;
			}
			:host-context(.dark-mode) .title-primary {
				color: #e2e8f0;
			}
			.subtitle-secondary {
				font-size: 9px;
				font-weight: 700;
				color: #94a3b8;
				text-transform: uppercase;
				letter-spacing: 0.025em;
			}

			.actions-group {
				display: flex;
				align-items: center;
				gap: 1rem;
			}
			.expand-icon {
				color: #94a3b8;
				font-size: 1.125rem;
				transition: transform 0.3s;
			}
			.expand-icon.expanded {
				transform: rotate(90deg);
			}

			.level-body {
				border-top: 1px solid #f1f5f9;
				padding: 0.5rem;
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}
			.level-1-body {
				padding-left: 2rem;
				background-color: rgba(238, 242, 255, 0.3);
			}
			:host-context(.dark-mode) .level-1-body {
				border-color: rgba(51, 65, 85, 0.5);
				background-color: rgba(49, 46, 129, 0.05);
			}

			.level-2-card {
				background-color: rgba(255, 255, 255, 0.8);
				border-color: rgba(226, 232, 240, 0.6);
			}
			:host-context(.dark-mode) .level-2-card {
				background-color: rgba(30, 41, 59, 0.8);
				border-color: rgba(51, 65, 85, 0.6);
			}
			.level-2-avatar {
				background-color: #d1fae5;
				color: #059669;
				border-radius: 0.375rem;
				width: 1.5rem;
				height: 1.5rem;
			}
			:host-context(.dark-mode) .level-2-avatar {
				background-color: rgba(6, 78, 59, 0.3);
				color: #34d399;
			}
			.title-secondary {
				font-size: 11px;
				font-weight: 700;
				color: #334155;
				text-transform: uppercase;
			}
			:host-context(.dark-mode) .title-secondary {
				color: #e2e8f0;
			}
			.label-accent {
				font-size: 8px;
				font-weight: 700;
				color: #10b981;
				text-transform: uppercase;
				letter-spacing: 0.025em;
			}

			.level-2-body {
				padding-left: 2rem;
				background-color: rgba(209, 250, 229, 0.3);
				border-color: #f1f5f9;
			}
			:host-context(.dark-mode) .level-2-body {
				background-color: rgba(6, 78, 59, 0.05);
				border-color: rgba(51, 65, 85, 0.3);
			}

			.level-3-card {
				background-color: rgba(255, 255, 255, 0.6);
				border-color: rgba(226, 232, 240, 0.5);
			}
			:host-context(.dark-mode) .level-3-card {
				background-color: rgba(30, 41, 59, 0.5);
				border-color: rgba(51, 65, 85, 0.5);
			}
			.level-indicator-bar {
				width: 6px;
				height: 1.5rem;
				border-radius: 9999px;
			}
			.level-indicator-bar.bg-sky {
				background-color: #38bdf8;
			}
			.title-tertiary {
				font-size: 10px;
				font-weight: 700;
				color: #475569;
				text-transform: uppercase;
			}
			:host-context(.dark-mode) .title-tertiary {
				color: #cbd5e1;
			}
			.label-sky {
				font-size: 7px;
				font-weight: 700;
				color: #0ea5e9;
				text-transform: uppercase;
				letter-spacing: 0.025em;
			}

			.level-3-body {
				padding-left: 1rem;
				background-color: rgba(224, 242, 254, 0.3);
				border-color: #f1f5f9;
				gap: 0.375rem;
			}
			:host-context(.dark-mode) .level-3-body {
				background-color: rgba(12, 74, 110, 0.05);
				border-color: rgba(51, 65, 85, 0.3);
			}

			.level-4-item {
				display: flex;
				items-center: center;
				justify-content: space-between;
				padding: 0.5rem;
				border-radius: 0.375rem;
				background-color: rgba(255, 255, 255, 0.4);
				border: 1px solid #f1f5f9;
				transition: background-color 0.2s;
			}
			.level-4-item:hover {
				background-color: #ffffff;
			}
			:host-context(.dark-mode) .level-4-item {
				background-color: rgba(15, 23, 42, 0.4);
				border-color: #1e293b;
			}
			:host-context(.dark-mode) .level-4-item:hover {
				background-color: #1e293b;
			}
			.level-dot-neutral {
				width: 0.25rem;
				height: 0.25rem;
				border-radius: 9999px;
				background-color: #94a3b8;
			}
			.title-quaternary {
				font-size: 10px;
				font-weight: 700;
				color: #64748b;
				text-transform: uppercase;
				font-style: italic;
			}
			:host-context(.dark-mode) .title-quaternary {
				color: #94a3b8;
			}

			.actions-group-small {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}
			.empty-state-mini {
				padding: 0.5rem;
				text-align: center;
				font-size: 9px;
				color: #94a3b8;
				font-style: italic;
			}
			.empty-state-small {
				padding: 0.5rem;
				text-align: center;
				font-size: 10px;
				color: #94a3b8;
				font-style: italic;
			}

			.empty-results-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 5rem 0;
				opacity: 0.5;
			}
			.icon-xl {
				font-size: 2.5rem;
				color: #cbd5e1;
			}
			.empty-results-text {
				font-size: 0.875rem;
				font-weight: 700;
				color: #94a3b8;
				margin-top: 0.5rem;
			}

			.chart-view-container {
				padding: 1.5rem;
				flex-grow: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				background-color: rgba(255, 255, 255, 0.3);
				min-height: 500px;
			}
			:host-context(.dark-mode) .chart-view-container {
				background-color: rgba(15, 23, 42, 0.3);
			}

			.badge-container {
				padding: 0.125rem 0.5rem;
				border-radius: 9999px;
				border: 1px solid transparent;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				display: flex;
				align-items: center;
				gap: 0.375rem;
			}
			.badge-container.small {
				padding: 0.125rem 0.4rem;
			}
			.badge-dot {
				width: 0.5rem;
				height: 0.5rem;
				border-radius: 9999px;
			}
			.badge-dot.small {
				width: 0.375rem;
				height: 0.375rem;
			}
			.badge-text {
				font-weight: 900;
				font-size: 0.875rem;
				line-height: 1;
			}
			.badge-text.small {
				font-size: 10px;
			}

			.percent-text {
				font-size: 12px;
				font-weight: 900;
			}

			.width-full {
				width: 100%;
			}
			.icon-sm {
				font-size: 0.875rem;
			}
			.icon-xs {
				font-size: 0.75rem;
			}

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
			.animate-fade-in {
				animation: fadeIn 0.3s ease-out;
			}
			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			::ng-deep .detail-btn .p-button {
				padding: 0.25rem 0.5rem !important;
				font-size: 10px !important;
			}
			::ng-deep .detail-btn-mini .p-button {
				padding: 0.125rem 0.375rem !important;
				font-size: 8px !important;
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
