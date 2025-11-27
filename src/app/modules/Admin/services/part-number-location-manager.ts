import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartNumberLocationInterface {
	id: string;
	active: boolean;
	createDate: Date;
	createBy: string;
	updateDate: Date;
	updateBy: string;

	partNumber: string;
	location: string;
	partNumberId: string;
	locationId: string;
}

export interface CreatePartNumberLocationInterface {
	partNumberId: string;
	locationId: string;
	createBy: string;
	updateBy: string;
}

export interface UpdatePartNumberLocationInterface {
	partNumberId: string;
	locationId: string;
	active: boolean;
	updateBy: string;
	createBy: string;
}

const API_URL = environment.baseUrl + '/PartNumberLocation';

@Injectable({
	providedIn: 'root',
})
export class PartNumberLocationManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getPartNumberLocations(): Observable<PartNumberLocationInterface[]> {
		return this._http.get<PartNumberLocationInterface[]>(`${API_URL}/v1/get-all`);
	}

	getPartNumberLocationById(id: string): Observable<PartNumberLocationInterface> {
		return this._http.get<PartNumberLocationInterface>(`${API_URL}/part-number-location/${id}`);
	}

	createPartNumberLocation(createDto: CreatePartNumberLocationInterface): Observable<PartNumberLocationInterface> {
		return this._http.post<PartNumberLocationInterface>(`${API_URL}/v1/create`, createDto);
	}

	updatePartNumberLocation(id: string, updateDto: UpdatePartNumberLocationInterface): Observable<PartNumberLocationInterface> {
		return this._http.post<PartNumberLocationInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deletePartNumberLocation(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/part-number-location/${id}`);
	}
}
