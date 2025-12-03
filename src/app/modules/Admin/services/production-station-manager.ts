import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface ProductionStation {
  id: string;
  active: boolean;
  createBy: string;
  updateBy: string;

  partNumber: string;
  line: string;
  model: string;

  objetiveTime: number;
  netoTime: number;
  operatorQuantity: number;
  partNumberQuantity: number;
}

export interface CreateProductionStation {
  partNumberId: string;
  lineId: string;
  modelId: string;
  createBy: string;
  updateBy: string;

  objetiveTime: number;
  netoTime: number;
  operatorQuantity: number;
  partNumberQuantity: number;
}

export interface UpdateProductionStation {
  partNumberId: string;
  lineId: string;
  modelId: string;
  active: boolean;
  updateBy: string;

  objetiveTime: number;
  netoTime: number;
  operatorQuantity: number;
  partNumberQuantity: number;
}

const API_URL = environment.baseUrl + '/ProductionStation';

@Injectable({
  providedIn: 'root'
})
export class ProductionStationManager {
  private readonly _http = inject(HttpClient);

  constructor() { }

  getProductionStations(): Observable<ProductionStation[]> {
    return this._http.get<ProductionStation[]>(`${API_URL}/v1/get-all`);
  }

  getProductionStationById(id: string): Observable<ProductionStation> {
    return this._http.get<ProductionStation>(`${API_URL}/v1/get-production-station/${id}`);
  }

  createProductionStation(createDto: CreateProductionStation): Observable<ProductionStation> {
    return this._http.post<ProductionStation>(`${API_URL}/v1/create`, createDto);
  }

  updateProductionStation(id: string, updateDto: UpdateProductionStation): Observable<ProductionStation> {
    return this._http.post<ProductionStation>(`${API_URL}/v1/update/${id}`, updateDto);
  }

  deleteProductionStation(id: string): Observable<void> {
    return this._http.delete<void>(`${API_URL}/v1/delete/${id}`);
  }

}
