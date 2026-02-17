import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../../../../shared/components/table-crud/table-crud';
import { UserManager, UserInterface, CreateUserInterface, UpdateUserInterface } from '../../../../../../security/services/user-manager';
import { RoleManager } from '../../../../../../security/services/role-manager';
import { Authentication } from '../../../../../../auth/services/authentication';
import { ErrorHandlerService } from '../../../../../../../core/services/error-handler';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-add-forklifter',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableCrud,
		DialogModule,
		ButtonModule,
		InputTextModule,
		ToggleSwitchModule,
		PasswordModule,
		ToastModule,
	],
	providers: [MessageService],
	templateUrl: './add-forklifter.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddForklifter implements OnInit {
	private readonly userService = inject(UserManager);
	private readonly roleService = inject(RoleManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly messageService = inject(MessageService);

	// Resources
	readonly users$ = rxResource({
		stream: () =>
			this.userService.getUsers().pipe(
				map((users) => {
					// Filter only Montacarguistas
					return (users || []).filter((u) => u.roleName.toLowerCase().includes('montacarguista')).sort((a, b) => a.prettyName.localeCompare(b.prettyName));
				}),
			),
	});

	readonly roles$ = rxResource({
		stream: () => this.roleService.getRoles().pipe(map((roles) => roles || [])),
	});

	// Find the Montacarguista role ID
	montacarguistaRoleId = computed(() => {
		const roles = this.roles$.value() || [];
		return roles.find((r) => r.name.toLowerCase().includes('montacarguista'))?.id;
	});

	form: FormGroup = this.fb.group({
		id: [''],
		userName: ['', Validators.required],
		prettyName: ['', Validators.required],
		password: [''],
		active: [true],
		roleId: [''],
		createBy: [''],
		codeUser: [''],
	});

	isEditMode = false;
	selectedUserId: string | null = null;
	dialogVisible = false;

	columns: ColumnConfig[] = [
		{ key: 'userName', label: 'Usuario', active: true },
		{ key: 'prettyName', label: 'Nombre Completo', active: true },
		{ key: 'codeUser', label: 'Código Nómina', active: true },
		{ key: 'email', label: 'Correo Electrónico', active: true },
		{ key: 'active', label: 'Estado', dataType: 'boolean', active: true },
	];

	ngOnInit() {}

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteForklifter(event: UserInterface) {
		this.userService.deleteUser(event.id).subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado' });
				this.users$.reload();
			},
			error: (err) => this.errorHandler.handleValidationError(err),
		});
	}

	editForklifter(event: UserInterface) {
		this.isEditMode = true;
		this.selectedUserId = event.id;

		this.form.get('password')?.clearValidators();
		this.form.get('password')?.updateValueAndValidity();

		this.form.patchValue({
			...event,
			roleId: this.montacarguistaRoleId(),
		});

		this.openModal();
	}

	createForklifter() {
		this.isEditMode = false;
		this.form.reset();
		this.form.patchValue({ active: true, roleId: this.montacarguistaRoleId() });

		this.form.get('password')?.setValidators(Validators.required);
		this.form.get('password')?.updateValueAndValidity();

		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email });
		}
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';
			const roleId = this.montacarguistaRoleId();

			if (!roleId) {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró el rol Montacarguista' });
				return;
			}

			if (this.isEditMode && this.selectedUserId) {
				const updateData: UpdateUserInterface = {
					...formData,
					email: formData.codeUser || '',
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					roleId: roleId,
				};
				this.userService.updateUser(this.selectedUserId, updateData).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
						this.users$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => this.errorHandler.handleValidationError(err),
				});
			} else {
				const createData: CreateUserInterface = {
					...formData,
					email: formData.codeUser || '',
					createBy: userEmail,
					roleId: roleId,
				};
				this.userService.createUser(createData).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Montacarguista registrado' });
						this.users$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => this.errorHandler.handleValidationError(err),
				});
			}
		}
	}
}
