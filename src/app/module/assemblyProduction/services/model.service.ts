import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Model } from '../interfaces/model.interface';
const baseURL = environment.baseURL + '/model';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private _http = inject(HttpClient);
  //
  //
  constructor() {}
  //
  //
  GetByLines(lineIds: string[], liderIds: string[]): Observable<Model[]> {
    return this._http.get<Model[]>(`${baseURL}`, {
      params: {
        lineIds: lineIds.map(String),
        liderIds: liderIds.map(String),
      },
    });
  }
}
