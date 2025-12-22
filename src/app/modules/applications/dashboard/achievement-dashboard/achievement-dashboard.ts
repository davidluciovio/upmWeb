import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
	rawData = signal<ProductionAchievementResponseInterface[]>([]);
	trendViewMode = signal<'general' | 'area'>('general');
	currentFilters = signal<FilterState>(
		(() => {
			const end = new Date();
			const start = new Date();
			start.setDate(end.getDate() - 7);
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
	areas = computed(() => {
		const data = this.rawData();
		return [...new Set(data.map((p) => p.partInfo.area))].sort();
	});

	supervisors = computed(() => {
		const data = this.rawData();
		const f = this.currentFilters();
		let filtered = data;
		if (f.area) filtered = filtered.filter((p) => p.partInfo.area === f.area);
		return [...new Set(filtered.map((p) => p.partInfo.supervisor))].sort();
	});

	leaders = computed(() => {
		const data = this.rawData();
		const f = this.currentFilters();
		let filtered = data;
		if (f.area) filtered = filtered.filter((p) => p.partInfo.area === f.area);
		if (f.supervisor) filtered = filtered.filter((p) => p.partInfo.supervisor === f.supervisor);
		return [...new Set(filtered.map((p) => p.partInfo.leader))].sort();
	});

	parts = computed(() => {
		const data = this.rawData();
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
	dashboardData = computed(() => {
		const data = this.rawData();
		const f = this.currentFilters();
		const mode = this.trendViewMode();

		const stats = {
			kpis: { totalObj: 0, totalReal: 0 },
			hierarchyMap: new Map<string, SupervisorNode>(),
			leaderMap: new Map<string, any>(),
			partsMap: new Map<string, PartNode>(),
			dateStats: new Map<string, { obj: number; real: number; totalCount: number; successCount: number }>(),
			areaDateMap: new Map<string, Map<string, { obj: number; real: number }>>(),
			activeAreas: new Set<string>(),
		};

		for (const p of data) {
			const info = p.partInfo;
			if (
				(f.area && info.area !== f.area) ||
				(f.supervisor && info.supervisor !== f.supervisor) ||
				(f.leader && info.leader !== f.leader) ||
				(f.partNumber && info.number !== f.partNumber)
			)
				continue;

			stats.activeAreas.add(info.area);

			for (const r of p.dailyRecords) {
				const date = r.date.split('T')[0];
				if ((f.startDate && date < f.startDate) || (f.endDate && date > f.endDate)) continue;

				// OBJETO DE REGISTRO (Lo creamos una vez para reusarlo)
				const recordEntry = { date, obj: r.obj, real: r.real };

				// --- KPIs Globales ---
				stats.kpis.totalObj += r.obj;
				stats.kpis.totalReal += r.real;

				// --- JERARQUÍA (SUPERVISOR) ---
				if (!stats.hierarchyMap.has(info.supervisor)) {
					stats.hierarchyMap.set(info.supervisor, {
						name: info.supervisor,
						area: info.area,
						obj: 0,
						real: 0,
						ach: 0,
						leaders: [],
						records: [],
					});
				}
				const sNode = stats.hierarchyMap.get(info.supervisor)!;
				sNode.obj += r.obj;
				sNode.real += r.real;
				sNode.records.push(recordEntry); // <--- CORRECCIÓN: AGREGAR ESTA LÍNEA

				// --- JERARQUÍA (LÍDER) ---
				const lKey = `${info.supervisor}_${info.leader}`;
				if (!stats.leaderMap.has(lKey)) {
					const newLeader = { name: info.leader, obj: 0, real: 0, ach: 0, records: [] };
					sNode.leaders.push(newLeader);
					stats.leaderMap.set(lKey, newLeader);
				}
				const lNode = stats.leaderMap.get(lKey)!;
				lNode.obj += r.obj;
				lNode.real += r.real;
				lNode.records.push(recordEntry); // <--- CORRECCIÓN: AGREGAR ESTA LÍNEA

				// --- PARTES ---
				if (!stats.partsMap.has(info.number)) {
					stats.partsMap.set(info.number, { number: info.number, area: info.area, obj: 0, real: 0, ach: 0, records: [] });
				}
				const pNode = stats.partsMap.get(info.number)!;
				pNode.obj += r.obj;
				pNode.real += r.real;
				pNode.records.push(recordEntry); // <--- CORRECCIÓN: AGREGAR ESTA LÍNEA

				// ... resto del código de dateStats y areaTrend ...
				if (!stats.dateStats.has(date)) {
					stats.dateStats.set(date, { obj: 0, real: 0, totalCount: 0, successCount: 0 });
				}
				const dS = stats.dateStats.get(date)!;
				dS.obj += r.obj;
				dS.real += r.real;
				dS.totalCount++;
				if (r.real >= r.obj) dS.successCount++;

				if (mode === 'area') {
					if (!stats.areaDateMap.has(date)) stats.areaDateMap.set(date, new Map());
					const aMap = stats.areaDateMap.get(date)!;
					if (!aMap.has(info.area)) aMap.set(info.area, { obj: 0, real: 0 });
					const aData = aMap.get(info.area)!;
					aData.obj += r.obj;
					aData.real += r.real;
				}
			}
		}

		// El resto del return se mantiene igual...
		return {
			kpis: {
				totalObj: Math.round(stats.kpis.totalObj),
				totalReal: Math.round(stats.kpis.totalReal),
				ach: stats.kpis.totalObj > 0 ? (stats.kpis.totalReal / stats.kpis.totalObj) * 100 : 0,
				diff: Math.round(stats.kpis.totalReal - stats.kpis.totalObj),
			},
			hierarchy: Array.from(stats.hierarchyMap.values()).map((s) => ({
				...s,
				ach: s.obj > 0 ? (s.real / s.obj) * 100 : 0,
				leaders: s.leaders.map((l) => ({ ...l, ach: l.obj > 0 ? (l.real / l.obj) * 100 : 0 })),
			})),
			parts: Array.from(stats.partsMap.values())
				.filter((p) => p.obj > 0)
				.map((p) => ({
					...p,
					ach: p.obj > 0 ? (p.real / p.obj) * 100 : 0,
				})),
			dates: Array.from(stats.dateStats.keys()).sort(),
			chartData: stats,
		};
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
			return this._cfg([{ name: 'Cumplimiento %', data }], dates, 'area', ['#002855']);
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

		return this._cfg(series, dates, 'line');
	});

	successChartOptions = computed(() => {
		const { dates, chartData } = this.dashboardData();
		const data = dates.map((d) => {
			const s = chartData.dateStats.get(d)!;
			return s.totalCount > 0 ? parseFloat(((s.successCount / s.totalCount) * 100).toFixed(1)) : 0;
		});
		return this._cfg([{ name: '% Éxito Partes', data }], dates, 'bar', ['#10b981']);
	});

	comparisonChartOptions = computed(() => {
		const { dates, chartData } = this.dashboardData();
		const real = dates.map((d) => Math.round(chartData.dateStats.get(d)!.real));
		const obj = dates.map((d) => Math.round(chartData.dateStats.get(d)!.obj));
		return this._cfg(
			[
				{ name: 'Real', type: 'column', data: real },
				{ name: 'Objetivo', type: 'line', data: obj },
			],
			dates,
			'line',
			['#002855', '#bf9110'],
		);
	});

	ngOnInit() {
		// No initial load
	}

	private loadData() {
		this.isLoading.set(true);
		const f = this.currentFilters();
		this._dataService
			.getProductionAchievement({
				starDate: f.startDate,
				endDate: f.endDate,
				partNumberId: f.partNumber,
				area: f.area,
				supervisor: f.supervisor,
				leader: f.leader,
			})
			.subscribe((data) => {
				this.rawData.set(data);
				this.isLoading.set(false);
			});
	}

	onFiltersChange(newF: FilterState) {
		const oldF = this.currentFilters();
		const data = this.rawData();

		const areaChanged = newF.area !== oldF.area;
		const supChanged = newF.supervisor !== oldF.supervisor;
		const leaderChanged = newF.leader !== oldF.leader;

		// Lógica de Auto-selección Ascendente (Hijo -> Padre)
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
			// Si cambia el supervisor explícitamente, limpiamos el líder anterior
			newF.leader = '';
		} else if (areaChanged) {
			// Si cambia el área, limpiamos dependientes
			newF.supervisor = '';
			newF.leader = '';
		}

		this.currentFilters.set(newF);
		this.loadData();
	}
	onOpenDetails(ev: any) {
		this.detailModal()?.open(ev);
	}

	private _cfg(series: any[], categories: string[], type: any, colors?: string[]): ChartOptions {
		const isArea = type === 'area';
		return {
			series,
			colors,
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
			dataLabels: { enabled: false },
			markers: { size: 0 },
		};
	}
}
