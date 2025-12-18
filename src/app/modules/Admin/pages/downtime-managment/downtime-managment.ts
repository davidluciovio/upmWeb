import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { Authentication } from '../../../auth/services/authentication';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { DowntimeManager, DowntimeRequestInterface, DowntimeResponseInterface } from '../../services/downtime-manager';

@Component({
	selector: 'app-downtime-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud],
	templateUrl: './downtime-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeManagment {
	private readonly downtimeService = inject(DowntimeManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly downtimes$ = rxResource({
		stream: () =>
			this.downtimeService.getDowntimes().pipe(
				map((downtimes) => {
					return downtimes.sort((a, b) => a.downtimeDescription.localeCompare(b.downtimeDescription));
				}),
			),
	});

	form: FormGroup = this.fb.group({
		id: [''],
		active: [false],
		downtimeDescription: ['', Validators.required],
		inforCode: ['', Validators.required],
		plcCode: ['', Validators.required],
		isDirectDowntime: [false],
		programable: [false],
		createBy: [''],
	});

	isEditMode = false;
	selectedDowntimeId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
		{ key: 'downtimeDescription', label: 'Descripción', active: true },
		{ key: 'inforCode', label: 'Código Infor', active: true },
		{ key: 'plcCode', label: 'Código PLC', active: true },
		{ key: 'isDirectDowntime', label: 'Directo', dataType: 'boolean', active: true },
		{ key: 'programable', label: 'Programable', dataType: 'boolean', active: true },
	];

	openModal() {
		const modal = document.getElementById('downtime_modal') as HTMLDialogElement;
		modal.showModal();
	}

	closeModal() {
		const modal = document.getElementById('downtime_modal') as HTMLDialogElement;
		modal.close();
	}

	deleteDowntime(event: DowntimeResponseInterface) {
		this.downtimeService.deleteDowntime(event.id).subscribe(() => {
			this.downtimes$.reload();
		});
	}

	editDowntime(event: DowntimeResponseInterface) {
		this.isEditMode = true;
		this.selectedDowntimeId = event.id;
		this.form.patchValue(event);
		this.openModal();
	}

	createDowntime() {
		this.isEditMode = false;
		this.form.reset();
		const user = this.authService.user();
		this.form.patchValue({
			createBy: user ? user.email : 'System',
			active: true,
			isDirectDowntime: false,
			programable: false,
		});
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';

			if (this.isEditMode && this.selectedDowntimeId) {
				const updateData: DowntimeResponseInterface = {
					...formData,
					id: this.selectedDowntimeId,
					createBy: userEmail,
				};
				this.downtimeService.updateDowntime(updateData).subscribe(() => {
					this.downtimes$.reload();
					this.closeModal();
				});
			} else {
				const createData: DowntimeRequestInterface = {
					downtimeDescription: formData.downtimeDescription,
					inforCode: formData.inforCode,
					plcCode: formData.plcCode,
					isDirectDowntime: formData.isDirectDowntime,
					programable: formData.programable,
					createBy: userEmail,
				};
				this.downtimeService.createDowntime(createData).subscribe(() => {
					this.downtimes$.reload();
					this.closeModal();
				});
			}
		}
	}
}
