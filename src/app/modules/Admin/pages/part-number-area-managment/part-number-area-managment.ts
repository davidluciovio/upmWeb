import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
	CreatePartNumberAreaInterface,
	PartNumberAreaInterface,
	PartNumberAreaManager,
	UpdatePartNumberAreaInterface,
} from '../../services/part-number-area-manager';
import { PartNumberManager } from '../../services/part-number-manager';
import { AreaManagerService } from '../../services/area-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';

@Component({
	selector: 'app-part-number-area-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud],
	templateUrl: './part-number-area-managment.html',  
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberAreaManagment {
	private readonly partNumberAreaService = inject(PartNumberAreaManager);
	private readonly partNumberService = inject(PartNumberManager);
	private readonly areaService = inject(AreaManagerService);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly partNumberArea$ = rxResource({
		stream: () =>
			this.partNumberAreaService.getPartNumberAreas().pipe(
				map((partNumberAreas) => {
					return partNumberAreas;
				}),
			),
	});

	readonly partNumbers$ = rxResource({
		stream: () => this.partNumberService.getPartNumbers().pipe(map((partNumbers) => {
			return partNumbers.sort((a, b) => a.partNumberName.localeCompare(b.partNumberName))	;
		})),
	});

	readonly areas$ = rxResource({
		stream: () => this.areaService.getAreas().pipe(map((areas) => {
			return areas.sort((a, b) => a.areaDescription.localeCompare(b.areaDescription));
		})),
	});

	partNumberSearch = signal('');
	areaSearch = signal('');
	showPartNumberDropdown = signal(false);
	showAreaDropdown = signal(false);

	filteredPartNumbers = computed(() => {
		const search = this.partNumberSearch().toLowerCase();
		const list = this.partNumbers$.value() || [];
		return list.filter((item) => item.partNumberName.toLowerCase().includes(search));
	});

	filteredAreas = computed(() => {
		const search = this.areaSearch().toLowerCase();
		const list = this.areas$.value() || [];
		return list.filter((item) => item.areaDescription.toLowerCase().includes(search));
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: ['false'],
		createDate: [''],
		createBy: ['23905', Validators.required],
		partNumberId: ['', Validators.required],
		areaId: ['', Validators.required],
	});

	isEditMode = false;
	selectedPartNumberAreaId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'partNumber', label: 'Part Number' },
		{ key: 'area', label: 'Area' },
	];

	openModal() {
		const modal = document.getElementById('part_number_area_modal') as HTMLDialogElement;
		modal.showModal();
	}

	closeModal() {
		const modal = document.getElementById('part_number_area_modal') as HTMLDialogElement;
		modal.close();
	}

	deletePartNumberArea(event: PartNumberAreaInterface) {
		this.partNumberAreaService.deletePartNumberArea(event.id).subscribe(() => {
			this.partNumberArea$.reload();
		});
	}

	editPartNumberArea(event: PartNumberAreaInterface) {
		const partNumber = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);
		const area = this.areas$.value()?.find((item) => item.areaDescription === event.area);
		
		this.isEditMode = true;
		this.selectedPartNumberAreaId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber?.id,
			areaId: area?.id,
		});

		// Initialize search inputs with current names
		this.partNumberSearch.set(event.partNumber);
		this.areaSearch.set(event.area);

		this.openModal();
	}

	createPartNumberArea() {
		this.isEditMode = false; 
		this.form.reset();
		this.partNumberSearch.set('');
		this.areaSearch.set('');
		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email });
		} else {
			this.form.patchValue({ createBy: 'Leonardo' });
		}
		this.openModal();
	}

	selectPartNumber(item: any) {
		this.form.patchValue({ partNumberId: item.id });
		this.partNumberSearch.set(item.partNumberName);
		this.showPartNumberDropdown.set(false);
	}

	selectArea(item: any) {
		this.form.patchValue({ areaId: item.id });
		this.areaSearch.set(item.areaDescription);
		this.showAreaDropdown.set(false);
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'Leonardo';

			if (this.isEditMode && this.selectedPartNumberAreaId) {
				const updateData: UpdatePartNumberAreaInterface = {
					partNumberId: formData.partNumberId,
					areaId: formData.areaId,
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					createBy: formData.createBy,
				};
				this.partNumberAreaService.updatePartNumberArea(this.selectedPartNumberAreaId, updateData).subscribe(() => {
					this.partNumberArea$.reload();
					this.closeModal();
				});
			} else {
				const createPartNumberAreaData: CreatePartNumberAreaInterface = {
					createBy: userEmail,
					updateBy: userEmail,
					partNumberId: formData.partNumberId,
					areaId: formData.areaId,
				};
				this.partNumberAreaService.createPartNumberArea(createPartNumberAreaData).subscribe(() => {
					this.partNumberArea$.reload();
					this.closeModal();
				});
			}
		}
	}
}
