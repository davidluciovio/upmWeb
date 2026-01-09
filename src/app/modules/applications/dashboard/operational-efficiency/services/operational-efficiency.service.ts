import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';
import { FilterState } from '../../achievement-dashboard/components/filters/filters';
import { EffSupervisorNode } from '../components/tables/eff-hierarchy-table/eff-hierarchy-table';
import { EffPartNode } from '../components/tables/eff-parts-table/eff-parts-table';

const API_URL = environment.baseUrl + '/OperationalEfficiency';

// --- API Interfaces ---
export interface MetricsInterface {
	hp: number;
	neck: number;
	realTime: number;
	productionReal: number;
	totalTime: number;
	realWorkingTime: number;
	operativityPercent: number;
	downtimePercent: number;
	totalDowntime: number;
	noReportedTime: number;
}

export interface ProductionDetailInterface {
	productionDate: string;
	metrics: MetricsInterface;
	shift: string;
	active: boolean;
}

export interface OperationalEfficiencyResponseInterface {
	data: Record<string, Record<string, Record<string, Record<string, ProductionDetailInterface[]>>>>;
}

export interface OperationalEfficiencyRequestInterface {
	startDate: string;
	endDate: string;
	partNumberId: string;
	area: string;
	leader: string;
	supervisor: string;
}

// --- Internal Data Interfaces ---
export interface FlatRecord {
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

export interface DashboardStats {
	stats: {
		kpis: { work: number; total: number };
		dateMap: Map<string, { work: number; total: number; totalRecs: number; successRecs: number; operSum: number; count: number }>;
		areaDateMap: Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>;
		leaderDateMap: Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>;
		supervisorDateMap: Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>;
		shiftMap: Map<string, { work: number; total: number; operSum: number; count: number }>;
		leaderDownMap: Map<string, number>;
		hierarchyMap: Map<string, EffSupervisorNode>;
		partsMap: Map<string, EffPartNode>;
		activeAreas: Set<string>;
	};
	dates: string[];
	hierarchy: any[];
	parts: any[];
}

@Injectable({
	providedIn: 'root',
})
export class OperationalEfficiencyService {
	private readonly http = inject(HttpClient);

	constructor() {}

	public getOperationalEfficiency(request: OperationalEfficiencyRequestInterface): Observable<OperationalEfficiencyResponseInterface[]> {
		return this.http.post<OperationalEfficiencyResponseInterface[]>(`${API_URL}/v1/post-grouped-production`, request).pipe(
			catchError((error) => {
				console.error('Error al obtener los datos de eficiencia operativa:', error);
				return of([]);
			}),
			map((response) => {
				return response;
			}),
		);
	}

		public flattenData(response: OperationalEfficiencyResponseInterface[]): FlatRecord[] {
			const flat: FlatRecord[] = [];
			const list = Array.isArray(response) ? response : response ? [response] : [];
	
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
			return flat;
		}
	
