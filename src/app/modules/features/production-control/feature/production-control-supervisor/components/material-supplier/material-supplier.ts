import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../../../../shared/components/table-crud/table-crud';
import { MaterialSupplierManager, MaterialSupplierResponseDto, MaterialSupplierRequestDto } from '../../services/material-supplier-manager';
import { ErrorHandlerService } from '../../../../../../../core/services/error-handler';
import { Authentication } from '../../../../../../auth/services/authentication';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-material-supplier',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './material-supplier.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialSupplier {
	private readonly materialSupplierManager = inject(MaterialSupplierManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	readonly materialSuppliers$ = rxResource({
		stream: () =>
			this.materialSupplierManager.getModules().pipe(
				map((suppliers) => {
					return suppliers ? suppliers.sort((a, b) => a.MaterialSupplierDescription.localeCompare(b.MaterialSupplierDescription)) : [];
				}),
			),
	});

	form: FormGroup = this.fb.group({
		Id: [''],
		MaterialSupplierDescription: ['', Validators.required],
		Active: [true],
		CreateBy: [''],
		UpdateBy: [''],
	});

	isEditMode = false;
	selectedSupplierId: string | null = null;
	dialogVisible = false;

	columns: ColumnConfig[] = [
		{ key: 'MaterialSupplierDescription', label: 'Proveedor', active: true },
		{ key: 'Active', label: 'Activo', dataType: 'boolean', active: true },
	];

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteMaterialSupplier(event: MaterialSupplierResponseDto) {
		this.materialSupplierManager.deleteModule(event.Id).subscribe(() => {
			this.materialSuppliers$.reload();
		});
	}

	editMaterialSupplier(event: MaterialSupplierResponseDto) {
		this.isEditMode = true;
		this.selectedSupplierId = event.Id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createMaterialSupplier() {
		this.isEditMode = false;
		this.form.reset();
		this.form.patchValue({ Active: true });

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

			const requestData: MaterialSupplierRequestDto = {
				MaterialSupplierDescription: formData.MaterialSupplierDescription,
				Active: formData.Active === true || formData.Active === 'true',
				CreateBy: this.isEditMode ? formData.CreateBy : userEmail,
				UpdateBy: userEmail,
			};

			if (this.isEditMode && this.selectedSupplierId) {
				this.materialSupplierManager.updateModule(this.selectedSupplierId, requestData).subscribe({
					next: () => {
						this.materialSuppliers$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.materialSupplierManager.createModule(requestData).subscribe({
					next: () => {
						this.materialSuppliers$.reload();
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
