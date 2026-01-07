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

	public getFiltersData(): Observable<FiltersData> {
		return this.http.get<FiltersData>(`${API_URL}/v1/get-filters-data`);
	}

	public getLeaderTrend(filters: any): Observable<LeaderTrendData[]> {
		return this.http.post<LeaderTrendData[]>(`${API_URL}/v1/get-leader-trend`, filters);
	}
}

export interface FiltersData {
	leaders: string[];
	partNumbers: string[];
	areas: string[];
	supervisors: string[];
	shifts: string[];
}

export interface LeaderTrendData {
	leader: string;
	dates: { date: string; value: number }[];
}
