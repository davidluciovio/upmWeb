import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { LoadData, OperationalAnalysisRequestInterface, DayOperativity } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '../../services/language.service';

@Component({
	selector: 'app-supervisor-detail-modal',
	standalone: true,
	imports: [DialogModule, Charts, TableModule, ButtonModule, DatePipe, CommonModule],
	template: `
		<p-dialog
			[(visible)]="visible"
			[modal]="true"
			[style]="{ width: '90vw', maxWidth: '1400px' }"
			[draggable]="false"
			[resizable]="false"
			[dismissableMask]="true"
			appendTo="body"
			styleClass="custom-operativity-dialog"
		>
			<ng-template pTemplate="header">
				<div class="modal-header-container">
					<h2 class="modal-title">{{ langService.translateDual('efficiencyDetail') }}</h2>
					<p class="modal-subtitle">
						{{ langService.translateDual('entity') }}: <span class="modal-subtitle-val">{{ data()?.name }}</span>
						<span class="type-badge">{{ data()?.type }}</span>
					</p>
				</div>
			</ng-template>
			<div class="modal-grid" *ngIf="visible()">
				@if (detailData$.isLoading()) {
					<div class="loading-container">
						<span class="loading-spinner-modal"></span>
					</div>
				} @else {
					@if (detailData$.value(); as data) {
						<!-- Metadata Cards -->
						<div class="sidebar-metadata">
							<!-- Operativity -->
							<div class="metadata-card contribution-card">
								<div class="metadata-icon-box">
									<span class="material-symbols-outlined icon-4xl text-accent">pie_chart</span>
								</div>
								<p class="metadata-label label-accent">{{ langService.translateDual('totalEfficiency') }}</p>
								<p class="metadata-value value-accent">{{ data.operativity | percent: '1.1-1' }}</p>
							</div>

							<!-- Area Info (if available) -->
							@if (data.area) {
								<div class="metadata-card">
									<div class="metadata-icon-box">
										<span class="material-symbols-outlined icon-4xl">domain</span>
									</div>
									<p class="metadata-label">{{ langService.translateDual('area') }}</p>
									<p class="metadata-value">{{ data.area }}</p>
								</div>
							}
						</div>

						<!-- Chart -->
						<div class="chart-section-card-large">
							<div class="section-header">
								<span class="material-symbols-outlined icon-blue">show_chart</span>
								<h3 class="section-title">{{ langService.translateDual('dailyTrend') }}</h3>
							</div>
							<div class="chart-wrapper-modal">
								<chart [chartOptions]="chartOptions()"></chart>
							</div>
						</div>

						<!-- Table -->
						<div class="table-section-card-full">
							<div class="section-header">
								<span class="material-symbols-outlined icon-blue">table_chart</span>
								<h3 class="section-title">{{ langService.translateDual('efficiencyByDay') }}</h3>
							</div>
							<div class="table-modal-wrapper">
								<p-table [value]="dailyData()" [rowHover]="true" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="400px">
									<ng-template pTemplate="header">
										<tr class="modal-table-header">
											<th class="modal-th pl-6">{{ langService.translateDual('date') }}</th>
											<th class="modal-th text-center">{{ langService.translateDual('efficiency') }}</th>
											<th class="modal-th">{{ langService.translateDual('status') }}</th>
										</tr>
									</ng-template>
									<ng-template pTemplate="body" let-day>
										<tr class="modal-table-row">
											<td class="modal-td pl-6 font-mono">{{ day.day | date: 'yyyy-MM-dd' }}</td>
											<td class="modal-td text-center font-bold">
												<span [style.color]="day.operativity >= 0.85 ? '#10b981' : day.operativity >= 0.7 ? '#f59e0b' : '#ef4444'">{{
													day.operativity | percent: '1.1-1'
												}}</span>
											</td>
											<td class="modal-td">
												<span
													class="status-badge"
													[style.backgroundColor]="
														day.operativity >= 0.85 ? 'rgba(16, 185, 129, 0.1)' : day.operativity >= 0.7 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
													"
													[style.color]="day.operativity >= 0.85 ? '#10b981' : day.operativity >= 0.7 ? '#f59e0b' : '#ef4444'"
												>
													{{
														day.operativity >= 0.85
															? langService.translateDual('excellent')
															: day.operativity >= 0.7
																? langService.translateDual('regular')
																: langService.translateDual('low')
													}}
												</span>
											</td>
										</tr>
									</ng-template>
								</p-table>
							</div>
						</div>
					}
				}
			</div>
			<ng-template pTemplate="footer">
				<p-button
					[label]="langService.translateDual('close')"
					icon="pi pi-times"
					(onClick)="visible.set(false)"
					[text]="true"
					severity="secondary"
				></p-button>
			</ng-template>
		</p-dialog>
	`,
	styles: [
		`
			::ng-deep .custom-operativity-dialog .p-dialog-content {
				background-color: #f8fafc;
				padding: 1.5rem;
			}
			:host-context(.dark-mode) ::ng-deep .custom-operativity-dialog .p-dialog-content {
				background-color: #020617;
			}

			.modal-header-container {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
			}
			.modal-title {
				font-size: 1.5rem;
				font-weight: 700;
				color: #1e293b;
				font-style: italic;
				text-transform: uppercase;
				letter-spacing: -0.025em;
				margin: 0;
			}
			:host-context(.dark-mode) .modal-title {
				color: #f1f5f9;
			}
			.modal-title-ja {
				color: #94a3b8;
				font-weight: 400;
			}

			.modal-subtitle {
				font-size: 0.875rem;
				color: #64748b;
				font-family: monospace;
				margin: 0;
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}
			:host-context(.dark-mode) .modal-subtitle {
				color: #94a3b8;
			}
			.modal-subtitle-val {
				font-weight: 700;
				color: #0284c7;
			}
			:host-context(.dark-mode) .modal-subtitle-val {
				color: #38bdf8;
			}

			.type-badge {
				font-size: 10px;
				padding: 0.125rem 0.5rem;
				border-radius: 9999px;
				background-color: #f1f5f9;
				border: 1px solid #e2e8f0;
				color: #64748b;
				text-transform: uppercase;
				font-weight: 700;
			}
			:host-context(.dark-mode) .type-badge {
				background-color: #1e293b;
				border-color: #334155;
				color: #94a3b8;
			}

			.modal-grid {
				display: grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 1.5rem;
				align-items: start;
			}

			.loading-container {
				display: flex;
				justify-content: center;
				padding: 3rem;
				grid-column: span 5;
			}
			.loading-spinner-modal {
				width: 3rem;
				height: 3rem;
				border: 4px solid #e2e8f0;
				border-top-color: #0284c7;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
			@keyframes spin {
				to {
					transform: rotate(360deg);
				}
			}

			.sidebar-metadata {
				grid-column: span 1;
				display: flex;
				flex-direction: column;
				gap: 1rem;
			}

			.metadata-card {
				position: relative;
				padding: 1rem;
				background-color: rgba(255, 255, 255, 0.4);
				border: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				overflow: hidden;
				backdrop-filter: blur(8px);
			}
			:host-context(.dark-mode) .metadata-card {
				background-color: rgba(30, 41, 59, 0.3);
				border-color: #1e293b;
			}

			.metadata-icon-box {
				position: absolute;
				top: 0;
				right: 0;
				padding: 0.75rem;
				opacity: 0.1;
				transition: opacity 0.2s;
			}
			.metadata-card:hover .metadata-icon-box {
				opacity: 0.2;
			}
			.icon-4xl {
				font-size: 2.25rem;
			}

			.metadata-label {
				font-size: 0.75rem;
				font-weight: 700;
				color: #94a3b8;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				margin-bottom: 0.25rem;
			}
			.metadata-value {
				font-size: 0.875rem;
				font-weight: 700;
				color: #334155;
				margin: 0;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			:host-context(.dark-mode) .metadata-value {
				color: #e2e8f0;
			}

			.contribution-card {
				background: linear-gradient(to bottom right, #eef2ff, #ffffff);
			}
			:host-context(.dark-mode) .contribution-card {
				background: linear-gradient(to bottom right, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
			}
			.text-accent {
				color: #6366f1;
			}
			.label-accent {
				color: rgba(99, 102, 241, 0.8);
			}
			.value-accent {
				color: #4f46e5;
				font-size: 1.5rem;
			}
			:host-context(.dark-mode) .value-accent {
				color: #818cf8;
			}

			.chart-section-card-large {
				grid-column: span 4;
				padding: 1.5rem;
				background-color: rgba(255, 255, 255, 0.4);
				border: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				backdrop-filter: blur(8px);
			}
			:host-context(.dark-mode) .chart-section-card-large {
				background-color: rgba(30, 41, 59, 0.3);
				border-color: #1e293b;
			}

			.section-header {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				margin-bottom: 1.5rem;
				border-bottom: 1px solid rgba(226, 232, 240, 0.5);
				padding-bottom: 0.5rem;
			}
			:host-context(.dark-mode) .section-header {
				border-color: rgba(30, 41, 59, 0.5);
			}
			.icon-blue {
				color: #0284c7;
			}
			.section-title {
				font-size: 1.125rem;
				font-weight: 700;
				color: #1e293b;
				text-transform: uppercase;
				letter-spacing: 0.025em;
				margin: 0;
			}
			:host-context(.dark-mode) .section-title {
				color: #f1f5f9;
			}
			.section-title-ja {
				color: #94a3b8;
				font-weight: 400;
				font-size: 0.875rem;
				margin-left: 0.5rem;
			}

			.chart-wrapper-modal {
				width: 100%;
			}

			.table-section-card-full {
				grid-column: span 5;
				overflow: hidden;
				border: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				background-color: rgba(255, 255, 255, 0.4);
				backdrop-filter: blur(8px);
			}
			:host-context(.dark-mode) .table-section-card-full {
				background-color: rgba(30, 41, 59, 0.3);
				border-color: #1e293b;
			}

			::ng-deep .modal-table-header {
				background-color: rgba(248, 250, 252, 0.8);
				backdrop-filter: blur(4px);
			}
			:host-context(.dark-mode) ::ng-deep .modal-table-header {
				background-color: rgba(15, 23, 42, 0.5);
			}

			.modal-th {
				color: #64748b;
				font-weight: 700;
				text-transform: uppercase;
				font-size: 10px;
				letter-spacing: 0.05em;
				padding: 0.75rem 1rem;
			}
			:host-context(.dark-mode) .modal-th {
				color: #94a3b8;
			}

			.modal-table-row {
				border-bottom: 1px solid #f1f5f9;
				transition: background-color 0.2s;
			}
			:host-context(.dark-mode) .modal-table-row {
				border-color: #1e293b;
			}
			.modal-table-row:hover {
				background-color: #f8fafc;
			}
			:host-context(.dark-mode) .modal-table-row:hover {
				background-color: rgba(30, 41, 59, 0.5);
			}

			.modal-td {
				padding: 0.75rem 1rem;
				font-size: 0.875rem;
				color: #475569;
				vertical-align: middle;
			}
			:host-context(.dark-mode) .modal-td {
				color: #cbd5e1;
			}
			.pl-6 {
				padding-left: 1.5rem;
			}
			.text-center {
				text-align: center;
			}
			.font-mono {
				font-family: monospace;
			}
			.font-bold {
				font-weight: 700;
			}

			.status-badge {
				padding: 0.25rem 0.5rem;
				border-radius: 0.25rem;
				font-size: 0.75rem;
				font-weight: 700;
				text-transform: uppercase;
			}

			@media (max-width: 1023px) {
				.sidebar-metadata,
				.chart-section-card-large {
					grid-column: span 5;
				}
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorDetailModal {
	visible = model(false);
	data = input<{ name: string; type: string; item: any } | null>(null); // Passed from parent
	filters = input<OperationalAnalysisRequestInterface | null>(null);

	private readonly _loadData = inject(LoadData);
	public readonly langService = inject(LanguageService);

	detailData$ = rxResource({
		params: () => ({
			data: this.data(),
			filters: this.filters(),
		}),
		stream: (rx) => {
			const { data, filters } = rx.params;
			if (!data) return of(null);

			const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
			const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

			const request: OperationalAnalysisRequestInterface = {
				startDate: startDate,
				endDate: endDate,
				leaders: [],
				managments: [],
				areas: [],
				supervisors: [],
				jefes: [],
				partNumbers: [],
				shifts: [],
			};

			if (data.type === 'gerencia') request.managments = [data.name];
			else if (data.type === 'jefe') request.jefes = [data.name];
			else if (data.type === 'supervisor') request.supervisors = [data.name];
			else if (data.type === 'leader') request.leaders = [data.name];

			return this._loadData.getOperationalAnalysisData(request).pipe(
				map((response) => {
					if (!response || !response.areaOperativityDayTrends) return null;

					const dailyMap = new Map<string, { totalOp: number; count: number }>();

					response.areaOperativityDayTrends.forEach((areaTrend) => {
						areaTrend.dayOperativities.forEach((dayOp) => {
							const dateStr = dayOp.day.toString().split('T')[0];
							if (!dailyMap.has(dateStr)) {
								dailyMap.set(dateStr, { totalOp: 0, count: 0 });
							}
							const entry = dailyMap.get(dateStr)!;
							entry.totalOp += dayOp.operativity;
							entry.count++;
						});
					});

					const aggregatedDays: DayOperativity[] = [];
					dailyMap.forEach((val, key) => {
						aggregatedDays.push({
							day: new Date(key),
							operativity: val.count > 0 ? val.totalOp / val.count : 0,
						});
					});

					aggregatedDays.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

					return {
						...data.item,
						dayOperativities: aggregatedDays,
					};
				}),
			);
		},
	});

	dailyData = computed(() => {
		const val = this.detailData$.value();
		return val ? val.dayOperativities || [] : [];
	});

	chartOptions = computed(() => {
		const data = this.dailyData();
		if (!data || data.length === 0) return {};

		return {
			series: [
				{
					name: this.langService.translateDual('efficiency'),
					data: data.map((d: DayOperativity) => parseFloat((d.operativity * 100).toFixed(1))),
				},
			],
			chart: {
				type: 'bar',
				height: 300,
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
				toolbar: { show: false },
				animations: { enabled: true },
			},
			stroke: {
				curve: 'straight',
				width: 2,
				colors: ['#1e40af'],
			},
			xaxis: {
				categories: data.map((d: DayOperativity) => new Date(d.day).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })),
				labels: { style: { colors: '#94a3b8', fontSize: '10px' } },
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				labels: {
					formatter: (val: number) => val.toFixed(0) + '%',
					style: { colors: '#64748b', fontSize: '11px' },
				},
				min: 0,
				max: 100,
			},
			grid: {
				borderColor: 'rgba(226, 232, 240, 0.1)',
				strokeDashArray: 4,
			},
			colors: data.map((d: DayOperativity) => (d.operativity >= 0.85 ? '#10b981' : d.operativity >= 0.7 ? '#f59e0b' : '#ef4444')),
			tooltip: {
				theme: 'dark',
				y: { formatter: (val: number) => val + '%' },
			},
			annotations: {
				yaxis: [
					{
						y: 85,
						borderColor: '#22c55e',
						label: {
							borderColor: '#22c55e',
							style: { color: '#fff', background: '#22c55e' },
							text: this.langService.translateDual('target'),
						},
					},
				],
			},
		};
	});
}
