import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ProductionReport } from '../interfaces/productionReport.interface';
const baseURL = environment.baseURL + '/productionreport';

@Injectable({
  providedIn: 'root',
})
export class ProductionReportService {
  private _http = inject(HttpClient);
  //
  //
  public ProductionReport = signal<ProductionReport[]>([]) 
  //
  constructor() {}
  //
  //
  GetProductionReport(startDatetime: Date, endDatetime: Date, lineId: string, modelId: number): Observable<ProductionReport[]> {
    return this._http.get<ProductionReport[]>(`${baseURL}`, {
      params: {
        startDatetime: startDatetime.toISOString(),
        endDatetime: endDatetime.toISOString(),
        lineId: lineId,
        modelId: modelId.toString(),
      },
    }).pipe(
      tap((data) => this.ProductionReport.set(data))
    );
  }
}
