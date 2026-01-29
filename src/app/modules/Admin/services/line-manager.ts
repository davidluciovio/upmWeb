import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AreaInterface } from './area-manager';
import { MessageService } from 'primeng/api';
export interface LineInterface {
	id: string;
	active: boolean;
	createDate: Date;
	createBy: string;
	lineDescription: string;
}

export interface CreateLineInterface {
	createBy: string;
	lineDescription: string;
}

export interface UpdateLineInterface {
	lineDescription: string;
	active: boolean;
	updateBy: string;
	createBy: string;
}

const API_URL = environment.baseUrl;

@Injectable({
	providedIn: 'root',
})
export class LineManager {
	private readonly _http = inject(HttpClient);
	private readonly _messageService = inject(MessageService);

	getLines(): Observable<LineInterface[]> {
		return this._http.get<LineInterface[]>(`${API_URL}/DataProductionLine/v1/get-all`);
	}

	getAreas(): Observable<AreaInterface[]> {
		return this._http.get<AreaInterface[]>(`${API_URL}/DataProductionArea/v1/get-all`);
	}

	createLine(line: CreateLineInterface): Observable<LineInterface> {
		return this._http.post<LineInterface>(`${API_URL}/DataProductionLine/v1/create`, line).pipe(
			tap({
				next: (response) => {
					this._messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Line created successfully',
					});
				},
				error: (error) => {
					this._messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error,
					});
				},
			}),
		);
	}

	updateLine(id: string, line: UpdateLineInterface): Observable<LineInterface> {
		return this._http.post<LineInterface>(`${API_URL}/DataProductionLine/v1/update/${id}`, line).pipe(
			tap({
				next: (response) => {
					this._messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Line updated successfully',
					});
				},
				error: (error) => {
					this._messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error,
					});
				},
			}),
		);
	}

	deleteLine(id: string): Observable<void> {
		return this._http.delete<void>(`${API_URL}/DataProductionLine/v1/delete/${id}`).pipe(
			tap({
				next: () => {
					this._messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Line deleted successfully',
					});
				},
				error: (error) => {
					this._messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Line deleted failed',
					});
				},
			}),
		);
	}
}
