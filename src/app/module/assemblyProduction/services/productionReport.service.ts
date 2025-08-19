import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ProductionReport } from '../interfaces/productionReport.interface';

import { Lider } from '../interfaces/lider.interface';
import { Model } from '../interfaces/model.interface';
import { Line } from '../interfaces/line.interface';
import { WorkShift } from '../interfaces/workShift.interface';

const baseURL = environment.baseURL + '/productionreport';

@Injectable({
  providedIn: 'root',
})
export class ProductionReportService {
  private _http = inject(HttpClient);
  //
  //
  public ProductionReport = signal<ProductionReport[]>([]);
  //
  constructor() {}
  //
  //
  GetListProductionReport(
    Liders: Lider[],
    Lines: Line[],
    Models: Model[],
    Shifts: WorkShift[],
    Dates: Date[]
  ): Observable<
    {
      lider: Lider;
      line: Line;
      model: Model;
      shift: WorkShift;
      dateStart: Date;
      dateEnd: Date;
    }[]
  > {
    return this._http
      .get<
        {
          lider: Lider;
          line: Line;
          model: Model;
          shift: WorkShift;
          dateStart: Date;
          dateEnd: Date;
        }[]
      >(`${baseURL}`, {
        params: {
          liderIds: Liders.map((lider) => lider.liderId),
          lineIds: Lines.map((line) => line.lineId),
          modelIds: Models.map((model) => model.modelId),
          shiftIds: Shifts.map((shift) => shift.workShiftId),
          dates: Dates.map((date) => date.toISOString()),
        },
      })
  }
  //
  GetProductionReport(
    startDatetime: Date,
    endDatetime: Date,
    lineId: string,
    modelId: number
  ): Observable<ProductionReport[]> {
    return this._http
      .get<ProductionReport[]>(`${baseURL}`, {
        params: {
          startDatetime: startDatetime.toISOString(),
          endDatetime: endDatetime.toISOString(),
          lineId: lineId,
          modelId: modelId.toString(),
        },
      })
      .pipe(tap((data) => this.ProductionReport.set(data)));
  }
}
