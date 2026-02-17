import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';
import { ProductionStation } from '../../../../../Admin/services/production-station-manager';
import { PartNumberLogisticsInterface } from '../../../../../Admin/services/part-number-logistics-manager';

export interface PartNumberStructureRequestInterface {
	createBy: string;
	updateBy: string;
	active: boolean;
	partNumberLogisticId: string;
	productionStationId: string;
	materialSuplierId: string;
	partNumberName: string;
	partNumberDescription: string;
}

export interface PartNumberStructureResponseInterface {
	id: string;
	active: boolean;
	createDate: Date;
	createBy: string;
	productionStationId: string;
	productionStation: ProductionStation;
	materialSuplierId: string;
	partNumberName: string;
	partNumberDescription: string;
	partNumberLogisticId: string;
	partNumberLogistic: PartNumberLogisticsInterface;
	materialSupplierDescription: string;
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
