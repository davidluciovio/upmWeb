import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = environment.baseUrl + '/DataSecurityPermission';

export interface PermissionResponseInterface {
    id: string;
    active: boolean;
    permission: string;
    clave: string;
    submoduleId: string;
    submodule: string;
    module: string;
}

export interface PermissionRequestInterface {
    active: boolean;
    createBy: string;
    permission: string;
    clave: string;
    submoduleId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionManager {
  private readonly http = inject(HttpClient);
  constructor() { }

  getPermissions(): Observable<PermissionResponseInterface[]> {
    return this.http.get<PermissionResponseInterface[]>(`${API_URL}/v1/get-all`);
  }

  createPermission(permission: PermissionRequestInterface): Observable<PermissionResponseInterface> {
    return this.http.post<PermissionResponseInterface>(`${API_URL}/v1/create`, permission);
  }

  updatePermission(id: string, permission: PermissionRequestInterface): Observable<PermissionResponseInterface> {
    return this.http.post<PermissionResponseInterface>(`${API_URL}/v1/update/${id}`, permission);
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/v1/delete/${id}`);
  }

}
