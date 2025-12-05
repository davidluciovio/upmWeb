import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/DataSecurityRole';

export interface RoleInterface {
	id: string;
	name: string;
	normalizedName: string;
}

@Injectable({
	providedIn: 'root',
})
export class RoleManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getRoles(): Observable<RoleInterface[]> {
		return this._http.get<RoleInterface[]>(`${API_URL}/v1/get-all`);
	}
}
