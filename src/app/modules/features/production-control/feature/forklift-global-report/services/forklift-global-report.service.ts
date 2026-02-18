import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface AlertUserData {
	id: string;
	userName: string;
	email: string;
}

export interface PartNumberLogisticsDetails {
	id: string;
	active: boolean;
	createDate: string;
	createBy: string;
	updateDate: string;
	updateBy: string;
	partNumber: string;
	area: string;
	location: string;
	snp: string;
}

export interface ForkliftAlertInterface {
	id: string;
	active: boolean;
	createDate: string;
	createBy: string;
	updateDate: string;
	updateBy: string;
	completeBy?: string | null;
	completeDate?: string | null;
	receivedBy?: string | null;
	receivedDate?: string | null;
	cancelBy?: string | null;
	cancelDate?: string | null;
	criticalBy?: string | null;
	criticalDate?: string | null;
	statusDescription: string;
	partNumberLogisticsId: string;
	userId: string;
	userData: AlertUserData;
	partNumberLogisticsResponseDto: PartNumberLogisticsDetails;
}

@Injectable({ providedIn: 'root' })
export class ForkliftGlobalReportService {
	private readonly _http = inject(HttpClient);
	private readonly API_URL = `${environment.baseUrl}/ComponentAlert`;

	getGlobalAlerts(): Observable<ForkliftAlertInterface[]> {
		return this._http.get<ForkliftAlertInterface[]>(`${this.API_URL}/v1/get-all`);
	}

	getAlertById(id: string): Observable<ForkliftAlertInterface> {
		return this._http.get<ForkliftAlertInterface>(`${this.API_URL}/v1/get-id/${id}`);
	}

	createAlert(alert: any): Observable<ForkliftAlertInterface> {
		return this._http.post<ForkliftAlertInterface>(`${this.API_URL}/v1/create`, alert);
	}

	updateAlert(id: string, alert: any): Observable<ForkliftAlertInterface> {
		return this._http.post<ForkliftAlertInterface>(`${this.API_URL}/v1/update/${id}`, alert);
	}
}
