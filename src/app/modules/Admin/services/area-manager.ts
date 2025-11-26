import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface AreaInterface {
  id: number;
  active: boolean;
  createDate: Date;
  createBy: string;
  areaDescription: string;
}

export interface CreateAreaInterface {
  createBy: string;
  areaDescription: string;
}

const API_URL = environment.baseUrl + '/DataProductionArea';

@Injectable({
  providedIn: 'root',
})
export class AreaManagerService {
  private readonly _http = inject(HttpClient);

  public areas = signal<AreaInterface[]>([]);

  getAreas(): Observable<AreaInterface[]> {
    return this._http.get<AreaInterface[]>(`${API_URL}/v1/get-all`)
  }  
  
  getAreaById(id: number): Observable<AreaInterface> {
    return this._http.get<AreaInterface>(`${API_URL}/area/${id}`);
  }

  createArea(area: CreateAreaInterface): Observable<AreaInterface> {
    return this._http.post<AreaInterface>(`${API_URL}/v1/create`, area);
  }

  updateArea(area: AreaInterface): Observable<AreaInterface> {
    return this._http.post<AreaInterface>(`${API_URL}/v1/update/${area.id}`, area);
  }

  deleteArea(id: number): Observable<void> {
    return this._http.delete<void>(`${API_URL}/area/${id}`);
  }
}