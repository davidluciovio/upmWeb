import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment.development';
import { MessageService } from 'primeng/api';
import { catchError, map, Observable, of } from 'rxjs';

const API_URL = environment.baseUrl + '/DowntimeCapture';

@Injectable({
	providedIn: 'root',
})
export class LoadDataDowntimeCapture {
	private readonly _http = inject(HttpClient);
	private readonly _messageService = inject(MessageService);

	constructor() {}

	public getFiltersData(params: DowntimeCaptureRequestInterface | null): Observable<DowntimeCaptureResponseInterface> {
		if (!params) return of();
		return this._http.post<DowntimeCaptureResponseInterface>(`${API_URL}/v1/get-downtime-capture-data`, params).pipe(
			map((response) => {
				if (!response) return response;
				response.partNumberDataProductions.forEach((item) => {
					item.hourlyProductionDatas = item.hourlyProductionDatas.filter((h) => h.producedQuantity > 0);
				});
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error desconocido';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}

	public saveMaterialAlert(data: { component: string; description: string; lineId: string }): Observable<any> {
		return this._http.post(`${API_URL}/v1/save-material-alert`, data).pipe(
			map((response) => {
				this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Alerta de material creada correctamente' });
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error al guardar la alerta';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}

	public saveDowntime(data: any): Observable<any> {
		return this._http.post(`${API_URL}/v1/save-downtime`, data).pipe(
			map((response) => {
				this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Paro registrado correctamente' });
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error al registrar el paro';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}

	public saveRack(data: any): Observable<any> {
		return this._http.post(`${API_URL}/v1/save-rack`, data).pipe(
			map((response) => {
				this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rack agregado correctamente' });
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error al agregar el rack';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}
}

export interface DowntimeCaptureRequestInterface {
	startDatetime: string;
	endDatetime: string;
	lineDescription: string;
}

export interface DowntimeCaptureResponseInterface {
	lineId: string;
	lineDescription: string;
	partNumberDataProductions: PartNumberDataProduction[];
}

export interface PartNumberDataProduction {
	partNumberId: string;
	partNumberName: string;
	partNumberDescription: string;
	modelId: string;
	modelName: string;
	objetiveTime: number;
	hpTime: number;
	hourlyProductionDatas: HourlyProductionData[];
}

export interface HourlyProductionData {
	startProductionDate: string;
	endProductionDate: string;
	downtimeP: number;
	downtimeNP: number;
	totalDowntime: number;
	totalWorkingTime: number;
	minutesPzas: number;
	producedQuantity: number;
	objetiveQuantity: number;
	efectivity: number;
}
