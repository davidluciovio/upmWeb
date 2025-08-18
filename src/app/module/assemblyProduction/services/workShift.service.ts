import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkShift } from '../interfaces/workShift.interface';

const baseURL = environment.baseURL + '/workshift';

@Injectable({
  providedIn: 'root',
})
export class WorkShiftService {
  private _http = inject(HttpClient);
  //
  //
  constructor() {}
  //
  //
  GetAll(): Observable<WorkShift[]> {
    return this._http.get<WorkShift[]>(`${baseURL}`);
  }
}
