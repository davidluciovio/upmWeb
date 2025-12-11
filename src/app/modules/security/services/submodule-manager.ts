import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = environment.baseUrl + '/DataSecuritySubmodule';

export interface SubmoduleResponseInterface {
    id: string;
    active: boolean;
    submodule: string;
    moduleId: string;
    icon: string;
    route: string;
}

export interface SubmoduleRequestInterface {
    submodule: string;
    moduleId: string;
    icon: string;
    route: string;
    createBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmoduleManager {
  private readonly http = inject(HttpClient);

  constructor() { }

  getSubmodules(): Observable<SubmoduleResponseInterface[]> {
    return this.http.get<SubmoduleResponseInterface[]>(`${API_URL}/v1/get-all`);
  }

  createSubmodule(createDto: SubmoduleRequestInterface): Observable<SubmoduleResponseInterface> {
    return this.http.post<SubmoduleResponseInterface>(`${API_URL}/v1/create`, createDto);
  }

  updateSubmodule(id: string, updateDto: SubmoduleRequestInterface): Observable<SubmoduleResponseInterface> {
    return this.http.post<SubmoduleResponseInterface>(`${API_URL}/v1/update/${id}`, updateDto);
  }

  deleteSubmodule(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/submodule/${id}`);
  }

}
