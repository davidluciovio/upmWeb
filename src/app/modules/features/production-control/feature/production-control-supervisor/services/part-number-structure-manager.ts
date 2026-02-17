import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface PartNumberStructureInterface {
	id: string;
	active: boolean;
	createDate: Date;
	createBy: string;
	updateDate: Date;
	updateBy: string;

	partNumberLogisticId: string;
	partNumberLogisticName?: string;
	completePartId: string;
	completePartName: string;

	quantity: number;

	materialSuplierId: string;
	materialSuplierName?: string;
}

export interface CreatePartNumberStructureInterface {
	partNumberLogisticId: string;
	completePartId: string;
	completePartName: string;
	quantity: number;
	materialSuplierId: string;
	createBy: string;
}

export interface UpdatePartNumberStructureInterface {
	id: string;
	partNumberLogisticId: string;
	completePartId: string;
	completePartName: string;
	quantity: number;
	materialSuplierId: string;
	active: boolean;
	updateBy: string;
}

const API_URL = environment.baseUrl + '/PartNumberStructure';

@Injectable({
	providedIn: 'root',
})
export class PartNumberStructureManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getStructures(): Observable<PartNumberStructureInterface[]> {
		return this._http.get<PartNumberStructureInterface[]>(`${API_URL}/v1/get-all`);
	}

	getStructureById(id: string): Observable<PartNumberStructureInterface> {
		return this._http.get<PartNumberStructureInterface>(`${API_URL}/v1/get-by-id/${id}`);
	}

	createStructure(createDto: CreatePartNumberStructureInterface): Observable<PartNumberStructureInterface> {
		return this._http.post<PartNumberStructureInterface>(`${API_URL}/v1/create`, createDto);
	}

	updateStructure(id: string, updateDto: UpdatePartNumberStructureInterface): Observable<PartNumberStructureInterface> {
		return this._http.post<PartNumberStructureInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deleteStructure(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/v1/delete/${id}`);
	}
}
