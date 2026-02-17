import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface PartNumberStructureRequestInterface {
	PartNumberLogisticId: string;
	Quantity: number;
	MaterialSuplierId: string;
	CreateBy: string;
	UpdateBy: string;
	Active: boolean;
}

export interface PartNumberStructureResponseInterface {
	Id: string;
	Active: boolean;
	CreateDate: Date;
	CreateBy: string;
	UpdateDate: Date;
	UpdateBy: string;
	PartNumberLogisticId: string;
	CompletePartId: string;
	CompletePartName: string;
	Quantity: number;
	MaterialSuplierId: string;
	PartNumberLogisticDescription: string;
	MaterialSupplierDescription: string;
}
const API_URL = environment.baseUrl + '/PartNumberStructure';

@Injectable({
	providedIn: 'root',
})
export class PartNumberStructureManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getStructures(): Observable<PartNumberStructureResponseInterface[]> {
		return this._http.get<PartNumberStructureResponseInterface[]>(`${API_URL}/v1/get-all`);
	}

	getStructureById(id: string): Observable<PartNumberStructureResponseInterface> {
		return this._http.get<PartNumberStructureResponseInterface>(`${API_URL}/v1/get-by-id/${id}`);
	}

	createStructure(createDto: PartNumberStructureRequestInterface): Observable<PartNumberStructureResponseInterface> {
		return this._http.post<PartNumberStructureResponseInterface>(`${API_URL}/v1/create`, createDto);
	}

	updateStructure(id: string, updateDto: PartNumberStructureRequestInterface): Observable<PartNumberStructureResponseInterface> {
		return this._http.post<PartNumberStructureResponseInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deleteStructure(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/v1/delete/${id}`);
	}
}
