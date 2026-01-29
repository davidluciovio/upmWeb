import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { Observable, of } from 'rxjs';

const API_URL = environment.baseUrl + '/OperationalAnalysis';

@Injectable({
	providedIn: 'root',
})
export class LoadData {
	private readonly http = inject(HttpClient);
	public logs = signal<string[]>([]);
	public isProcessing = signal<boolean>(false);
	constructor() {}

	public getFiltersData(): Observable<OperationalAnalysisRequestInterface> {
		return this.http.get<OperationalAnalysisRequestInterface>(`${API_URL}/v1/get-filters-data`);
	}

	public getOperationalAnalysisData(params: OperationalAnalysisRequestInterface | null): Observable<OperationalAnalysisResponseInterface> {
		if (!params) {
			return of();
		}
		return this.http.post<OperationalAnalysisResponseInterface>(`${API_URL}/v1/get-operational-analysis-data`, params);
	}

	public async GetStreamSyncData() {
		this.logs.set([]); // Limpiar logs previos
		this.isProcessing.set(true);

		try {
			const response = await fetch(`${API_URL}/v1/get-operational-analysis-sync`);
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) return;

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });

				// El backend envía "data: mensaje\n\n", aquí limpiamos el formato SSE
				const lines = chunk
					.split('\n')
					.filter((line) => line.startsWith('data: '))
					.map((line) => line.replace('data: ', ''));

				// Actualizamos el Signal agregando las nuevas líneas
				this.logs.update((current) => [...current, ...lines]);
			}
		} catch (error) {
			this.logs.update((current) => [...current, '[ERROR]: Conexión perdida']);
		} finally {
			this.isProcessing.set(false);
		}
	}
}

export interface OperationalAnalysisRequestInterface {
	startDate: Date;
	endDate: Date;
	leaders: string[];
	partNumbers: string[];
	areas: string[];
	supervisors: string[];
	shifts: string[];
}

export interface OperationalAnalysisResponseInterface {
	cards: CardOperativity[];
	supervisors: SupervisorOperativity[];
	partNumbers: PartNumberOperativity[];
	areaOperativityDayTrends: AreaOperativityDayTrend[];
	supervisorOperativityDayHeatMaps: SupervisorOperativityDayTrend[];
	annualAreaTrends: AnnualAreaTrend[];
}

export interface AreaOperativityDayTrend {
	area: string;
	dayOperativities: DayOperativity[];
}

export interface SupervisorOperativityDayTrend {
	supervisor: string;
	dayOperativities: DayOperativity[];
	leaders: LeaderOperativityData[];
}

export interface LeaderOperativityData {
	leader: string;
	dayOperativities: DayOperativity[];
}

export interface DayOperativity {
	day: Date;
	operativity: number;
}

export interface CardOperativity {
	area: string;
	operativity: number;
}

export interface PartNumberOperativity {
	partNumber: string;
	area: string;
	supervisor: string;
	leader: string;
	operativity: number;
	dayOperativities?: DayOperativity[];
	shift?: string;
}

export interface SupervisorOperativity {
	supervisor: string;
	area: string;
	operativity: number;
	leaders: LeaderOperativity[];
}

export interface LeaderOperativity {
	leader: string;
	operativity: number;
}

export interface AnnualAreaTrend {
	area: string;
	months: MonthOperativity[];
}

export interface MonthOperativity {
	year: number;
	month: number;
	monthName: string;
	operativity: number;
}

export interface PressGroup {
	pressName: string; // Ej: "BLK I", "TRF 2500 II", "TND"
	totalOperativity: number; // Promedio de operatividad de esta prensa
	parts: PartNumberOperativity[]; // Lista de partes que corren en esta prensa
}
