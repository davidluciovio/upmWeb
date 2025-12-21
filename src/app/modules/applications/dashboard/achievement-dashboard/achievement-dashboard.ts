import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AchievementDashboardDataService, ProductionAchievementResponseInterface } from './services/achievement-dashboard-data.service';
import { FiltersComponent, FilterState } from './components/filters/filters';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards';
import { HierarchyTableComponent, SupervisorNode } from './components/tables/hierarchy-table/hierarchy-table';
import { PartsTableComponent, PartNode } from './components/tables/parts-table/parts-table';
import { Charts, ChartOptions } from '../../../../shared/components/charts/charts';
import { DetailModalComponent, DetailData } from './components/detail-modal/detail-modal';

@Component({
	selector: 'app-achievement-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		FiltersComponent,
		KpiCardsComponent,
		HierarchyTableComponent,
		PartsTableComponent,
		Charts,
		DetailModalComponent,
	],
	templateUrl: './achievement-dashboard.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementDashboardComponent implements OnInit {
	private _dataService = inject(AchievementDashboardDataService);
	detailModal = viewChild(DetailModalComponent);

	// State Signals
	isLoading = signal<boolean>(true);
	rawData = signal<ProductionAchievementResponseInterface[]>([]);

	// View Modes
	trendViewMode = signal<'general' | 'area'>('general');

	// Filter Options Signals
	areas = signal<string[]>([]);
	supervisors = signal<string[]>([]);
	leaders = signal<string[]>([]);
	parts = signal<string[]>([]);

	// Current Filter State
	currentFilters = signal<FilterState>({
		startDate: '2025-12-01',
		endDate: '2025-12-31',
		area: '',
		supervisor: '',
		leader: '',
		partNumber: '',
	});

	// Computed: Filtered Data
	filteredData = computed(() => {
		const data = this.rawData();
		const f = this.currentFilters();

		return data
			.filter((p) => {
				return (
					(!f.area || p.partInfo.area === f.area) &&
					(!f.supervisor || p.partInfo.supervisor === f.supervisor) &&
					(!f.leader || p.partInfo.leader === f.leader) &&
					(!f.partNumber || p.partInfo.number === f.partNumber)
				);
			})
			.map((p) => ({
				...p,
				dailyRecords: p.dailyRecords.filter((r) => {
					const date = r.date.split('T')[0];
					return (!f.startDate || date >= f.startDate) && (!f.endDate || date <= f.endDate);
				}),
			}))
			.filter((p) => p.dailyRecords.length > 0);
	});

	// Computed: KPIs
	kpis = computed(() => {
		let totalObj = 0;
		let totalReal = 0;

		this.filteredData().forEach((p) => {
			p.dailyRecords.forEach((r) => {
				totalObj += r.obj;
				totalReal += r.real;
			});
		});

		const ach = totalObj > 0 ? (totalReal / totalObj) * 100 : 0;
		const diff = totalReal - totalObj;

		return { totalObj, totalReal, ach, diff };
	});

	// Computed: Hierarchy Data
	hierarchyData = computed<SupervisorNode[]>(() => {
		const hierarchy: Record<string, SupervisorNode> = {};

		this.filteredData().forEach((p) => {
			const sup = p.partInfo.supervisor;
			const lid = p.partInfo.leader;
			const area = p.partInfo.area;

			if (!hierarchy[sup]) {
				hierarchy[sup] = { name: sup, area: area, obj: 0, real: 0, ach: 0, leaders: [], records: [] };
			}

			let leaderNode = hierarchy[sup].leaders.find((l) => l.name === lid);
			if (!leaderNode) {
				leaderNode = { name: lid, obj: 0, real: 0, ach: 0, records: [] };
				hierarchy[sup].leaders.push(leaderNode);
			}

			p.dailyRecords.forEach((r) => {
				const rec = { date: r.date.split('T')[0], obj: r.obj, real: r.real };
				hierarchy[sup].obj += r.obj;
				hierarchy[sup].real += r.real;
				hierarchy[sup].records.push(rec);

				leaderNode!.obj += r.obj;
				leaderNode!.real += r.real;
				leaderNode!.records.push(rec);
			});
		});

		return Object.values(hierarchy).map((s) => {
			s.ach = s.obj > 0 ? (s.real / s.obj) * 100 : 0;
			s.leaders.forEach((l) => (l.ach = l.obj > 0 ? (l.real / l.obj) * 100 : 0));
			return s;
		});
	});

	// Computed: Parts Data
	partsData = computed<PartNode[]>(() => {
		const partsMap: Record<string, PartNode> = {};

		this.filteredData().forEach((p) => {
			const pNum = p.partInfo.number;
			if (!partsMap[pNum]) {
				partsMap[pNum] = { number: pNum, area: p.partInfo.area, obj: 0, real: 0, ach: 0 };
			}
			p.dailyRecords.forEach((r) => {
				partsMap[pNum].obj += r.obj;
				partsMap[pNum].real += r.real;
			});
		});

		return Object.values(partsMap).map((p) => ({
			...p,
			ach: p.obj > 0 ? (p.real / p.obj) * 100 : 0,
		}));
	});

	// Chart Options
	trendChartOptions = computed<ChartOptions>(() => {
		const mode = this.trendViewMode();
		const data = this.filteredData();

		if (mode === 'general') {
			const dateMap: Record<string, { obj: number; real: number }> = {};
			data.forEach((p) => {
				p.dailyRecords.forEach((r) => {
					const date = r.date.split('T')[0];
					if (!dateMap[date]) dateMap[date] = { obj: 0, real: 0 };
					dateMap[date].obj += r.obj;
					dateMap[date].real += r.real;
				});
			});
			const dates = Object.keys(dateMap).sort();
			const seriesData = dates.map((d) => {
				const item = dateMap[d];
				return item.obj > 0 ? parseFloat(((item.real / item.obj) * 100).toFixed(1)) : 0;
			});

			return {
				series: [{ name: 'Cumplimiento Total %', data: seriesData }],
				chart: { type: 'area', height: 300, toolbar: { show: true } },
				xaxis: { categories: dates, labels: { rotate: -45, rotateAlways: true } },
				stroke: { curve: 'smooth' as any, width: 3 },
				colors: ['#002855'],
				fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
				dataLabels: { enabled: false },
				yaxis: { labels: { formatter: (val) => val.toFixed(0) + '%' } },
			};
		} else {
			// Area Mode
			const areaDateMap: Record<string, Record<string, { obj: number; real: number }>> = {};
			const allDates = new Set<string>();
			const allAreas = new Set<string>();

			data.forEach((p) => {
				const area = p.partInfo.area;
				allAreas.add(area);
				p.dailyRecords.forEach((r) => {
					const date = r.date.split('T')[0];
					allDates.add(date);
					if (!areaDateMap[date]) areaDateMap[date] = {};
					if (!areaDateMap[date][area]) areaDateMap[date][area] = { obj: 0, real: 0 };

					areaDateMap[date][area].obj += r.obj;
					areaDateMap[date][area].real += r.real;
				});
			});

			const dates = Array.from(allDates).sort();
			const areas = Array.from(allAreas).sort();

			const series = areas.map((area) => {
				return {
					name: area,
					data: dates.map((date) => {
						const dData = areaDateMap[date]?.[area];
						if (!dData || dData.obj === 0) return 0;
						return parseFloat(((dData.real / dData.obj) * 100).toFixed(1));
					}),
				};
			});

			return {
				series: series,
				chart: { type: 'line', height: 300, toolbar: { show: true } },
				xaxis: { categories: dates, labels: { rotate: -45, rotateAlways: true } },
				stroke: { curve: 'smooth' as any, width: 2 },
				fill: { type: 'solid', opacity: 1 },
				dataLabels: { enabled: false },
				yaxis: { labels: { formatter: (val) => val.toFixed(0) + '%' } },
				legend: { show: true, position: 'bottom' },
			};
		}
	});

	successChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		const dateMap: Record<string, { total: number; count: number }> = {};

		data.forEach((p) => {
			p.dailyRecords.forEach((r) => {
				const date = r.date.split('T')[0];
				if (!dateMap[date]) dateMap[date] = { total: 0, count: 0 };
				dateMap[date].total++;
				if (r.real >= r.obj) dateMap[date].count++;
			});
		});

		const dates = Object.keys(dateMap).sort();
		const seriesData = dates.map((d) => {
			const item = dateMap[d];
			return item.total > 0 ? parseFloat(((item.count / item.total) * 100).toFixed(1)) : 0;
		});

		return {
			series: [{ name: '% Part Success', data: seriesData }],
			chart: { type: 'bar', height: 300, toolbar: { show: true } },
			xaxis: { categories: dates, labels: { rotate: -45, rotateAlways: true } },
			colors: ['#10b981'],
			plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
			dataLabels: { enabled: false },
			yaxis: { labels: { formatter: (val) => val.toFixed(0) + '%' } },
		};
	});

	comparisonChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		const dateMap: Record<string, { obj: number; real: number }> = {};

		data.forEach((p) => {
			p.dailyRecords.forEach((r) => {
				const date = r.date.split('T')[0];
				if (!dateMap[date]) dateMap[date] = { obj: 0, real: 0 };
				dateMap[date].obj += r.obj;
				dateMap[date].real += r.real;
			});
		});

		const dates = Object.keys(dateMap).sort();
		const realData = dates.map((d) => Math.round(dateMap[d].real));
		const objData = dates.map((d) => Math.round(dateMap[d].obj));

		return {
			series: [
				{ name: 'Real', type: 'column', data: realData },
				{ name: 'Obj', type: 'line', data: objData },
			],
			chart: { height: 300, type: 'line', toolbar: { show: true } },
			stroke: { width: [0, 3], curve: 'straight' as any },
			xaxis: { categories: dates, labels: { rotate: -45, rotateAlways: true } },
			colors: ['#002855', '#bf9110'],
			plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
			dataLabels: { enabled: false },
		};
	});

	ngOnInit() {
		// Initial fetch
		const request = {
			starDate: '2025-12-01',
			endDate: '2025-12-31',
			partNumberId: '',
			area: '',
			leader: '',
			supervisor: '',
		};

		this._dataService.getProductionAchievement(request).subscribe({
			next: (data) => {
				this.rawData.set(data);
				this.extractFilterOptions(data);
				this.isLoading.set(false);
			},
			error: (err) => {
				console.error(err);
				this.isLoading.set(false);
			},
		});
	}

	extractFilterOptions(data: ProductionAchievementResponseInterface[]) {
		this.areas.set([...new Set(data.map((p) => p.partInfo.area))].sort());
		this.supervisors.set([...new Set(data.map((p) => p.partInfo.supervisor))].sort());
		this.leaders.set([...new Set(data.map((p) => p.partInfo.leader))].sort());
		this.parts.set([...new Set(data.map((p) => p.partInfo.number))].sort());
	}

	onFiltersChange(filters: FilterState) {
		this.currentFilters.set(filters);
	}

	onOpenDetails(event: { title: string; records: any[] }) {
		this.detailModal()?.open({ title: event.title, records: event.records });
	}
}
