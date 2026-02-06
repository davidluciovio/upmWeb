import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { TableCrud, ColumnConfig } from '../../../../shared/components/table-crud/table-crud';
import { PermissionManager, PermissionResponseInterface, PermissionRequestInterface } from '../../services/permission-manager';
import { SubmoduleManager } from '../../services/submodule-manager';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { Authentication } from '../../../auth/services/authentication';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-permissions',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './permissions.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Permissions {
	private readonly permissionService = inject(PermissionManager);
	private readonly submoduleService = inject(SubmoduleManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	readonly permissions$ = rxResource({
		stream: () =>
			this.permissionService.getPermissions().pipe(
				map((permissions) => {
					return permissions.sort((a, b) => a.permission.localeCompare(b.permission));
				}),
			),
	});

	readonly submodules$ = rxResource({
		stream: () =>
			this.submoduleService.getSubmodules().pipe(
				map((submodules) => {
					return submodules.sort((a, b) => a.submodule.localeCompare(b.submodule));
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [''],
		permission: ['', Validators.required],
		clave: ['', Validators.required],
		submoduleId: ['', Validators.required],
		active: [false],
		createBy: [''],
	});

	isEditMode = false;
	selectedPermissionId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'permission', label: 'Permiso', active: true },
		{ key: 'clave', label: 'Clave', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
		{ key: 'submodule', label: 'Submodulo', active: true },
		{ key: 'module', label: 'Modulo', active: true },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deletePermission(event: PermissionResponseInterface) {
		this.permissionService.deletePermission(event.id).subscribe(() => {
			this.permissions$.reload();
		});
	}

	editPermission(event: PermissionResponseInterface) {
		this.isEditMode = true;
		this.selectedPermissionId = event.id;
		this.form.patchValue({ ...event });
		this.openModal();
	}

	createPermission() {
		this.isEditMode = false;
		this.form.reset();
		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email, active: false });
		}
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';

			const requestData: PermissionRequestInterface = {
				permission: formData.permission,
				clave: formData.clave,
				submoduleId: formData.submoduleId,
				active: formData.active === true || formData.active === 'true',
				createBy: userEmail,
			};

			if (this.isEditMode && this.selectedPermissionId) {
				this.permissionService.updatePermission(this.selectedPermissionId, requestData).subscribe({
					next: () => {
						this.permissions$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.permissionService.createPermission(requestData).subscribe({
					next: () => {
						this.permissions$.reload();
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
