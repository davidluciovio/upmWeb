import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { TableCrud, ColumnConfig } from '../../../../shared/components/table-crud/table-crud';
import { SubmoduleManager, SubmoduleResponseInterface, SubmoduleRequestInterface } from '../../services/submodule-manager';
import { ModuleManager } from '../../services/module-manager';
import { ErrorHandlerService } from '../../../../core/services/error-handler';
import { Authentication } from '../../../auth/services/authentication';

@Component({
	selector: 'app-submodules',
	imports: [CommonModule, ReactiveFormsModule, TableCrud],
	templateUrl: './submodules.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Submodules {
	private readonly submoduleService = inject(SubmoduleManager);
	private readonly moduleService = inject(ModuleManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	readonly submodules$ = rxResource({
		stream: () =>
			this.submoduleService.getSubmodules().pipe(
				map((submodules) => {
					return submodules.sort((a, b) => a.submodule.localeCompare(b.submodule));
				}),
			),
	});

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
		submodule: ['', Validators.required],
		moduleId: ['', Validators.required],
		route: ['', Validators.required],
		icon: ['', Validators.required],
		createBy: [''],
	});

	isEditMode = false;
	selectedSubmoduleId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'submodule', label: 'Submodulos', active: true },
		{ key: 'route', label: 'Ruta', active: true },
		{ key: 'icon', label: 'Icono', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
	];

	openModal() {
		const modal = document.getElementById('submodule_modal') as HTMLDialogElement;
		modal.showModal();
	}

	closeModal() {
		const modal = document.getElementById('submodule_modal') as HTMLDialogElement;
		modal.close();
	}

	deleteSubmodule(event: SubmoduleResponseInterface) {
		this.submoduleService.deleteSubmodule(event.id).subscribe(() => {
			this.submodules$.reload();
		});
	}

	editSubmodule(event: SubmoduleResponseInterface) {
		this.isEditMode = true;
		this.selectedSubmoduleId = event.id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createSubmodule() {
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

			const requestData: SubmoduleRequestInterface = {
				submodule: formData.submodule,
				moduleId: formData.moduleId,
				route: formData.route,
				icon: formData.icon,
				createBy: userEmail,
			};

			if (this.isEditMode && this.selectedSubmoduleId) {
				this.submoduleService.updateSubmodule(this.selectedSubmoduleId, requestData).subscribe({
					next: () => {
						this.submodules$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.submoduleService.createSubmodule(requestData).subscribe({
					next: () => {
						this.submodules$.reload();
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
