import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../../../../shared/components/table-crud/table-crud';
import {
	PartNumberStructureManager,
	PartNumberStructureResponseInterface,
	PartNumberStructureRequestInterface,
} from '../../services/part-number-structure-manager';
import { MaterialSupplierManager } from '../../services/material-supplier-manager';
import { PartNumberAreaManager } from '../../../../../../Admin/services/part-number-logistics-manager';
import { ErrorHandlerService } from '../../../../../../../core/services/error-handler';
import { Authentication } from '../../../../../../auth/services/authentication';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
	selector: 'app-partnumber-structure',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, InputNumberModule, ToggleSwitchModule, Select],
	templateUrl: './partnumber-structure.html', 
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberStructure {
	private readonly structureManager = inject(PartNumberStructureManager);
	private readonly supplierManager = inject(MaterialSupplierManager);
	private readonly pnLogisticManager = inject(PartNumberAreaManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	// Resources
	readonly structures$ = rxResource({
		stream: () =>
			this.structureManager.getStructures().pipe(
				map((items) => {
					return items ? items.sort((a, b) => a.PartNumberLogisticDescription.localeCompare(b.PartNumberLogisticDescription)) : [];
				}),
			),
	});

	readonly suppliers$ = rxResource({
		stream: () => this.supplierManager.getModules().pipe(map((items) => items || [])),
	});

	readonly pnLogistics$ = rxResource({
		stream: () => this.pnLogisticManager.getPartNumberAreas().pipe(map((items) => items || [])),
	});

	// Form
	form: FormGroup = this.fb.group({
		Id: [''],
		PartNumberLogisticId: ['', Validators.required],
		MaterialSuplierId: ['', Validators.required],
		Quantity: [0, [Validators.required, Validators.min(1)]],
		Active: [true],
		CreateBy: [''],
		UpdateBy: [''],
	});

	isEditMode = false;
	selectedStructureId: string | null = null;
	dialogVisible = false;

	columns: ColumnConfig[] = [
		{ key: 'PartNumberLogisticDescription', label: 'Logística de Parte', active: true },
		{ key: 'MaterialSupplierDescription', label: 'Proveedor', active: true },
		{ key: 'Quantity', label: 'Cantidad', active: true },
		{ key: 'Active', label: 'Activo', dataType: 'boolean', active: true },
	];

	// Computed options for selects
	supplierOptions = computed(() => this.suppliers$.value() || []);
	pnLogisticOptions = computed(() =>
		(this.pnLogistics$.value() || []).map((item) => ({
			...item,
			// Create a display label combining part number and area/location if needed,
			// but PartNumberStructureResponseInterface uses 'PartNumberLogisticDescription'.
			// For the dropdown, we'll try to match what might be useful.
			// As per PartNumberAreaInterface, we have 'partNumber'.
			label: `${item.partNumber} - ${item.area}`,
		})),
	);

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteStructure(event: PartNumberStructureResponseInterface) {
		this.structureManager.deleteStructure(event.Id).subscribe(() => {
			this.structures$.reload();
		});
	}

	editStructure(event: PartNumberStructureResponseInterface) {
		this.isEditMode = true;
		this.selectedStructureId = event.Id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createStructure() {
		this.isEditMode = false;
		this.form.reset();
		this.form.patchValue({ Active: true, Quantity: 0 }); // Default values

		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ CreateBy: user.email, UpdateBy: user.email });
		}

		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';

			const requestData: PartNumberStructureRequestInterface = {
				PartNumberLogisticId: formData.PartNumberLogisticId,
				MaterialSuplierId: formData.MaterialSuplierId,
				Quantity: formData.Quantity,
				Active: formData.Active === true || formData.Active === 'true',
				CreateBy: this.isEditMode ? formData.CreateBy : userEmail,
				UpdateBy: userEmail,
			};

			if (this.isEditMode && this.selectedStructureId) {
				this.structureManager.updateStructure(this.selectedStructureId, requestData).subscribe({
					next: () => {
						this.structures$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.structureManager.createStructure(requestData).subscribe({
					next: () => {
						this.structures$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			}
		}
	}
}
