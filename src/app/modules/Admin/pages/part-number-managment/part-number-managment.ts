import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CreatePartNumberInterface, PartNumberInterface, PartNumberManager } from '../../services/part-number-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-part-number-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './part-number-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberManagment {
	private readonly partNumberservice = inject(PartNumberManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly partNumber$ = rxResource({
		stream: () =>
			this.partNumberservice.getpartNumbers().pipe(
				map((partNumbers) => {
					return partNumbers;
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: ['false', Validators.required],
		createDate: [''],
		createBy: ['Leonardo', Validators.required],
		partNumberName: ['', Validators.required],
		partNumberDescription: ['', Validators.required],
	});

	isEditMode = false;
	selectedPartNumberId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'partNumberName', label: 'Nombre' },
		{ key: 'partNumberDescription', label: 'Descripción' },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deletePartNumber(event: PartNumberInterface) {
		this.partNumberservice.deletePartNumber(event.id).subscribe(() => {
			this.partNumber$.reload();
		});
	}

	editPartNumber(event: PartNumberInterface) {
		this.isEditMode = true;
		this.selectedPartNumberId = event.id;
		this.form.patchValue(event);
		this.form.get('partNumberName')?.disable();
		this.openModal();
	}

	createPartNumber() {
		this.isEditMode = false;
		this.form.reset();
		this.form.get('partNumberName')?.enable();
		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email });
		} else {
			this.form.patchValue({ createBy: 'Leonardo' });
		}
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const partNumberData: PartNumberInterface = this.form.getRawValue();
			partNumberData.createBy = this.authService.user()?.email || 'Leonardo';

			if (this.isEditMode && this.selectedPartNumberId) {
				this.partNumberservice.updatePartNumber(partNumberData).subscribe(() => {
					this.partNumber$.reload();
					this.closeModal();
				});
			} else {
				const createPartNumberData: CreatePartNumberInterface = {
					createBy: partNumberData.createBy,
					partNumberName: partNumberData.partNumberName,
					partNumberDescription: partNumberData.partNumberDescription,
					snp: partNumberData.snp,
					productionModelId: partNumberData.productionModel,
					productionLocationId: partNumberData.productionLocation,
					productionAreaId: partNumberData.productionArea,
				};
				this.partNumberservice.createPartNumber(createPartNumberData).subscribe(() => {
					this.partNumber$.reload();
					this.closeModal();
				});
			}
		}
	}
}
