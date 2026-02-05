import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../shared/components/table-crud/table-crud';
import { ModuleManager, ModuleResponseInterface, ModuleRequestInterface } from '../../services/module-manager';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { Authentication } from '../../../auth/services/authentication';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-modules',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './modules.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modules {
	private readonly moduleService = inject(ModuleManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	readonly modules$ = rxResource({
		stream: () =>
			this.moduleService.getModules().pipe(
				map((modules) => {
					return modules.sort((a, b) => a.module.localeCompare(b.module));
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [''],
		module: ['', Validators.required],
		route: ['', Validators.required],
		icon: ['', Validators.required],
		active: [false],
		createBy: [''],
	});

	isEditMode = false;
	selectedModuleId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'module', label: 'Modulo', active: true },
		{ key: 'route', label: 'Ruta', active: true },
		{ key: 'icon', label: 'Icono', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteModule(event: ModuleResponseInterface) {
		this.moduleService.deleteModule(event.id).subscribe(() => {
			this.modules$.reload();
		});
	}

	editModule(event: ModuleResponseInterface) {
		this.isEditMode = true;
		this.selectedModuleId = event.id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createModule() {
		this.isEditMode = false;
		this.form.reset();

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

			const requestData: ModuleRequestInterface = {
				module: formData.module,
				route: formData.route,
				icon: formData.icon,
				active: formData.active === true || formData.active === 'true',
				createBy: userEmail,
			};

			if (this.isEditMode && this.selectedModuleId) {
				this.moduleService.updateModule(this.selectedModuleId, requestData).subscribe({
					next: () => {
						this.modules$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.moduleService.createModule(requestData).subscribe({
					next: () => {
						this.modules$.reload();
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
