import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartNumberLogisticsInterface {
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

export interface CreatePartNumberLogisticsInterface {
	partNumberId: string;
	areaId: string;
	locationId: string;
	createBy: string;
	updateBy: string;
	snp: number;
}

export interface UpdatePartNumberLogisticsInterface {
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

	getPartNumberLogistics(): Observable<PartNumberLogisticsInterface[]> {
		return this._http.get<PartNumberLogisticsInterface[]>(`${API_URL}/v1/get-all`);
	}

	getPartNumberLogisticsById(id: string): Observable<PartNumberLogisticsInterface> {
		return this._http.get<PartNumberLogisticsInterface>(`${API_URL}/part-number-area/${id}`);
	}

	createPartNumberLogistics(createDto: CreatePartNumberLogisticsInterface): Observable<PartNumberLogisticsInterface> {
		return this._http.post<PartNumberLogisticsInterface>(`${API_URL}/v1/create`, createDto);
	}

	updatePartNumberLogistics(id: string, updateDto: UpdatePartNumberLogisticsInterface): Observable<PartNumberLogisticsInterface> {
		return this._http.post<PartNumberLogisticsInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deletePartNumberLogistics(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/part-number-area/${id}`);
	}
}
