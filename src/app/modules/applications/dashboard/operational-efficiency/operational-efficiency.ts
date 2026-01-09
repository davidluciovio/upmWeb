import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, timer } from 'rxjs';
import {
	OperationalEfficiencyService,
	OperationalEfficiencyResponseInterface,
	ProductionDetailInterface,
	FlatRecord,
} from './services/operational-efficiency.service';
import { FilterState, FiltersComponent } from '../achievement-dashboard/components/filters/filters';
import { Charts, ChartOptions } from '../../../../shared/components/charts/charts';
import { EffKpiCardsComponent } from './components/eff-kpi-cards/eff-kpi-cards';
import { EffDetailModalComponent, EfficiencyDetailData } from './components/eff-detail-modal/eff-detail-modal';
import { EffHierarchyTableComponent, EffSupervisorNode } from './components/tables/eff-hierarchy-table/eff-hierarchy-table';
import { EffPartsTableComponent, EffPartNode } from './components/tables/eff-parts-table/eff-parts-table';

@Component({
	selector: 'app-operational-efficiency',
	standalone: true,
	imports: [CommonModule, FiltersComponent, Charts, EffKpiCardsComponent, EffDetailModalComponent, EffHierarchyTableComponent, EffPartsTableComponent],
	templateUrl: './operational-efficiency.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalEfficiency implements OnInit {
	private _service = inject(OperationalEfficiencyService);
	detailModal = viewChild(EffDetailModalComponent);

	isLoading = signal(true);
	// Store RAW response
	private _baseData = signal<OperationalEfficiencyResponseInterface[]>([]);
	private _flatData = computed(() => this._service.flattenData(this._baseData()));
	trendViewMode = signal<'general' | 'area'>('area');
	trendHierMode = signal<'leader' | 'supervisor'>('leader');

	currentFilters = signal<FilterState>(
		(() => {
			const end = new Date();
			const year = end.getFullYear();
			const month = String(end.getMonth() + 1).padStart(2, '0');
			const startDate = `${year}-${month}-01`;

			return {
				startDate: startDate,
				endDate: end.toISOString().split('T')[0],
				area: '',
				supervisor: '',
				leader: '',
				partNumber: '',
			};
		})(),
	);

	leaderTrendOptions = computed<ChartOptions>(() => {
		const { stats, dates } = this.dashboardData();
		const mode = this.trendHierMode();
		const dataMap = mode === 'leader' ? stats.leaderDateMap : stats.supervisorDateMap;

		if (!dataMap || dataMap.size === 0) {
			return { series: [], chart: { type: 'heatmap' }, xaxis: { categories: [] } };
		}

		const series = Array.from(dataMap.entries()).map(([name, dateMap]) => ({
			name: name,
			data: dates.map((date) => {
				const val = dateMap.get(date);
				const percent = val && val.count > 0 ? parseFloat(((val.operSum / val.count) * 100).toFixed(1)) : 0;
				return {
					x: date,
					y: percent,
				};
			}),
		}));

		return {
			series,
			chart: {
				type: 'heatmap',
				height: 350,
				toolbar: { show: false },
				animations: { enabled: false },
			},
			plotOptions: {
				heatmap: {
					shadeIntensity: 0.5,
					radius: 2,
					useFillColorAsStroke: false,
					colorScale: {
						ranges: [
							{ from: 0, to: 84.9, name: 'Crítico (<85%)', color: '#EF4444' }, // Red
							{ from: 85, to: 92.9, name: 'Alerta (85-93%)', color: '#F59E0B' }, // Amber
							{ from: 93, to: 100, name: 'OK (>93%)', color: '#10B981' }, // Emerald
						],
					},
				},
			},
			xaxis: {
				type: 'category',
				labels: { rotate: -45, style: { fontSize: '10px' } },
			},
			dataLabels: {
				enabled: true,
				textAnchor: 'end',
				style: { colors: ['#fff'], fontSize: '10px' },
			},
			stroke: {
				width: 1,
				colors: ['#fff'],
			},
			// Remove explicit colors array as we use colorScale
		};
	});

	// --- FILTER OPTIONS COMPUTED ---
	areas = computed(() => {
		const values = new Set(this._flatData().map((d) => d.area));
		return [...values].sort();
	});

	supervisors = computed(() => {
		const f = this.currentFilters();
		const data = this._flatData();
		const filtered = f.area ? data.filter((d) => d.area === f.area) : data;
		const values = new Set(filtered.map((d) => d.supervisor));
		return [...values].sort();
	});

	leaders = computed(() => {
		const f = this.currentFilters();
		const data = this._flatData();
		const filtered = data.filter((d) => (!f.area || d.area === f.area) && (!f.supervisor || d.supervisor === f.supervisor));
		const values = new Set(filtered.map((d) => d.leader));
		return [...values].sort();
	});

	parts = computed(() => {
		const f = this.currentFilters();
		const data = this._flatData();
		const filtered = data.filter(
			(d) => (!f.area || d.area === f.area) && (!f.supervisor || d.supervisor === f.supervisor) && (!f.leader || d.leader === f.leader),
		);
		const values = new Set(filtered.map((d) => d.part));
		return [...values].sort();
	});

	// --- MAIN DASHBOARD DATA COMPUTED ---
	dashboardData = computed(() => {
		return this._service.processData(this._flatData(), this.currentFilters(), this.trendViewMode());
	});

	// --- CHART OPTIONS COMPUTED ---

	trendOptions = computed(() => {
		const { dates, stats } = this.dashboardData();
		const mode = this.trendViewMode();

		if (mode === 'general') {
			const data = dates.map((d) => {
				const s = stats.dateMap.get(d)!;
				return s.count > 0 ? parseFloat(((s.operSum / s.count) * 100).toFixed(1)) : 0;
			});
			return this._cfg([{ name: 'Operatividad Promedio %', data }], dates, 'area', ['#10b981'], 100);
		}

		const series = Array.from(stats.activeAreas)
			.sort()
			.map((area) => ({
				name: area,
				data: dates.map((d) => {
					const val = stats.areaDateMap.get(d)?.get(area);
					return val && val.count > 0 ? parseFloat(((val.operSum / val.count) * 100).toFixed(1)) : 0;
				}),
			}));
		return this._cfg(series, dates, 'line', undefined, 100);
	});

	shiftOptions = computed(() => {
		const { stats } = this.dashboardData();
		const shifts = Array.from(stats.shiftMap.keys()).sort();
		const data = shifts.map((s) => {
			const v = stats.shiftMap.get(s)!;
			return v.count > 0 ? parseFloat(((v.operSum / v.count) * 100).toFixed(1)) : 0;
		});
		return this._cfg(
			[{ name: 'Operatividad %', data }],
			shifts.map((s) => `Turno ${s}`),
			'bar',
			['#a855f7'],
		);
	});

	paretoOptions = computed(() => {
		const { stats } = this.dashboardData();
		const entries = Array.from(stats.leaderDownMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);
		const data = entries.map((e) => Math.round(e[1]));
		const cats = entries.map((e) => e[0]);

		return {
			...this._cfg([{ name: 'Tiempo de Paro (min)', data }], cats, 'bar', ['#ef4444']),
			plotOptions: { bar: { horizontal: false, borderRadius: 2, barHeight: '60%' } },
		} as any;
	});

	downtimeTrendOptions = computed(() => {
		const { dates, stats } = this.dashboardData();
		const data = dates.map((d) => {
			const s = stats.dateMap.get(d)!;
			const downtime = s.total - s.work;
			return Math.round(downtime);
		});
		return this._cfg([{ name: 'Tiempo de Paro (min)', data }], dates, 'line', ['#ef4444']);
	});

	stabilityOptions = computed(() => {
		const { dates, stats } = this.dashboardData();
		const data = dates.map((d) => {
			const s = stats.dateMap.get(d)!;
			return s.totalRecs > 0 ? parseFloat(((s.successRecs / s.totalRecs) * 100).toFixed(1)) : 0;
		});
		return this._cfg([{ name: '% Registros Estables', data }], dates, 'bar', ['#3b82f6'], 100);
	});

	kpis = computed(() => {
		const { stats, dates } = this.dashboardData();

		// Per Area Calculation
		const areas = Array.from(stats.activeAreas).sort();
		const areaKpis: any[] = []; // AreaKpi[]

		for (const area of areas) {
			let work = 0;
			let total = 0;
			let operSum = 0;
			let count = 0;

			// Iterate dates for this area
			dates.forEach((d) => {
				const dA = stats.areaDateMap.get(d)?.get(area);
				if (dA) {
					work += dA.work;
					total += dA.total;
					operSum += dA.operSum;
					count += dA.count;
				}
			});

			areaKpis.push({
				area,
				operativity: count > 0 ? (operSum / count) * 100 : 0,
				workTime: work,
				totalTime: total,
				stopTime: Math.max(0, total - work),
				stability: 0, // Placeholder
			});
		}
		return areaKpis;
	});

	ngOnInit() {
		this.loadData();
	}

	private loadData() {
		this.isLoading.set(true);
		const f = this.currentFilters();
		console.log('OA DEBUG: Loading data with filters:', f);

		// Ejecutamos la petición y el timer en paralelo
		forkJoin([
			this._service.getOperationalEfficiency({
				startDate: f.startDate,
				endDate: f.endDate,
				partNumberId: '',
				area: '',
				leader: '',
				supervisor: '',
			}),
			timer(5000), // Reducimos un poco el tiempo de espera para mejor UX
		]).subscribe({
			next: ([response]) => {
				console.log('OA DEBUG: API Response received:', response);
				const list = Array.isArray(response) ? response : response ? [response] : [];

				// Seteamos los datos base
				this._baseData.set(list);

				// "Pre-calentamos" el computed para que el procesamiento ocurra antes de ocultar el loader
				// Esto hace que el procesamiento sea "en paralelo" a la visualización del mensaje final
				console.log('OA DEBUG: Pre-processing data...');
				this.dashboardData();

				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('OA DEBUG: Error fetching data:', err);
				this.isLoading.set(false);
			},
		});
	}

	onFiltersChange(newF: FilterState) {
		const oldF = this.currentFilters();

		const dateChanged = newF.startDate !== oldF.startDate || newF.endDate !== oldF.endDate;
		const areaChanged = newF.area !== oldF.area;
		const supChanged = newF.supervisor !== oldF.supervisor;

		if (supChanged && newF.supervisor) {
			const record = this._flatData().find((d) => d.supervisor === newF.supervisor);
			if (record) {
				newF.area = record.area;
			}
			newF.leader = ''; // Clearing leader when supervisor changes
		} else if (areaChanged) {
			newF.supervisor = '';
			newF.leader = '';
		}

		this.currentFilters.set(newF);
		if (dateChanged) {
			this.loadData();
		}
	}

	onOpenDetails(ev: { title: string; records: any[] }) {
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
								text: `META: ${target}${type === 'line' || type === 'area' || type === 'bar' ? '%' : ''}`,
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
				formatter: (val: number) => (type !== 'column' && type !== 'bar' ? `${val}` : val),
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
		};
	}
}