		public processData(flat: FlatRecord[], f: FilterState, mode: 'general' | 'area'): DashboardStats {
			// 1. Flatten Data is now pre-processed
	
			// 2. Filter Locally
			const filtered =
				!f.area && !f.supervisor && !f.leader && !f.partNumber
					? flat
					: flat.filter((d) => {
							return (
								(!f.area || d.area === f.area) &&
								(!f.supervisor || d.supervisor === f.supervisor) &&
								(!f.leader || d.leader === f.leader) &&
								(!f.partNumber || d.part === f.partNumber)
							);
						});
	
			// 3. Calculate Stats
			const stats = {
				kpis: { work: 0, total: 0 },
				dateMap: new Map<string, { work: number; total: number; totalRecs: number; successRecs: number; operSum: number; count: number }>(),
				areaDateMap: new Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>(),
				leaderDateMap: new Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>(),
				supervisorDateMap: new Map<string, Map<string, { work: number; total: number; operSum: number; count: number }>>(),
				shiftMap: new Map<string, { work: number; total: number; operSum: number; count: number }>(),
				leaderDownMap: new Map<string, number>(),
				hierarchyMap: new Map<string, EffSupervisorNode & { operSum: number; count: number }>(),
				partsMap: new Map<string, EffPartNode & { operSum: number; count: number }>(),
				activeAreas: new Set<string>(),
			};
	
			for (const r of filtered) {
				stats.activeAreas.add(r.area);
				const opPct = r.metrics.operativityPercent || 0;
	
				// KPIs
				stats.kpis.work += r.work;
				stats.kpis.total += r.total;
	
				// Date Stats
				if (!stats.dateMap.has(r.date)) {
					stats.dateMap.set(r.date, { work: 0, total: 0, totalRecs: 0, successRecs: 0, operSum: 0, count: 0 });
				}
				const dS = stats.dateMap.get(r.date)!;
				dS.work += r.work;
				dS.total += r.total;
				dS.totalRecs++;
				dS.operSum += opPct;
				dS.count++;
				if (opPct >= 0.85) dS.successRecs++;
	
				// Area Stats (for Trend Area mode)
				if (mode === 'area') {
					if (!stats.areaDateMap.has(r.date)) stats.areaDateMap.set(r.date, new Map());
					const aMap = stats.areaDateMap.get(r.date)!;
					if (!aMap.has(r.area)) aMap.set(r.area, { work: 0, total: 0, operSum: 0, count: 0 });
					const aS = aMap.get(r.area)!;
					aS.work += r.work;
					aS.total += r.total;
					aS.operSum += opPct;
					aS.count++;
				}
	
				// Leader Trend Stats
				if (!stats.leaderDateMap.has(r.leader.toUpperCase())) stats.leaderDateMap.set(r.leader.toUpperCase(), new Map());
				const lDateMap = stats.leaderDateMap.get(r.leader.toUpperCase())!;
	
				if (!lDateMap.has(r.date)) lDateMap.set(r.date, { work: 0, total: 0, operSum: 0, count: 0 });
				const lS = lDateMap.get(r.date)!;
				lS.work += r.work;
				lS.total += r.total;
				lS.operSum += opPct;
				lS.count++;
	
				// Supervisor Trend Stats
				if (!stats.supervisorDateMap.has(r.supervisor.toUpperCase())) stats.supervisorDateMap.set(r.supervisor.toUpperCase(), new Map());
				const sDateMap = stats.supervisorDateMap.get(r.supervisor.toUpperCase())!;
	
				if (!sDateMap.has(r.date)) sDateMap.set(r.date, { work: 0, total: 0, operSum: 0, count: 0 });
				const svS = sDateMap.get(r.date)!;
				svS.work += r.work;
				svS.total += r.total;
				svS.operSum += opPct;
				svS.count++;
	
				// Shift Stats
				if (!stats.shiftMap.has(r.shift)) stats.shiftMap.set(r.shift, { work: 0, total: 0, operSum: 0, count: 0 });
				const sS = stats.shiftMap.get(r.shift)!;
				sS.work += r.work;
				sS.total += r.total;
				sS.operSum += opPct;
				sS.count++;
	
				// Leader Downtime (Pareto)
				const downtime = r.total - r.work;
				stats.leaderDownMap.set(r.leader + ' - ' + r.area, (stats.leaderDownMap.get(r.leader + '-' + r.area) || 0) + downtime);
	
				// Hierarchy Table
				if (!stats.hierarchyMap.has(r.supervisor)) {
					stats.hierarchyMap.set(r.supervisor, {
						name: r.supervisor,
						area: r.area,
						work: 0,
						total: 0,
						oper: 0,
						leaders: [],
						records: [],
						operSum: 0,
						count: 0,
					} as any);
				}
				const supNode = stats.hierarchyMap.get(r.supervisor)!;
				supNode.work += r.work;
				supNode.total += r.total;
				supNode.operSum += opPct;
				supNode.count++;
	
				let leaderNode = supNode.leaders.find((l) => l.name === r.leader) as any;
				if (!leaderNode) {
					leaderNode = { name: r.leader, work: 0, total: 0, oper: 0, records: [], operSum: 0, count: 0 };
					supNode.leaders.push(leaderNode);
				}
				leaderNode.work += r.work;
				leaderNode.total += r.total;
				leaderNode.operSum += opPct;
				leaderNode.count++;
				leaderNode.records.push({ date: r.date, work: r.work, total: r.total, oper: opPct * 100 });
				supNode.records.push({ date: r.date, work: r.work, total: r.total, oper: opPct * 100 });
	
				// Parts Table
				if (!stats.partsMap.has(r.part)) {
					stats.partsMap.set(r.part, {
						number: r.part,
						area: r.area,
						supervisor: r.supervisor,
						work: 0,
						total: 0,
						oper: 0,
						records: [],
						operSum: 0,
						count: 0,
					} as any);
				}
				const pNode = stats.partsMap.get(r.part)!;
				pNode.work += r.work;
				pNode.total += r.total;
				pNode.operSum += opPct;
				pNode.count++;
				pNode.records.push({ date: r.date, work: r.work, total: r.total, oper: opPct * 100 });
			}
	
			// Calculate Percents using OperativityPercent Average
			const hData = Array.from(stats.hierarchyMap.values()).map((s) => ({
				...s,
				oper: s.count > 0 ? (s.operSum / s.count) * 100 : 0,
				leaders: s.leaders.map((l: any) => ({ ...l, oper: l.count > 0 ? (l.operSum / l.count) * 100 : 0 })),
			}));
	
			const pData = Array.from(stats.partsMap.values()).map((p) => ({
				...p,
				oper: p.count > 0 ? (p.operSum / p.count) * 100 : 0,
			}));
	
			return {
				stats,
				dates: Array.from(stats.dateMap.keys()).sort(),
				hierarchy: hData,
				parts: pData,
			};
		}}
