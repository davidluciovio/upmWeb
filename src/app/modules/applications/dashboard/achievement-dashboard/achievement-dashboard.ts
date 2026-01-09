import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, timer } from 'rxjs';
import { AchievementDashboardDataService, ProductionAchievementResponseInterface } from './services/achievement-dashboard-data.service';
import { FilterState, FiltersComponent } from './components/filters/filters';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards';
import { HierarchyTableComponent, SupervisorNode } from './components/tables/hierarchy-table/hierarchy-table';
import { PartsTableComponent, PartNode } from './components/tables/parts-table/parts-table';
import { Charts, ChartOptions } from '../../../../shared/components/charts/charts';
import { DetailModalComponent } from './components/detail-modal/detail-modal';

@Component({
	selector: 'app-achievement-dashboard',
	standalone: true,
	imports: [CommonModule, FiltersComponent, KpiCardsComponent, HierarchyTableComponent, PartsTableComponent, Charts, DetailModalComponent],
	templateUrl: './achievement-dashboard.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementDashboardComponent implements OnInit {
	private _dataService = inject(AchievementDashboardDataService);
	detailModal = viewChild(DetailModalComponent);

	isLoading = signal(true);
	private _baseData = signal<ProductionAchievementResponseInterface[]>([]);
	trendViewMode = signal<'general' | 'area'>('area');
	currentFilters = signal<FilterState>(
		(() => {
			const end = new Date();
			const start = new Date();
			start.setMonth(end.getMonth() - 1);
			return {
				startDate: start.toISOString().split('T')[0],
				endDate: end.toISOString().split('T')[0],
				area: '',
				supervisor: '',
				leader: '',
				partNumber: '',
			};
		})(),
	);

	// Filtros dinámicos
	// Filtros dinámicos COMPUTADOS (Dependientes)
	// Computed: Data filtrada localmente para evitar tráfico innecesario
	// Computed: Data filtrada localmente para evitar tráfico innecesario
	// Note: rawData logic moved to service processData internal logic

	areas = computed(() => {
		const data = this._baseData();
		return [...new Set(data.map((p) => p.partInfo.area))].sort();
	});

	supervisors = computed(() => {
		const data = this._baseData();
		const f = this.currentFilters();
		let filtered = data;
		if (f.area) filtered = filtered.filter((p) => p.partInfo.area === f.area);
		return [...new Set(filtered.map((p) => p.partInfo.supervisor))].sort();
	});

	leaders = computed(() => {
		const data = this._baseData();
		const f = this.currentFilters();
		let filtered = data;
		if (f.area) filtered = filtered.filter((p) => p.partInfo.area === f.area);
		if (f.supervisor) filtered = filtered.filter((p) => p.partInfo.supervisor === f.supervisor);
		return [...new Set(filtered.map((p) => p.partInfo.leader))].sort();
	});

	parts = computed(() => {
		const data = this._baseData();
		const f = this.currentFilters();
		let filtered = data;
		if (f.area) filtered = filtered.filter((p) => p.partInfo.area === f.area);
		if (f.supervisor) filtered = filtered.filter((p) => p.partInfo.supervisor === f.supervisor);
		if (f.leader) filtered = filtered.filter((p) => p.partInfo.leader === f.leader);
		return [...new Set(filtered.map((p) => p.partInfo.number))].sort();
	});

	/**
	 * PROCESAMIENTO ULTRARRÁPIDO:
	 * Agregamos los registros duplicados por fecha y pre-calculamos todo en un paso.
	 */
	// PROCESAMIENTO CENTRALIZADO EN EL SERVICIO
	dashboardData = computed(() => {
		return this._dataService.processData(this._baseData(), this.currentFilters(), this.trendViewMode());
	});

	// --- Selectores para Gráficas ---
	kpis = computed(() => this.dashboardData().kpis);
	hierarchyData = computed(() => this.dashboardData().hierarchy);
	partsData = computed(() => this.dashboardData().parts);

	trendChartOptions = computed(() => {
		const { dates, chartData } = this.dashboardData();
		const mode = this.trendViewMode();

		if (mode === 'general') {
			const data = dates.map((d) => {
				const s = chartData.dateStats.get(d)!;
				return s.obj > 0 ? parseFloat(((s.real / s.obj) * 100).toFixed(1)) : 0;
			});
			return this._cfg([{ name: 'Cumplimiento %', data }], dates, 'area', ['#002855'], 100);
		}

		const series = Array.from(chartData.activeAreas)
			.sort()
			.map((area) => ({
				name: area,
				data: dates.map((d) => {
					const val = chartData.areaDateMap.get(d)?.get(area);
					return val && val.obj > 0 ? parseFloat(((val.real / val.obj) * 100).toFixed(1)) : 0;
				}),
			}));

		return this._cfg(series, dates, 'line', undefined, 100);
	});

	successChartOptions = computed(() => {
		const { dates, chartData } = this.dashboardData();
		const data = dates.map((d) => {
			const s = chartData.dateStats.get(d)!;
			return s.totalCount > 0 ? parseFloat(((s.successCount / s.totalCount) * 100).toFixed(1)) : 0;
		});
		return this._cfg([{ name: '% Éxito Partes', data }], dates, 'bar', ['#10b981'], 100);
	});

	comparisonChartOptions = computed(() => {
		const { dates, chartData } = this.dashboardData();
		const real = dates.map((d) => Math.round(chartData.dateStats.get(d)!.real));
		const obj = dates.map((d) => Math.round(chartData.dateStats.get(d)!.obj));

		console.log(real);
		console.log(obj);
		return this._cfg(
			[
				{
					name: 'Real',
					type: 'column',
					data: real,
					dataLabels: {
						enabled: true,
						formatter: function (val: any) {
							return Math.round(val.value);
						},
					},
				},
				{
					name: 'Objetivo',
					type: 'line',
					data: obj,
					dataLabels: {
						enabled: true,
						formatter: function (val: any) {
							return Math.round(val.value);
						},
					},
				},
			],
			dates,
			'line',
			['#002855', '#bf9110'],
		);
	});

	ngOnInit() {
		this.loadData();
	}

	private loadData() {
		this.isLoading.set(true);
		const f = this.currentFilters();

		// Ejecutamos la petición y el timer en paralelo
		forkJoin([
			this._dataService.getProductionAchievement({
				startDate: f.startDate,
				endDate: f.endDate,
				partNumberId: '',
				area: '',
				supervisor: '',
				leader: '',
			}),
			timer(2500), // Reducimos para mejor UX
		]).subscribe(([data]) => {
			// Optimizamos: removemos campos no usados como 'time' para ahorrar memoria
			const optimizedData = data.map((p) => ({
				...p,
				dailyRecords: p.dailyRecords.map(({ time, ...r }) => r),
			}));

			// Seteamos los datos base
			this._baseData.set(optimizedData);

			// Forzamos el procesamiento mientras sigue el loader
			console.log('ACH DEBUG: Pre-processing data...');
			this.dashboardData();

			this.isLoading.set(false);
		});
	}

	onFiltersChange(newF: FilterState) {
		const oldF = this.currentFilters();
		const data = this._baseData();

		const dateChanged = newF.startDate !== oldF.startDate || newF.endDate !== oldF.endDate;
		const areaChanged = newF.area !== oldF.area;
		const supChanged = newF.supervisor !== oldF.supervisor;
		const leaderChanged = newF.leader !== oldF.leader;

		// Lógica de Auto-selección Ascendente
		if (leaderChanged && newF.leader) {
			const match = data.find((d) => d.partInfo.leader === newF.leader);
			if (match) {
				newF.supervisor = match.partInfo.supervisor;
				newF.area = match.partInfo.area;
			}
		} else if (supChanged && newF.supervisor) {
			const match = data.find((d) => d.partInfo.supervisor === newF.supervisor);
			if (match) {
				newF.area = match.partInfo.area;
			}
			newF.leader = '';
		} else if (areaChanged) {
			newF.supervisor = '';
			newF.leader = '';
		}

		this.currentFilters.set(newF);

		// SOLO recargamos del servidor si las fechas cambiaron
		if (dateChanged) {
			this.loadData();
		}
	}
	onOpenDetails(ev: any) {
		this.detailModal()?.open(ev);
	}

	private _cfg(series: any[], categories: string[], type: any, colors?: string[], target?: number): ChartOptions {
		const isArea = type === 'area';
		const annotations: any = target
			? {
					yaxis: [
						{
							y: target,
							borderColor: '#ef4444',
							label: {
								borderColor: '#ef4444',
								style: { color: '#fff', background: '#ef4444', fontSize: '10px', fontWeight: 'bold' },
								text: `TARGET: ${target}${type === 'line' || type === 'area' || type === 'bar' ? '%' : ''}`,
							},
						},
					],
				}
			: undefined;

		return {
			series,
			colors,
			annotations,
			chart: {
				type: isArea ? 'area' : type,
				height: 300,
				animations: { enabled: false },
				toolbar: { show: false },
			},
			xaxis: {
				categories,
				labels: { rotate: -45, style: { fontSize: '10px' } },
			},
			stroke: {
				curve: 'straight',
				width: isArea ? 3 : 2,
			},
			fill: {
				type: isArea ? 'gradient' : 'solid',
				opacity: isArea ? 0.2 : 1,
			},
			dataLabels: {
				enabled: true,
				formatter: (val: number) => (type !== 'column' ? `${val}` : val),
				style: {
					fontSize: '9px',
					fontFamily: 'Inter, sans-serif',
					fontWeight: 'bold',
				},
				background: {
					enabled: true,
					foreColor: '#fff',
					padding: 3,
					borderRadius: 2,
					borderWidth: 0,
					opacity: 0.6,
				},
				dropShadow: { enabled: false },
			},
			markers: { size: 0 },
		};
	}
}
