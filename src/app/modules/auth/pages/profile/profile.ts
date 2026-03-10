import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';

import { Authentication } from '../../services/authentication';
import { of } from 'rxjs';
import { UpdateUserInterface, UserInterface, UserManager } from '../../../security/services/user-manager';
import { RoleManager } from '../../../security/services/role-manager';
import { ErrorHandlerService } from '../../../../core/services/error-handler';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		CardModule,
		InputTextModule,
		ButtonModule,
		DividerModule,
		ToastModule,
	],
	templateUrl: './profile.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
	private readonly authService = inject(Authentication);
	private readonly userService = inject(UserManager);
	private readonly roleService = inject(RoleManager);
	private readonly fb = inject(FormBuilder);
	private readonly messageService = inject(MessageService);
	private readonly errorHandler = inject(ErrorHandlerService);

	// Get the logged-in user's ID from the token signal
	private readonly userId = computed(() => this.authService.user()?.sub);

	// Fetch account roles to find the correct role ID when saving
	private readonly roles$ = rxResource({
		stream: () => this.roleService.getRoles(),
	});

	// Resource for the user's detailed information
	public userProfile$ = rxResource<UserInterface | undefined, string | undefined>({
		params: () => this.userId(),
		stream: (rx) => {
			const id = rx.params;
			if (!id) return of(undefined);
			return this.userService.getUserById(id).pipe(
				map((user) => {
					// Patch the form when data is loaded
					this.form.patchValue({
						userName: user.userName,
						prettyName: user.prettyName,
						email: user.email,
						codeUser: user.codeUser,
						roleName: user.roleName,
						active: user.active,
					});
					return user;
				}),
			);
		},
	});

	// Safe access to user data
	public userData = computed(() => {
		if (this.userProfile$.error()) return undefined;
		return this.userProfile$.value();
	});

	// Form for editing the profile
	public form: FormGroup = this.fb.group({
		userName: [{ value: '', disabled: true }], // Read-only
		prettyName: ['', Validators.required],
		email: ['', [Validators.required, Validators.email]],
		codeUser: ['', Validators.required],
		roleName: [{ value: '', disabled: true }], // Read-only
		active: [{ value: false, disabled: true }], // Read-only
	});

	public isLoading = computed(() => this.userProfile$.isLoading());
	public isSaving = signal(false);

	// Get initials for the avatar
	public userInitials = computed(() => {
		const user = this.userData();
		const name = user?.prettyName || '';
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n: string) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	});

	public saveProfile() {
		if (this.form.invalid) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Atención',
				detail: 'Por favor complete correctamente los campos requeridos.'
			});
			return;
		}

		const userId = this.userId();
		const currentUserData = this.userData();
		const roles = this.roles$.error() ? undefined : this.roles$.value();

		if (!userId || !currentUserData) return;

		this.isSaving.set(true);

		// Find the roleId based on the roleName we have
		const userRole = roles?.find(r => r.name === currentUserData.roleName);
		
		const updateRequest: UpdateUserInterface = {
			userName: currentUserData.userName,
			prettyName: this.form.value.prettyName,
			email: this.form.value.email,
			password: '', // Password is not changed here
			active: currentUserData.active,
			updateBy: (this.authService.user() as any)?.email || currentUserData.email,
			roleId: userRole?.id || '', // Maintain the current role
			codeUser: this.form.value.codeUser,
		};

		this.userService.updateUser(userId, updateRequest).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'Perfil actualizado correctamente.'
				});
				this.userProfile$.reload();
				this.isSaving.set(false);
			},
			error: (error: HttpErrorResponse) => {
				this.errorHandler.handleValidationError(error);
				this.isSaving.set(false);
			}
		});
	}
}
