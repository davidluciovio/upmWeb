import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface LabelControlRequestDto {
  active: boolean;
  createBy: string;
  updateBy: string;
  order: string;
  ran: string;
  productionDatetime: string;
  used: boolean;
  quantity: number;
  productionStationId: string;
}

export interface LabelControlResponseDto {
  id: string;
  active: boolean;
  order: string;
  ran: string;
  productionDatetime: string;
  used: boolean;
  quantity: number;
  productionStation: string;
}

export interface PagedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const API_URL = environment.baseUrl + '/LabelControl';

@Injectable({
  providedIn: 'root',
})
export class LabelControlManager {
  private readonly _http = inject(HttpClient);

  constructor() {}

  getPaginatedLabelControls(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<PagedResponse<LabelControlResponseDto>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this._http.get<PagedResponse<LabelControlResponseDto>>(
      `${API_URL}/v1/get-paginated`,
      { params }
    );
  }

  getLabelControlById(id: string): Observable<LabelControlResponseDto> {
    return this._http.get<LabelControlResponseDto>(`${API_URL}/v1/get-id/${id}`);
  }

  createLabelControl(
    createDto: LabelControlRequestDto
  ): Observable<LabelControlResponseDto> {
    return this._http.post<LabelControlResponseDto>(
      `${API_URL}/v1/create`,
      createDto
    );
  }

  updateLabelControl(
    id: string,
    updateDto: LabelControlRequestDto
  ): Observable<LabelControlResponseDto> {
    return this._http.post<LabelControlResponseDto>(
      `${API_URL}/v1/update/${id}`,
      updateDto
    );
  }

  createMassiveLabelControl(
    createDtos: LabelControlRequestDto[]
  ): Observable<{ message: string; count: number }> {
    return this._http.post<{ message: string; count: number }>(
      `${API_URL}/v1/create-massive`,
      createDtos
    );
  }

  getAvailableLabelsByStation(
    productionStationId: string
  ): Observable<LabelControlResponseDto[]> {
    return this._http.get<LabelControlResponseDto[]>(
      `${API_URL}/v1/get-available-by-station/${productionStationId}`
    );
  }
}
