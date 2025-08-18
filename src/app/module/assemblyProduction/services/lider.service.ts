import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lider } from '../interfaces/lider.interface';
const baseURL = environment.baseURL + '/lider';

@Injectable({
  providedIn: 'root'
})
export class LiderService {
  private _http = inject(HttpClient);
  //
  //
  constructor() { }
  //
  //
  GetAll(): Observable<Lider[]> {
    return this._http.get<Lider[]>(baseURL);
  }
}

