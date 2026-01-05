import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	OperationalEfficiencyService,
	OperationalEfficiencyResponseInterface,
	ProductionDetailInterface,
} from './services/operational-efficiency.service';
import { FilterState, FiltersComponent } from '../achievement-dashboard/components/filters/filters';
import { Charts, ChartOptions } from '../../../../shared/components/charts/charts';
import { EffKpiCardsComponent } from './components/eff-kpi-cards/eff-kpi-cards';
import { EffDetailModalComponent, EfficiencyDetailData } from './components/eff-detail-modal/eff-detail-modal';
import { EffHierarchyTableComponent, EffSupervisorNode } from './components/tables/eff-hierarchy-table/eff-hierarchy-table';
import { EffPartsTableComponent, EffPartNode } from './components/tables/eff-parts-table/eff-parts-table';

interface FlatRecord {
	leader: string;
	part: string;
	area: string;
	supervisor: string;
	date: string;
	shift: string;
	work: number;
	total: number;
	real: number;
	neck: number;
	metrics: any;
}

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
	private _baseData = signal<FlatRecord[]>([]);
	trendViewMode = signal<'general' | 'area'>('area');

	currentFilters = signal<FilterState>(
		(() => {
			const end = new Date();
			const start = new Date();
			start.setDate(end.getDate() - 30);
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

	// --- FILTER OPTIONS COMPUTED ---
	// Computed: Data filtrada localmente para evitar tráfico innecesario
	rawData = computed(() => {
		const data = this._baseData();
		const f = this.currentFilters();

		if (!f.area && !f.supervisor && !f.leader && !f.partNumber) return data;

		return data.filter((d) => {
			return (
				(!f.area || d.area === f.area) &&
				(!f.supervisor || d.supervisor === f.supervisor) &&
				(!f.leader || d.leader === f.leader) &&
				(!f.partNumber || d.part === f.partNumber)
			);
		});
	});

	areas = computed(() => [...new Set(this._baseData().map((r) => r.area))].sort());
	supervisors = computed(() => {
		const f = this.currentFilters();
		let data = this._baseData();
		if (f.area) data = data.filter((r) => r.area === f.area);
		return [...new Set(data.map((r) => r.supervisor))].sort();
	});
	leaders = computed(() => {
		const f = this.currentFilters();
		let data = this._baseData();
		if (f.area) data = data.filter((r) => r.area === f.area);
		if (f.supervisor) data = data.filter((r) => r.supervisor === f.supervisor);
		return [...new Set(data.map((r) => r.leader))].sort();
	});
	parts = computed(() => {
		const f = this.currentFilters();
		let data = this._baseData();
		if (f.area) data = data.filter((r) => r.area === f.area);
		if (f.supervisor) data = data.filter((r) => r.supervisor === f.supervisor);
		if (f.leader) data = data.filter((r) => r.leader === f.leader);
		return [...new Set(data.map((r) => r.part))].sort();
	});

	// --- MAIN DASHBOARD DATA COMPUTED ---
	dashboardData = computed(() => {
		const data = this.rawData();
		const f = this.currentFilters();
		const mode = this.trendViewMode();

		const filtered = data;

		const stats = {
			kpis: { work: 0, total: 0 },
			dateMap: new Map<string, { work: number; total: number; totalRecs: number; successRecs: number }>(),
			areaDateMap: new Map<string, Map<string, { work: number; total: number }>>(),
			shiftMap: new Map<string, { work: number; total: number }>(),
			leaderDownMap: new Map<string, number>(),
			hierarchyMap: new Map<string, EffSupervisorNode>(),
			partsMap: new Map<string, EffPartNode>(),
			activeAreas: new Set<string>(),
		};

		for (const r of filtered) {
			stats.activeAreas.add(r.area);

			// KPIs
			stats.kpis.work += r.work;
			stats.kpis.total += r.total;

			// Date Stats
			if (!stats.dateMap.has(r.date)) {
				stats.dateMap.set(r.date, { work: 0, total: 0, totalRecs: 0, successRecs: 0 });
			}
			const dS = stats.dateMap.get(r.date)!;
			dS.work += r.work;
			dS.total += r.total;
			dS.totalRecs++;
			if ((r.metrics.operativityPercent || 0) >= 0.85) dS.successRecs++;

			// Area Stats (for Trend Area mode)
			if (mode === 'area') {
				if (!stats.areaDateMap.has(r.date)) stats.areaDateMap.set(r.date, new Map());
				const aMap = stats.areaDateMap.get(r.date)!;
				if (!aMap.has(r.area)) aMap.set(r.area, { work: 0, total: 0 });
				const aS = aMap.get(r.area)!;
				aS.work += r.work;
				aS.total += r.total;
			}

			// Shift Stats
			if (!stats.shiftMap.has(r.shift)) stats.shiftMap.set(r.shift, { work: 0, total: 0 });
			const sS = stats.shiftMap.get(r.shift)!;
			sS.work += r.work;
			sS.total += r.total;

			// Leader Downtime (Pareto) - Downtime = Total - Work
			const downtime = r.total - r.work;
			stats.leaderDownMap.set(r.leader + ' - ' + r.area, (stats.leaderDownMap.get(r.leader + '-' + r.area) || 0) + downtime);

			// Hierarchy Table
			if (!stats.hierarchyMap.has(r.supervisor)) {
				stats.hierarchyMap.set(r.supervisor, { name: r.supervisor, area: r.area, work: 0, total: 0, oper: 0, leaders: [], records: [] });
			}
			const supNode = stats.hierarchyMap.get(r.supervisor)!;
			supNode.work += r.work;
			supNode.total += r.total;

			let leaderNode = supNode.leaders.find((l) => l.name === r.leader);
			if (!leaderNode) {
				leaderNode = { name: r.leader, work: 0, total: 0, oper: 0, records: [] };
				supNode.leaders.push(leaderNode);
			}
			leaderNode.work += r.work;
			leaderNode.total += r.total;
			leaderNode.records.push({ date: r.date, work: r.work, total: r.total });
			supNode.records.push({ date: r.date, work: r.work, total: r.total });

			// Parts Table
			if (!stats.partsMap.has(r.part)) {
				stats.partsMap.set(r.part, { number: r.part, area: r.area, work: 0, total: 0, oper: 0, records: [] });
			}
			const pNode = stats.partsMap.get(r.part)!;
			pNode.work += r.work;
			pNode.total += r.total;
			pNode.records.push({ date: r.date, work: r.work, total: r.total });
		}

		// Calculate Percents
		const hData = Array.from(stats.hierarchyMap.values()).map((s) => ({
			...s,
			oper: s.total > 0 ? (s.work / s.total) * 100 : 0,
			leaders: s.leaders.map((l) => ({ ...l, oper: l.total > 0 ? (l.work / l.total) * 100 : 0 })),
		}));

		const pData = Array.from(stats.partsMap.values()).map((p) => ({
			...p,
			oper: p.total > 0 ? (p.work / p.total) * 100 : 0,
		}));

		return {
			stats,
			dates: Array.from(stats.dateMap.keys()).sort(),
			hierarchy: hData,
			parts: pData,
		};
	});

	// --- CHART OPTIONS COMPUTED ---

	trendOptions = computed(() => {
		const { dates, stats } = this.dashboardData();
		const mode = this.trendViewMode();

		if (mode === 'general') {
			const data = dates.map((d) => {
				const s = stats.dateMap.get(d)!;
				return s.total > 0 ? parseFloat(((s.work / s.total) * 100).toFixed(1)) : 0;
			});
			return this._cfg([{ name: 'Avg Operativity %', data }], dates, 'area', ['#10b981'], 100);
		}

		const series = Array.from(stats.activeAreas)
			.sort()
			.map((area) => ({
				name: area,
				data: dates.map((d) => {
					const val = stats.areaDateMap.get(d)?.get(area);
					return val && val.total > 0 ? parseFloat(((val.work / val.total) * 100).toFixed(1)) : 0;
				}),
			}));
		return this._cfg(series, dates, 'line', undefined, 100);
	});

	shiftOptions = computed(() => {
		const { stats } = this.dashboardData();
		const shifts = Array.from(stats.shiftMap.keys()).sort();
		const data = shifts.map((s) => {
			const v = stats.shiftMap.get(s)!;
			return v.total > 0 ? parseFloat(((v.work / v.total) * 100).toFixed(1)) : 0;
		});
		return this._cfg(
			[{ name: 'Operativity %', data }],
			shifts.map((s) => `Shift ${s}`),
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
			...this._cfg([{ name: 'Downtime (min)', data }], cats, 'bar', ['#ef4444']),
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
		return this._cfg([{ name: 'Downtime (min)', data }], dates, 'line', ['#ef4444']);
	});

	stabilityOptions = computed(() => {
		const { dates, stats } = this.dashboardData();
		const data = dates.map((d) => {
			const s = stats.dateMap.get(d)!;
			return s.totalRecs > 0 ? parseFloat(((s.successRecs / s.totalRecs) * 100).toFixed(1)) : 0;
		});
		return this._cfg([{ name: '% Stable Records', data }], dates, 'bar', ['#3b82f6'], 100);
	});

	kpis = computed(() => {
		const { stats } = this.dashboardData();
		const k = stats.kpis;

		let totalRecs = 0;
		let totalSuccess = 0;
		stats.dateMap.forEach((v) => {
			totalRecs += v.totalRecs;
			totalSuccess += v.successRecs;
		});

		return {
			operativity: k.total > 0 ? (k.work / k.total) * 100 : 0,
			workTime: k.work,
			totalTime: k.total,
			stopTime: Math.max(0, k.total - k.work),
			stability: totalRecs > 0 ? (totalSuccess / totalRecs) * 100 : 0,
		};
	});

	ngOnInit() {
		this.loadData();
	}

	private loadData() {
		this.isLoading.set(true);
		const f = this.currentFilters();
		console.log('OA DEBUG: Loading data with filters:', f);

		this._service
			.getOperationalEfficiency({
				starDate: f.startDate,
				endDate: f.endDate,
				partNumberId: '',
				area: '',
				leader: '',
				supervisor: '',
			})
			.subscribe({
				next: (response) => {
					console.log('OA DEBUG: API Response received:', response);
					const flat: FlatRecord[] = [];

					// Ensure we have a list to iterate over
					const list = Array.isArray(response) ? response : response ? [response] : [];

					if (list.length === 0) {
						console.warn('OA DEBUG: API response is empty or null');
					}

					list.forEach((root) => {
						const dataObj = root?.data || {};
						Object.keys(dataObj).forEach((leaderName) => {
							const parts = dataObj[leaderName] || {};
							Object.keys(parts).forEach((partName) => {
								const areas = parts[partName] || {};
								Object.keys(areas).forEach((areaName) => {
									const supervisors = areas[areaName] || {};
									Object.keys(supervisors).forEach((supName) => {
										const records = supervisors[supName] || [];
										records.forEach((rec) => {
											if (!rec) return;
											flat.push({
												leader: leaderName,
												part: partName,
												area: areaName,
												supervisor: supName,
												date: rec.productionDate ? rec.productionDate.split('T')[0] : 'N/A',
												shift: rec.shift || 'N/A',
												work: rec.metrics?.realWorkingTime ?? 0,
												total: rec.metrics?.totalTime ?? 0,
												real: rec.metrics?.productionReal ?? 0,
												neck: rec.metrics?.neck ?? 0,
												metrics: rec.metrics || {},
											});
										});
									});
								});
							});
						});
					});

					console.log('OA DEBUG: Final flat records count:', flat.length);
					this._baseData.set(flat);
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
		const data = this._baseData();

		const dateChanged = newF.startDate !== oldF.startDate || newF.endDate !== oldF.endDate;
		const areaChanged = newF.area !== oldF.area;
		const supChanged = newF.supervisor !== oldF.supervisor;

		if (supChanged && newF.supervisor) {
			const match = data.find((d) => d.supervisor === newF.supervisor);
			if (match) newF.area = match.area;
			newF.leader = '';
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
				formatter: (val: number) => (type !== 'column' && type !== 'bar' ? `${val}%` : val),
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
