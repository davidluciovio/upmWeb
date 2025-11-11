import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

export interface ModelInterface {
  id: number;
  active: boolean;
  createDate: Date;
  createBy: string;
  modelDescription: string;
}

export interface CreateModelInterface {
  createBy: string;
  modelDescription: string;
}

const API_URL = environment.baseUrl + '/DataProductionModel';

@Injectable({
  providedIn: 'root',
})
export class ModelManagerService {
  private readonly _http = inject(HttpClient);

  public models = signal<ModelInterface[]>([]);

  getModels(): Observable<ModelInterface[]> {
    return this._http.get<ModelInterface[]>(`${API_URL}/v1/get-all`)
  }  
  
  getModelById(id: number): Observable<ModelInterface> {
    return this._http.get<ModelInterface>(`${API_URL}/model/${id}`);
  }

  createModel(model: CreateModelInterface): Observable<ModelInterface> {
    return this._http.post<ModelInterface>(`${API_URL}/v1/create`, model);
  }

  updateModel(model: ModelInterface): Observable<ModelInterface> {
    return this._http.post<ModelInterface>(`${API_URL}/v1/update/${model.id}`, model);
  }

  deleteModel(id: number): Observable<void> {
    return this._http.delete<void>(`${API_URL}/model/${id}`);
  }
}
