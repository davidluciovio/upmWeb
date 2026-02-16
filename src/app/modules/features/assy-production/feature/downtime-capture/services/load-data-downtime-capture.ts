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
				response.partNumberDataProductions = response.partNumberDataProductions.filter(
					(item) => item.hourlyProductionDatas.reduce((acc, h) => acc + h.producedQuantity, 0) > 0,
				);
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error desconocido';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}

	public registerDowntime(data: DowntimeRegisterDto): Observable<any> {
		return this._http.post(`${API_URL}/v1/register-downtime`, data).pipe(
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

	public registerCompleteRack(data: CompleteRackRegisterDto): Observable<any> {
		return this._http.post(`${API_URL}/v1/register-complete-rack`, data).pipe(
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

	public registerLineOperators(data: LineOperatorsRegisterDto): Observable<any> {
		return this._http.post(`${API_URL}/v1/register-line-operators`, data).pipe(
			map((response) => {
				this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Operadores registrados correctamente' });
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error al registrar los operadores';
				this._messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
				throw new Error(errorMessage);
			}),
		);
	}

	public getActiveEmployees(): Observable<ActiveEmployeesInterface[]> {
		return this._http.get<ActiveEmployeesInterface[]>(`${API_URL}/v1/get-active-employees`).pipe(
			map((response) => {
				return response;
			}),
			catchError((error) => {
				const errorMessage = error?.error?.message || error?.message || 'Error al obtener los empleados';
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
	operators: any[];
	downtimeRegisters: DowntimeRegister[];
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

export interface DowntimeRegister {
	id: string;
	startDowntimeDatetime: string;
	endDowntimeDatetime: string;
	dataProductionDowntimeId: string;
	productionStationId: string;
	downtimeReason: string;
}





export interface CompleteRackRegisterDto {
	noRack: string;
	serie: string;
	destination: string;
	productionStationId: string;
}

export interface LineOperatorsRegisterDto {
	lineId: string;
	operatorCode: string;
	operatorName: string;
	startDatetime: string;
	endDatetime: string;
}

export interface DowntimeRegisterDto {
	startDowntimeDatetime: string;
	endDowntimeDatetime: string;
	dataProductionDowntimeId: string;
	productionStationId: string;
}

export interface ActiveEmployeesInterface {
	CB_CODIGO: number;
	CB_NOMBRES: string;
	CB_APE_MAT: string;
	CB_APE_PAT: string;
	PRETTYNAME: string;
}
