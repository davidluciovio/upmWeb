import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { Observable } from 'rxjs';

const API_URL = environment.baseUrl + '/OperationalAnalysis';

@Injectable({
	providedIn: 'root',
})
export class LoadData {
	private readonly http = inject(HttpClient);
	constructor() {}

	public getFiltersData(): Observable<OperationalAnalysisInterface> {
		return this.http.get<OperationalAnalysisInterface>(`${API_URL}/v1/get-filters-data`);
	}

	public getOperationalAnalysisData(): Observable<OperationalAnalysisResponseDto> {
		return this.http.get<OperationalAnalysisResponseDto>(`${API_URL}/v1/get-operational-analysis-data`);
	}
}

export interface OperationalAnalysisInterface {
	startDate: Date;
	endDate: Date;
	leaders: string[];
	partNumbers: string[];
	areas: string[];
	supervisors: string[];
	shifts: string[];
}

export interface OperationalAnalysisResponseDto {
	cards: Card[];
	supervisors: SupervisorElement[];
	partNumbers: PartNumber[];
	areaOperativityDayTrends: AreaOperativityDayTrend[];
}

export interface AreaOperativityDayTrend {
	area: string;
	dayOperativities: DayOperativity[];
}

export interface DayOperativity {
	day: Date;
	operativity: number;
}

export interface Card {
	area: string;
	operativity: number;
}

export interface PartNumber {
	partNumber: string;
	area: string;
	supervisor: string;
	leader: string;
	operativity: number;
}

export interface SupervisorElement {
	supervisor: string;
	area: string;
	operativity: number;
	leaders: LeaderElement[];
}

export interface LeaderElement {
	leader: string;
	operativity: number;
}
