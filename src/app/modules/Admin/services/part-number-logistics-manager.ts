import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartNumberAreaInterface {
	id: string;
	active: boolean;
	createDate: Date;
	createBy: string;
	updateDate: Date;
	updateBy: string;

	partNumber: string;
	area: string;
	location: string;
	snp: number;
}

export interface CreatePartNumberAreaInterface {
	partNumberId: string;
	areaId: string;
	locationId: string;
	createBy: string;
	updateBy: string;
	snp: number;
}

export interface UpdatePartNumberAreaInterface {
	partNumberId: string;
	areaId: string;
	locationId: string;
	active: boolean;
	updateBy: string;
	createBy: string;
	snp: number;
}

const API_URL = environment.baseUrl + '/PartNumberArea';

@Injectable({
	providedIn: 'root',
})
export class PartNumberAreaManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getPartNumberAreas(): Observable<PartNumberAreaInterface[]> {
		return this._http.get<PartNumberAreaInterface[]>(`${API_URL}/v1/get-all`);
	}

	getPartNumberAreaById(id: string): Observable<PartNumberAreaInterface> {
		return this._http.get<PartNumberAreaInterface>(`${API_URL}/part-number-area/${id}`);
	}

	createPartNumberArea(createDto: CreatePartNumberAreaInterface): Observable<PartNumberAreaInterface> {
		return this._http.post<PartNumberAreaInterface>(`${API_URL}/v1/create`, createDto);
	}

	updatePartNumberArea(id: string, updateDto: UpdatePartNumberAreaInterface): Observable<PartNumberAreaInterface> {
		return this._http.post<PartNumberAreaInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deletePartNumberArea(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/part-number-area/${id}`);
	}
}
