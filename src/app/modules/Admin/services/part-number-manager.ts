import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartNumberInterface {
  id: string;
  active: boolean;
  createDate: Date;
  createBy: string;

  partNumberName: string;
  partNumberDescription: string;
  snp: string;

  productionModel: string;
  productionLocation: string;
  productionArea: string;
}

export interface CreatePartNumberInterface {
  createBy: string;
  partNumberName: string;
  partNumberDescription: string;
  snp: string;
  productionModelId: string;
  productionLocationId: string;
  productionAreaId: string;
}

const API_URL = environment.baseUrl + '/DataProductionPartNumber';


@Injectable({
  providedIn: 'root'
})
export class PartNumberManager {
  private readonly _http = inject(HttpClient);

  constructor() { }

  getPartNumbers(): Observable<PartNumberInterface[]> {
    return this._http.get<PartNumberInterface[]>(`${API_URL}/v1/get-all`);
  }

  getPartNumberById(id: string): Observable<PartNumberInterface> {
    return this._http.get<PartNumberInterface>(`${API_URL}/part-number/${id}`);
  }

  createPartNumber(partNumber: CreatePartNumberInterface): Observable<PartNumberInterface> {
    return this._http.post<PartNumberInterface>(`${API_URL}/v1/create`, partNumber);
  }

  updatePartNumber(partNumber: PartNumberInterface): Observable<PartNumberInterface> {
    return this._http.put<PartNumberInterface>(`${API_URL}/v1/update/${partNumber.id}`, partNumber);
  }

  deletePartNumber(id: string): Observable<void> {
    return this._http.delete<void>(`${API_URL}/part-number/${id}`);
  }
}
