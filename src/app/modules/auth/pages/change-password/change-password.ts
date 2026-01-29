import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../services/authentication';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-change-password',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, CardModule, InputTextModule],
	templateUrl: './change-password.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
	private fb = inject(FormBuilder);
	private authService = inject(Authentication);
	private messageService = inject(MessageService);
	private router = inject(Router);

	form: FormGroup = this.fb.group(
		{
			currentPassword: ['', Validators.required],
			newPassword: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
		},
		{ validators: this.passwordMatchValidator },
	);

	isLoading = signal(false);

	passwordMatchValidator(g: FormGroup) {
		return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
	}

	onSubmit() {
		if (this.form.valid) {
			this.isLoading.set(true);
			const { currentPassword, newPassword } = this.form.value;
			this.authService.changePassword({ currentPassword, newPassword }).subscribe({
				next: () => {
					this.isLoading.set(false);
					this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente' });
					this.router.navigate(['/']);
				},
				error: (err) => {
					this.isLoading.set(false);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la contraseña' });
					console.error(err);
				},
			});
		}
	}
}
