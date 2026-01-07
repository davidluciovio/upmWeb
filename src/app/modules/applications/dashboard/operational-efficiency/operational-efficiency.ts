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
	// --- FILTERS LOGIC MOVED TO SERVICE ---
	// We still need computed signals for dropdowns to work properly,
	// but we will simplify them to extract from the RAW response if needed,
	// OR (Better) let the service helper extract them.
	// For now, to keep it simple and consistent with previous refactor:

	// Helper to extract unique values from raw complex object
	private _extractValues(key: 'area' | 'supervisor' | 'leader' | 'part', f: FilterState): string[] {
		// This is a bit inefficient to trace deep objects every time, but required since we don't flat here.
		// Alternatively, we could ask the service to return metadata.
		// For consistency with "Achievement" refactor which kept filters in component:
		// Achievement had flat "partInfo". Here we have deep nested structure.
		// Let's implement a lightweight extractor or rely on the flattened concept inside service?
		// Actually, to display dropdowns BEFORE processing, we need raw traversal.

		const values = new Set<string>();
		const data = this._baseData();

		// To replicate the original logic perfectly without FlatRecord available locally:
		// We iterate the Raw Response.
		data.forEach((root) => {
			const d = root.data || {};
			Object.keys(d).forEach((l) => {
				// Leader
				if (key === 'leader' && (!f.area || this._checkArea(d, l, f.area)) && (!f.supervisor || this._checkSup(d, l, f.supervisor))) {
					values.add(l);
				}

				const parts = d[l] || {};
				Object.keys(parts).forEach((p) => {
					// Part
					if (
						key === 'part' &&
						(!f.area || this._checkAreaPart(parts, p, f.area)) &&
						(!f.supervisor || this._checkSupPart(parts, p, f.supervisor)) &&
						(!f.leader || f.leader === l)
					) {
						values.add(p);
					}

					const areas = parts[p] || {};
					Object.keys(areas).forEach((a) => {
						// Area
						if (key === 'area') values.add(a);

						const sups = areas[a] || {};
						Object.keys(sups).forEach((s) => {
							// Supervisor
							if (key === 'supervisor' && (!f.area || f.area === a)) {
								values.add(s);
							}
						});
					});
				});
			});
		});
		return [...values].sort();
	}
	// Helpers for deep check (simplified for readability, actual logic implies we just traverse)
	// Since the previous code used a FLAT list, it was O(N). Now we have a Tree.
	// Traiversing the tree is actually faster than iterating a huge flat list if we prune branches.

	// Actually, let's keep it simple. The exact logic from before:
	areas = computed(() => {
		const values = new Set<string>();
		this._baseData().forEach((r) => {
			const d = r.data || {};
			Object.values(d).forEach((parts) => Object.values(parts).forEach((areas) => Object.keys(areas).forEach((a) => values.add(a))));
		});
		return [...values].sort();
	});

	supervisors = computed(() => {
		const f = this.currentFilters();
		const values = new Set<string>();
		this._baseData().forEach((r) => {
			const d = r.data || {};
			Object.values(d).forEach((parts) =>
				Object.values(parts).forEach((areas) => {
					Object.keys(areas).forEach((a) => {
						if (!f.area || f.area === a) {
							Object.keys(areas[a]).forEach((s) => values.add(s));
						}
					});
				}),
			);
		});
		return [...values].sort();
	});

	leaders = computed(() => {
		const f = this.currentFilters();
		const values = new Set<string>();
		this._baseData().forEach((r) => {
			const d = r.data || {};
			Object.keys(d).forEach((l) => {
				// complex check: is this leader present in the filtered scope?
				// We need to check if ANY of the underlying data for this leader matches filter
				// Leader is top level.
				let valid = false;
				const parts = d[l];
				// Deep check if any part->area->sup matches
				Object.values(parts).forEach((areas) => {
					Object.keys(areas).forEach((a) => {
						if (!f.area || f.area === a) {
							const sups = areas[a];
							Object.keys(sups).forEach((s) => {
								if (!f.supervisor || f.supervisor === s) valid = true;
							});
						}
					});
				});
				if (valid) values.add(l);
			});
		});
		return [...values].sort();
	});

	parts = computed(() => {
		const f = this.currentFilters();
		const values = new Set<string>();
		this._baseData().forEach((r) => {
			const d = r.data || {};
			Object.keys(d).forEach((l) => {
				if (f.leader && f.leader !== l) return;
				const parts = d[l];
				Object.keys(parts).forEach((p) => {
					let valid = false;
					const areas = parts[p];
					Object.keys(areas).forEach((a) => {
						if (!f.area || f.area === a) {
							const sups = areas[a];
							Object.keys(sups).forEach((s) => {
								if (!f.supervisor || f.supervisor === s) valid = true;
							});
						}
					});
					if (valid) values.add(p);
				});
			});
		});
		return [...values].sort();
	});

	// --- MAIN DASHBOARD DATA COMPUTED ---
	// --- MAIN DASHBOARD DATA COMPUTED ---
	dashboardData = computed(() => {
		return this._service.processData(this._baseData(), this.currentFilters(), this.trendViewMode());
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

	// --- Helper Methods for Filters ---
	private _checkArea(d: any, leader: string, area: string): boolean {
		const parts = d[leader] || {};
		return Object.values(parts).some((areas: any) => !!areas[area]);
	}
	private _checkSup(d: any, leader: string, sup: string): boolean {
		const parts = d[leader] || {};
		return Object.values(parts).some((areas: any) => Object.values(areas).some((sups: any) => !!sups[sup]));
	}
	private _checkAreaPart(parts: any, part: string, area: string): boolean {
		const areas = parts[part] || {};
		return !!areas[area];
	}
	private _checkSupPart(parts: any, part: string, sup: string): boolean {
		const areas = parts[part] || {};
		return Object.values(areas).some((sups: any) => !!sups[sup]);
	}

	ngOnInit() {
		this.loadData();
	}

	private loadData() {
		this.isLoading.set(true);
		const f = this.currentFilters();
		console.log('OA DEBUG: Loading data with filters:', f);

		setTimeout(() => {
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
						// Guardamos la respuesta RAW
						const list = Array.isArray(response) ? response : response ? [response] : [];
						if (list.length === 0) console.warn('OA DEBUG: API response is empty or null');

						this._baseData.set(list);
						this.isLoading.set(false);
					},
					error: (err) => {
						console.error('OA DEBUG: Error fetching data:', err);
						this.isLoading.set(false);
					},
				});
		}, 5000);
	}

	onFiltersChange(newF: FilterState) {
		const oldF = this.currentFilters();
		const data = this._baseData();

		const dateChanged = newF.startDate !== oldF.startDate || newF.endDate !== oldF.endDate;
		const areaChanged = newF.area !== oldF.area;
		const supChanged = newF.supervisor !== oldF.supervisor;

		if (supChanged && newF.supervisor) {
			// Logic to auto-fill area based on supervisor
			// Requires iterating raw data:
			const data = this._baseData();
			let foundArea = '';

			// Find first occurrence of supervisor and get its area
			outerLoop: for (const root of data) {
				const d = root.data || {};
				for (const l of Object.keys(d)) {
					const parts = d[l];
					for (const p of Object.keys(parts)) {
						const areas = parts[p];
						for (const a of Object.keys(areas)) {
							const sups = areas[a];
							if (sups[newF.supervisor]) {
								foundArea = a;
								break outerLoop;
							}
						}
					}
				}
			}

			if (foundArea) newF.area = foundArea;
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
