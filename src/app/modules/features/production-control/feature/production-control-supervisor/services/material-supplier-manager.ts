import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface MaterialSupplierRequestDto {
	materialSupplierDescription: string;
	createBy: string;
	updateBy: string;
	active: boolean;
}

export interface MaterialSupplierResponseDto {
	id: string;
	active: boolean;
	createDate: string;
	createBy: string;
	updateDate: string;
	updateBy: string;
	materialSupplierDescription: string;
}

const API_URL = environment.baseUrl + '/MaterialSupplier';

@Injectable({
	providedIn: 'root',
})
export class MaterialSupplierManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getModules(): Observable<MaterialSupplierResponseDto[]> {
		return this._http.get<MaterialSupplierResponseDto[]>(`${API_URL}/v1/get-all`);
	}

	createModule(createDto: MaterialSupplierRequestDto): Observable<MaterialSupplierResponseDto> {
		return this._http.post<MaterialSupplierResponseDto>(`${API_URL}/v1/create`, createDto);
	}

	updateModule(id: string, updateDto: MaterialSupplierRequestDto): Observable<MaterialSupplierResponseDto> {
		return this._http.post<MaterialSupplierResponseDto>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deleteModule(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/v1/delete/${id}`);
	}
}
