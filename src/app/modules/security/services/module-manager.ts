import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = environment.baseUrl + '/DataSecurityModule';

export interface ModuleResponseInterface {
	id: string;
	active: boolean;
	module: string;
	icon: string;
	route: string;
}

export interface ModuleRequestInterface {
	active: boolean;
	createBy: string;
	module: string;
	icon: string;
	route: string;
}

@Injectable({
	providedIn: 'root',
})
export class ModuleManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getModules(): Observable<ModuleResponseInterface[]> {
		return this._http.get<ModuleResponseInterface[]>(`${API_URL}/v1/get-all`);
	}

	createModule(createDto: ModuleRequestInterface): Observable<ModuleResponseInterface> {
		return this._http.post<ModuleResponseInterface>(`${API_URL}/v1/create`, createDto);
	}

	updateModule(id: string, updateDto: ModuleRequestInterface): Observable<ModuleResponseInterface> {
		return this._http.post<ModuleResponseInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deleteModule(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/module/${id}`);
	}
}
