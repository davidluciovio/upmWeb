import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/ForkliftArea';

export interface AreasData {
	id: string;
	areaName: string;
}

export interface ForkliftAreaResponseInterface {
	userId: string;
	userName: string | null;
	dataProductionAreaId: AreasData[];
}

export interface ForkliftAreaRequestInterface {
	dataProductionAreaIds: string[];
}

@Injectable({
	providedIn: 'root',
})
export class ForkliftAreaService {
	private readonly _http = inject(HttpClient);

	getAreasForUser(userId: string): Observable<ForkliftAreaResponseInterface> {
		return this._http.get<ForkliftAreaResponseInterface>(`${API_URL}/${userId}/areas`);
	}

	assignAreasToUser(userId: string, areaIds: string[]): Observable<{ message: string }> {
		const request: ForkliftAreaRequestInterface = {
			dataProductionAreaIds: areaIds,
		};
		return this._http.post<{ message: string }>(`${API_URL}/${userId}/areas`, request);
	}
}
