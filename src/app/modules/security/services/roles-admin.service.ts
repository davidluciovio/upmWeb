import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

const API_URL = environment.baseUrl + '/RolesAdmin';

@Injectable({
	providedIn: 'root',
})
export class RolesAdminService {
	private readonly _http = inject(HttpClient);

	/**
	 * Obtiene la lista de nombres de roles
	 */
	getRolesNames(): Observable<string[]> {
		return this._http.get<string[]>(API_URL);
	}

	/**
	 * Obtiene los permisos asociados a un rol (claves de permiso)
	 * @param roleName Nombre del rol
	 */
	getRolePermissions(roleName: string): Observable<string[]> {
		return this._http.get<string[]>(`${API_URL}/${roleName}/permisos`);
	}

	/**
	 * Asigna una lista de permisos a un rol
	 * @param roleName Nombre del rol
	 * @param permisosClave Lista de claves de permisos
	 */
	assignPermissionsToRole(roleName: string, permisosClave: string[]): Observable<any> {
		return this._http.post(`${API_URL}/${roleName}/permisos`, permisosClave);
	}
}
