import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/DataSecurityRole';

export interface RoleResponseInterface {
	id: string;
	name: string;
	normalizedName: string;
}

export interface RoleRequestInterface {
	name: string;
}


@Injectable({
	providedIn: 'root',
})
export class RoleManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getRoles(): Observable<RoleResponseInterface[]> {
		return this._http.get<RoleResponseInterface[]>(`${API_URL}/v1/get-all`);
	}

	createRole(createDto: RoleRequestInterface): Observable<RoleResponseInterface> {
		return this._http.post<RoleResponseInterface>(`${API_URL}/v1/create`, createDto);
	}

	updateRole(id: string, updateDto: RoleRequestInterface): Observable<RoleResponseInterface> {
		return this._http.post<RoleResponseInterface>(`${API_URL}/v1/update/${id}`, updateDto);
	}

	deleteRole(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/role/${id}`);
	}
}
