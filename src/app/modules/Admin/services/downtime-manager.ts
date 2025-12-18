import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

const API_URL = environment.baseUrl + '/DataProductionDowntime';

export interface DowntimeResponseInterface {
    id: string;
    active: boolean;
    downtimeDescription: string;
    inforCode: string;
    plcCode: string;
    isDirectDowntime: boolean;
    programable: boolean;
}

export interface DowntimeRequestInterface {
    downtimeDescription: string;
    inforCode: string;
    plcCode: string;
    isDirectDowntime: boolean;
    programable: boolean;
    createBy: string;
    updateBy?: string;
}


@Injectable({
  providedIn: 'root'
})
export class DowntimeManager {

  private readonly _http = inject(HttpClient);
  
  constructor() { }

  getDowntimes(): Observable<DowntimeResponseInterface[]> {
    return this._http.get<DowntimeResponseInterface[]>(`${API_URL}/v1/get-all`);
  }

  getDowntimeById(id: string): Observable<DowntimeResponseInterface> {
    return this._http.get<DowntimeResponseInterface>(`${API_URL}/v1/get/${id}`);
  }

  createDowntime(downtime: DowntimeRequestInterface): Observable<DowntimeResponseInterface> {
    return this._http.post<DowntimeResponseInterface>(`${API_URL}/v1/create`, downtime);
  }

  updateDowntime(downtime: DowntimeResponseInterface): Observable<DowntimeResponseInterface> {
    return this._http.post<DowntimeResponseInterface>(`${API_URL}/v1/update/${downtime.id}`, downtime);
  }

  deleteDowntime(id: string): Observable<void> {
    return this._http.delete<void>(`${API_URL}/v1/delete/${id}`);
  }

}
