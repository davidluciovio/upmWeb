import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lider } from '../interfaces/lider.interface';
const baseURL = environment.baseURL + '/line';

@Injectable({
  providedIn: 'root'
})
export class LineService {
  private _http = inject(HttpClient);
  //
  //
  constructor() { }
  //
  //
  GetByLiders(lidersIds: string[]): Observable<Lider[]> {
    return this._http.get<Lider[]>(`${baseURL}/by-liders`,{
      params: {
        liderIds: lidersIds.map(String)
      }
    });
  }
}

