import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../shared/components/table-crud/table-crud';
import { UserManager, UserInterface, CreateUserInterface, UpdateUserInterface } from '../../services/user-manager';
import { RoleManager } from '../../services/role-manager';
import { Authentication } from '../../../auth/services/authentication';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-users',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './users.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
	private readonly userService = inject(UserManager);
	private readonly roleService = inject(RoleManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);
	private readonly errorHandler = inject(ErrorHandlerService);

	readonly users$ = rxResource({
		stream: () =>
			this.userService.getUsers().pipe(
				map((users) => {
					return users;
				}),
			),
	});

	readonly roles$ = rxResource({
		stream: () =>
			this.roleService.getRoles().pipe(
				map((roles) => {
					return roles.sort((a, b) => a.name.localeCompare(b.name));
				}),
			),
	});

	roleSearch = signal('');
	showRoleDropdown = signal(false);

	filteredRoles = computed(() => {
		const search = this.roleSearch().toLowerCase();
		const list = this.roles$.value() || [];
		return list.filter((item) => item.name.toLowerCase().includes(search));
	});

	form: FormGroup = this.fb.group({
		id: [''],
		userName: ['', Validators.required],
		prettyName: ['', Validators.required],
		email: ['', Validators.required],
		password: ['', Validators.required],
		active: [false],
		roleId: ['', Validators.required],
		createBy: [''],
	});

	isEditMode = false;
	selectedUserId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'userName', label: 'Usuario', active: true },
		{ key: 'prettyName', label: 'Nombre', active: true },
		{ key: 'email', label: 'Nomina', active: true },
		{ key: 'roleName', label: 'Rol', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
		{ key: 'createBy', label: 'Creado Por', active: true },
		{ key: 'createDate', label: 'Fecha Creación', dataType: 'date', active: true },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteUser(event: UserInterface) {
		this.userService.deleteUser(event.id).subscribe(() => {
			this.users$.reload();
		});
	}

	editUser(event: UserInterface) {
		const role = this.roles$.value()?.find((item) => item.name === event.roleName);
		this.isEditMode = true;
		this.selectedUserId = event.id;

		// Password is not editable here, remove required validator or handle it
		this.form.get('password')?.clearValidators();
		this.form.get('password')?.updateValueAndValidity();

		this.form.patchValue({
			...event,
			roleId: role?.id,
		});

		this.roleSearch.set(event.roleName);
		this.openModal();
	}

	createUser() {
		this.isEditMode = false;
		this.form.reset();
		this.roleSearch.set('');

		// Add password validator back
		this.form.get('password')?.setValidators(Validators.required);
		this.form.get('password')?.updateValueAndValidity();

		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email });
		}
		this.openModal();
	}

	selectRole(item: any) {
		this.form.patchValue({ roleId: item.id });
		this.roleSearch.set(item.name);
		this.showRoleDropdown.set(false);
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';

			if (this.isEditMode && this.selectedUserId) {
				const updateData: UpdateUserInterface = {
					userName: formData.userName,
					prettyName: formData.prettyName,
					email: formData.email,
					password: formData.password || '',
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					roleId: formData.roleId,
				};
				this.userService.updateUser(this.selectedUserId, updateData).subscribe({
					next: () => {
						this.users$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				const createData: CreateUserInterface = {
					userName: formData.userName,
					prettyName: formData.prettyName,
					email: formData.email,
					password: formData.password,
					createBy: userEmail,
					roleId: formData.roleId,
				};
				this.userService.createUser(createData).subscribe({
					next: () => {
						this.users$.reload();
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
