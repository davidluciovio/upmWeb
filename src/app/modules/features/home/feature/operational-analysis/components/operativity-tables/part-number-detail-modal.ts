import { ChangeDetectionStrategy, Component, computed, inject, input, model, effect, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';
import { LoadData, OperationalAnalysisRequestInterface, DayOperativity, PartNumberOperativity } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
	selector: 'app-part-number-detail-modal',
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
			[classList]="{ 'glass-modal': true, 'bg-slate-50': true, 'dark:bg-slate-950': true }"
		>
			<ng-template pTemplate="header">
				<div class="flex flex-col gap-1">
					<h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
						Análisis de Operatividad <span class="text-slate-400 font-normal">/ 稼働率分析</span>
					</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400 font-mono">
						No. de Parte: <span class="font-bold text-sky-600 dark:text-sky-400">{{ partNumber() }}</span>
					</p>
				</div>
			</ng-template>
			<div class="grid grid-cols-5 gap-6 items-start" *ngIf="visible()">
				@if (detailData$.isLoading()) {
					<div class="flex justify-center p-12 col-span-5">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				} @else {
					@if (detailData$.value(); as data) {
						<!-- Metadata Cards -->
						<div class="col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<!-- Supervisor -->
							<div class="glass-effect p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden group">
								<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<span class="material-symbols-outlined text-4xl">supervisor_account</span>
								</div>
								<p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Supervisor / 監督者</p>
								<p class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{{ data.supervisor }}</p>
							</div>

							<!-- Leader -->
							<div class="glass-effect p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden group">
								<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<span class="material-symbols-outlined text-4xl">person</span>
								</div>
								<p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leader / リーダー</p>
								<p class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{{ data.leader }}</p>
							</div>

							<!-- Shift -->
							<div class="glass-effect p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden group">
								<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<span class="material-symbols-outlined text-4xl">schedule</span>
								</div>
								<p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Turno / シフト</p>
								<p class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{{ data.shift || 'N/A' }}</p>
							</div>

							<!-- Contribution/Operativity -->
							<div
								class="glass-effect p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden group bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/50 dark:to-slate-900/50"
							>
								<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<span class="material-symbols-outlined text-4xl text-indigo-500">pie_chart</span>
								</div>
								<p class="text-xs font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-wider mb-1">Eficiencia Total / 全体の効率</p>
								<div class="flex items-baseline gap-1">
									<p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ data.operativity | percent: '1.1-1' }}</p>
								</div>
							</div>
						</div>

						<!-- Chart -->
						<!-- Chart -->
						<div class="glass-effect col-span-3 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
							<div class="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
								<span class="material-symbols-outlined text-sky-600">show_chart</span>
								<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
									Tendencia Diaria <span class="text-slate-400 font-normal text-sm ml-2">/ 日次トレンド</span>
								</h3>
							</div>
							<chart [chartOptions]="chartOptions()"></chart>
						</div>

						<!-- Table -->
						<div class="glass-effect col-span-2 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
							<div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
								<span class="material-symbols-outlined text-sky-600">table_chart</span>
								<h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
									Detalle de Eficiencia <span class="text-slate-400 font-normal text-sm ml-2">/ 効率詳細</span>
								</h3>
							</div>
							<p-table [value]="dailyData()" [rowHover]="true" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="400px">
								<ng-template pTemplate="header">
									<tr class="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
										<th class="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-3 pl-6">Fecha</th>
										<th class="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-3 text-center">Eficiencia</th>
										<th class="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider py-3">Estado</th>
									</tr>
								</ng-template>
								<ng-template pTemplate="body" let-day>
									<tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
										<td class="font-mono text-sm text-slate-600 dark:text-slate-300 pl-6">{{ day.day | date: 'yyyy-MM-dd' }}</td>
										<td class="text-center font-bold">
											<span
												[ngClass]="{
													'text-emerald-500': day.operativity >= 0.85,
													'text-amber-500': day.operativity >= 0.7 && day.operativity < 0.85,
													'text-red-500': day.operativity < 0.7,
												}"
												>{{ day.operativity | percent: '1.1-1' }}</span
											>
										</td>
										<td>
											<span
												class="px-2 py-1 rounded text-xs font-bold uppercase"
												[ngClass]="{
													'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': day.operativity >= 0.85,
													'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': day.operativity >= 0.7 && day.operativity < 0.85,
													'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': day.operativity < 0.7,
												}"
											>
												{{ day.operativity >= 0.85 ? 'Excelente' : day.operativity >= 0.7 ? 'Regular' : 'Bajo' }}
											</span>
										</td>
									</tr>
								</ng-template>
								<ng-template pTemplate="emptymessage">
									<tr>
										<td colspan="3" class="text-center py-4 text-slate-400">No hay datos diarios disponibles.</td>
									</tr>
								</ng-template>
							</p-table>
						</div>
					}
				}
			</div>
			<ng-template pTemplate="footer">
				<p-button label="Cerrar" icon="pi pi-times" (onClick)="visible.set(false)" [text]="true" severity="secondary"></p-button>
			</ng-template>
		</p-dialog>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberDetailModal {
	visible = model(false);
	partNumber = input<string>('');
	filters = input<OperationalAnalysisRequestInterface | null>(null);

	private readonly _loadData = inject(LoadData);

	detailData$ = rxResource({
		params: () => ({
			pn: this.partNumber(),
			filters: this.filters(),
		}),
		stream: (rx) => {
			const { pn, filters } = rx.params;
			if (!pn) return of(null);

			const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
			const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

			return this._loadData.getOperationalAnalysisPartNumberData(pn, startDate, endDate);
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
					name: 'Eficiencia',
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
			colors: ['#1e40af'],
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
							text: 'Objetivo',
						},
					},
				],
			},
		};
	});

	private generateDates(start: Date, end: Date): Date[] {
		const arr = [];
		for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
			arr.push(new Date(dt));
		}
		return arr;
	}
}
