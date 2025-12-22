import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/OperationalEfficiency';

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
	starDate: string;
	endDate: string;
	partNumberId: string;
	area: string;
	leader: string;
	supervisor: string;
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
}
