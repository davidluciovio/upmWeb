import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/ProductionAchievement';

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
}
