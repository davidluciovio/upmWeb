import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';
import { CreateLineInterface, LineInterface, LineManager, UpdateLineInterface } from '../../services/line-manager';
import { AreaInterface } from '../../services/area-manager';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
	selector: 'app-line-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule, ProgressSpinnerModule],
	templateUrl: './line-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
})
export class LineManagment {
	private readonly lineService = inject(LineManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly lines$ = rxResource({
		stream: () =>
			this.lineService.getLines().pipe(
				map((lines) => {
					return lines;
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: [false],
		createDate: [''],
		createBy: [''],
		lineDescription: ['', Validators.required],
	});

	isEditMode = false;
	selectedLineId: string | null = null;
	displayModal = false;

	columns: ColumnConfig[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'lineDescription', label: 'Nombre de la Linea' },
	];

	openModal() {
		this.displayModal = true;
	}

	closeModal() {
		this.displayModal = false;
		this.form.reset();
	}

	deleteLine(event: LineInterface) {
		this.lineService.deleteLine(event.id).subscribe(() => {
			this.lines$.reload();
		});
	}

	editLine(event: LineInterface) {
		this.isEditMode = true;
		this.selectedLineId = event.id;
		this.form.patchValue({
			...event,
			id: event.id,
			lineDescription: event.lineDescription,
		});
		this.openModal();
	}

	createLine() {
		this.isEditMode = false;
		this.form.reset();
		const user = this.authService.user();
		this.form.patchValue({
			createBy: user?.email ?? 'Leonardo',
			active: true,
		});
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'Leonardo';

			if (this.isEditMode && this.selectedLineId) {
				const updateData: UpdateLineInterface = {
					lineDescription: formData.lineDescription,
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					createBy: formData.createBy,
				};
				this.lineService.updateLine(this.selectedLineId, updateData).subscribe(() => {
					this.lines$.reload();
					this.closeModal();
				});
			} else {
				const createLineData: CreateLineInterface = {
					createBy: userEmail,
					lineDescription: formData.lineDescription,
				};
				this.lineService.createLine(createLineData).subscribe(() => {
					this.lines$.reload();
					this.closeModal();
				});
			}
		}
	}
}
