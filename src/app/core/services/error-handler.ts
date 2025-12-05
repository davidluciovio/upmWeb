import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

interface ValidationError {
	Code: string;
	Description: string;
}

@Injectable({
	providedIn: 'root',
})
export class ErrorHandlerService {
	private readonly messageService = inject(MessageService);

	constructor() {}

	public handleValidationError(error: HttpErrorResponse): void {
		if (error && error.error) {
			try {
				const validationErrors: ValidationError[] = error.error;

				validationErrors.forEach((err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error de Validación',
						detail: err.Description,
						life: 5000,
					});
				});
			} catch (e) {
				console.error('Error parsing validation errors:', e);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Ocurrió un error inesperado al procesar la respuesta.',
				});
			}
		} else {
			// Fallback for other types of errors
			const errorMessage = error?.error?.message || error?.message || 'Ocurrió un error desconocido';
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: errorMessage,
			});
		}
	}
}
