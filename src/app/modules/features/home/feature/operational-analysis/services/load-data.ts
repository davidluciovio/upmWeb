import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { Observable, of } from 'rxjs';

const API_URL = environment.baseUrl + '/OperationalAnalysis';

@Injectable({
	providedIn: 'root',
})
export class LoadData {
	private readonly http = inject(HttpClient);
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
