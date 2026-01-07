import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/ProductionAchievement';

// --- Interfaces de API ---
export interface ProductionAchievementResponseInterface {
	partInfo: PartInfoDto;
	dailyRecords: DailyRecordDto[];
}

export interface PartInfoDto {
	number: string;
	name: string;
	area: string;
	supervisor: string;
	leader: string;
}

export interface DailyRecordDto {
	date: string;
	time?: number;
	obj: number;
	real: number;
}

export interface ProductionAchievementRequestInterface {
	starDate: string;
	endDate: string;
	partNumberId: string;
	area: string;
	leader: string;
	supervisor: string;
}

// --- Interfaces de Procesamiento ---
export interface FilterState {
	startDate: string;
	endDate: string;
	area: string;
	supervisor: string;
	leader: string;
	partNumber: string;
}

export interface DailyRecord {
	date: string;
	obj: number;
	real: number;
}

export interface PartNode {
	number: string;
	area: string;
	supervisor: string;
	obj: number;
	real: number;
	ach: number;
	records: DailyRecord[];
}

export interface LeaderNode {
	name: string;
	obj: number;
	real: number;
	ach: number;
	records: DailyRecord[];
}

export interface SupervisorNode {
	name: string;
	area: string;
	obj: number;
	real: number;
	ach: number;
	leaders: LeaderNode[];
	records: DailyRecord[];
}

export interface DashboardStats {
	kpis: {
		totalObj: number;
		totalReal: number;
		ach: number;
		diff: number;
	};
	hierarchy: SupervisorNode[];
	parts: PartNode[];
	dates: string[];
	chartData: {
		dateStats: Map<string, { obj: number; real: number; totalCount: number; successCount: number }>;
		areaDateMap: Map<string, Map<string, { obj: number; real: number }>>;
		activeAreas: Set<string>;
	};
}

@Injectable({
	providedIn: 'root',
})
export class AchievementDashboardDataService {
	private readonly http = inject(HttpClient);

	constructor() {}

	public getProductionAchievement(request: ProductionAchievementRequestInterface): Observable<ProductionAchievementResponseInterface[]> {
		return this.http.post<ProductionAchievementResponseInterface[]>(`${API_URL}/v1/post-production-achievement`, request).pipe(
			catchError((error) => {
				console.error('Error al obtener los datos de producción:', error);
				return of([]);
			}),
			map((response) => {
				return response.filter((item) => item.dailyRecords.some((record) => record.obj !== 0));
			}),
		);
	}

	public processData(baseData: ProductionAchievementResponseInterface[], f: FilterState, viewMode: 'general' | 'area'): DashboardStats {
		// 1. Filtrado Inicial (Raw Data)
		const data =
			!f.area && !f.supervisor && !f.leader && !f.partNumber
				? baseData
				: baseData.filter((p) => {
						const info = p.partInfo;
						return (
							(!f.area || info.area === f.area) &&
							(!f.supervisor || info.supervisor === f.supervisor) &&
							(!f.leader || info.leader === f.leader) &&
							(!f.partNumber || info.number === f.partNumber)
						);
					});

		// 2. Acumuladores
		const stats = {
			kpis: { totalObj: 0, totalReal: 0 },
			hierarchyMap: new Map<string, SupervisorNode>(),
			leaderMap: new Map<string, LeaderNode>(),
			partsMap: new Map<string, PartNode>(),
			dateStats: new Map<string, { obj: number; real: number; totalCount: number; successCount: number }>(),
			areaDateMap: new Map<string, Map<string, { obj: number; real: number }>>(),
			activeAreas: new Set<string>(),
		};

		// 3. Iteración Unificada
		for (const p of data) {
			const info = p.partInfo;
			stats.activeAreas.add(info.area);

			for (const r of p.dailyRecords) {
				const date = r.date.split('T')[0];
				if ((f.startDate && date < f.startDate) || (f.endDate && date > f.endDate)) continue;

				// OBJETO DE REGISTRO (Lo creamos una vez para reusarlo)
				const recordEntry: DailyRecord = { date, obj: r.obj, real: r.real };

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
				sNode.records.push(recordEntry);

				// --- JERARQUÍA (LÍDER) ---
				const lKey = `${info.supervisor}_${info.leader}`;
				if (!stats.leaderMap.has(lKey)) {
					const newLeader: LeaderNode = { name: info.leader, obj: 0, real: 0, ach: 0, records: [] };
					sNode.leaders.push(newLeader);
					stats.leaderMap.set(lKey, newLeader);
				}
				const lNode = stats.leaderMap.get(lKey)!;
				lNode.obj += r.obj;
				lNode.real += r.real;
				lNode.records.push(recordEntry);

				// --- PARTES ---
				if (!stats.partsMap.has(info.number)) {
					stats.partsMap.set(info.number, {
						number: info.number,
						area: info.area,
						supervisor: info.supervisor,
						obj: 0,
						real: 0,
						ach: 0,
						records: [],
					});
				}
				const pNode = stats.partsMap.get(info.number)!;
				pNode.obj += r.obj;
				pNode.real += r.real;
				pNode.records.push(recordEntry);

				// --- ESTADÍSTICAS POR FECHA Y ÁREA ---
				if (!stats.dateStats.has(date)) {
					stats.dateStats.set(date, { obj: 0, real: 0, totalCount: 0, successCount: 0 });
				}
				const dS = stats.dateStats.get(date)!;
				dS.obj += r.obj;
				dS.real += r.real;
				dS.totalCount++;
				if (r.real >= r.obj) dS.successCount++;

				if (viewMode === 'area') {
					if (!stats.areaDateMap.has(date)) stats.areaDateMap.set(date, new Map());
					const aMap = stats.areaDateMap.get(date)!;
					if (!aMap.has(info.area)) aMap.set(info.area, { obj: 0, real: 0 });
					const aData = aMap.get(info.area)!;
					aData.obj += r.obj;
					aData.real += r.real;
				}
			}
		}

		// 4. Construcción de Respuesta Final
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
			chartData: {
				dateStats: stats.dateStats,
				areaDateMap: stats.areaDateMap,
				activeAreas: stats.activeAreas,
			},
		};
	}
}
