import { inject, Injectable } from '@angular/core';
import { PartNumberLogisticsInterface } from '../../../../../Admin/services/part-number-logistics-manager';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = `${environment.baseUrl}/ComponentAlert`;

@Injectable({
	providedIn: 'root',
})
export class LoadDataComponentAlertReport {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getGlobalAlerts(filters: ComponentAlertFiltersDto): Observable<ComponentAlertReportResponseInterface[]> {
		return this._http.post<ComponentAlertReportResponseInterface[]>(`${API_URL}/v1/get-all`, filters);
	}

	getAlertById(id: string): Observable<ComponentAlertReportResponseInterface> {
		return this._http.get<ComponentAlertReportResponseInterface>(`${API_URL}/v1/get-id/${id}`);
	}

	createAlert(alert: ComponentAlertReportRequestInterface): Observable<ComponentAlertReportResponseInterface> {
		return this._http.post<ComponentAlertReportResponseInterface>(`${API_URL}/v1/create`, alert);
	}

	updateAlert(id: string, alert: ComponentAlertReportRequestInterface): Observable<ComponentAlertReportResponseInterface> {
		return this._http.post<ComponentAlertReportResponseInterface>(`${API_URL}/v1/update/${id}`, alert);
	}
}

export interface ComponentAlertFiltersDto {
	startDate: string;
	endDate: string;
	areaId?: string | null;
	userId?: string | null;
	partNumberLogisticId?: string | null;
}

export interface ComponentAlertReportResponseInterface {
	id: string;
	createDate: Date;
	createBy: string;
	updateDate: Date;
	updateBy: string;
	completeBy: string | null;
	completeDate: Date | null;
	receivedBy: string | null;
	receivedDate: Date | null;
	cancelBy: string | null;
	cancelDate: Date | null;
	criticalBy: string | null;
	criticalDate: Date | null;
	status: string;
	partNumberLogistics: PartNumberLogisticsInterface;
	user: string;
}

export interface ComponentAlertReportRequestInterface {
	active: boolean;
	createDate: Date;
	createBy: string;
	updateDate: Date;
	updateBy: string;

	completeBy: string | null;
	completeDate: Date | null;
	receivedBy: string | null;
	receivedDate: Date | null;
	cancelBy: string | null;
	cancelDate: Date | null;
	criticalBy: string | null;
	criticalDate: Date | null;
	partNumberLogisticsId: string;
	userId: string;
	status: string;
}
