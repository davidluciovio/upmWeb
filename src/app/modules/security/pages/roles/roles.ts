import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../shared/components/table-crud/table-crud';
import { RoleManager, RoleResponseInterface, RoleRequestInterface } from '../../services/role-manager';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-roles',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule],
	templateUrl: './roles.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Roles {
	private readonly roleService = inject(RoleManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);

	readonly roles$ = rxResource({
		stream: () =>
			this.roleService.getRoles().pipe(
				map((roles) => {
					return roles.sort((a, b) => a.name.localeCompare(b.name));
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [''],
		name: ['', Validators.required],
	});

	isEditMode = false;
	selectedRoleId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'name', label: 'Nombre', active: true },
		{ key: 'normalizedName', label: 'Nombre Normalizado', active: true },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteRole(event: RoleResponseInterface) {
		this.roleService.deleteRole(event.id).subscribe(() => {
			this.roles$.reload();
		});
	}

	editRole(event: RoleResponseInterface) {
		this.isEditMode = true;
		this.selectedRoleId = event.id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createRole() {
		this.isEditMode = false;
		this.form.reset();
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();

			if (this.isEditMode && this.selectedRoleId) {
				const updateData: RoleRequestInterface = {
					name: formData.name,
				};
				this.roleService.updateRole(this.selectedRoleId, updateData).subscribe({
					next: () => {
						this.roles$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				const createData: RoleRequestInterface = {
					name: formData.name,
				};
				this.roleService.createRole(createData).subscribe({
					next: () => {
						this.roles$.reload();
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
