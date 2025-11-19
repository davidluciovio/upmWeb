import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

export interface LocationInterface {
  id: number;
  active: boolean;
  createDate: Date;
  createBy: string;
  locationDescription: string;
}

export interface CreateLocationInterface {
  createBy: string;
  locationDescription: string;
}

const API_URL = environment.baseUrl + '/DataProductionLocation';

@Injectable({
  providedIn: 'root',
})
export class LocationManagerService {
  private readonly _http = inject(HttpClient);

  public locations = signal<LocationInterface[]>([]);

  getLocations(): Observable<LocationInterface[]> {
    return this._http.get<LocationInterface[]>(`${API_URL}/v1/get-all`)
  }  
  
  getLocationById(id: number): Observable<LocationInterface> {
    return this._http.get<LocationInterface>(`${API_URL}/location/${id}`);
  }

  createLocation(location: CreateLocationInterface): Observable<LocationInterface> {
    return this._http.post<LocationInterface>(`${API_URL}/v1/create`, location);
  }

  updateLocation(location: LocationInterface): Observable<LocationInterface> {
    return this._http.post<LocationInterface>(`${API_URL}/v1/update/${location.id}`, location);
  }

  deleteLocation(id: number): Observable<void> {
    return this._http.delete<void>(`${API_URL}/location/${id}`);
  }
}
