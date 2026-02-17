import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment.development';

export interface MaterialSupplierInterface {
	id: string;
	active: boolean;
	supplierName: string;
	supplierDescription: string;
}

const API_URL = environment.baseUrl + '/MaterialSupplier';

@Injectable({
	providedIn: 'root',
})
export class MaterialSupplierManager {
	private readonly _http = inject(HttpClient);

	constructor() {}

	getSuppliers(): Observable<MaterialSupplierInterface[]> {
		return this._http.get<MaterialSupplierInterface[]>(`${API_URL}/v1/get-all`);
	}
}
