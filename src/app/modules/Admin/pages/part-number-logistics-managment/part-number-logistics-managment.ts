import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
	CreatePartNumberAreaInterface,
	PartNumberAreaInterface,
	PartNumberAreaManager,
	UpdatePartNumberAreaInterface,
} from '../../services/part-number-logistics-manager';
import { PartNumberManager } from '../../services/part-number-manager';
import { AreaManagerService } from '../../services/area-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';
import { LocationManagerService } from '../../services/location-manager';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
	selector: 'app-part-number-logistics-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
	templateUrl: './part-number-logistics-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberLogisticsManagment {
	private readonly partNumberAreaService = inject(PartNumberAreaManager);
	private readonly partNumberservice = inject(PartNumberManager);
	private readonly areaService = inject(AreaManagerService);
	private readonly locationService = inject(LocationManagerService);
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
		stream: () =>
			this.partNumberservice.getpartNumbers().pipe(
				map((partNumbers) => {
					return partNumbers.sort((a, b) => a.partNumberName.localeCompare(b.partNumberName));
				}),
			),
	});

	readonly areas$ = rxResource({
		stream: () =>
			this.areaService.getAreas().pipe(
				map((areas) => {
					return areas.sort((a, b) => a.areaDescription.localeCompare(b.areaDescription));
				}),
			),
	});

	readonly locations$ = rxResource({
		stream: () =>
			this.locationService.getLocations().pipe(
				map((locations) => {
					return locations.sort((a, b) => a.locationDescription.localeCompare(b.locationDescription));
				}),
			),
	});

	partNumbersearch = signal('');
	areaSearch = signal('');
	locationSearch = signal('');
	showPartNumberDropdown = signal(false);
	showAreaDropdown = signal(false);
	showLocationDropdown = signal(false);

	filteredpartNumbers = computed(() => {
		const search = this.partNumbersearch().toLowerCase();
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
		locationId: ['', Validators.required],
		snp: ['', Validators.required],
	});

	isEditMode = false;
	selectedPartNumberAreaId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'partNumber', label: 'Part Number' },
		{ key: 'area', label: 'Area' },
		{ key: 'location', label: 'Ubicación' },
		{ key: 'snp', label: 'SNP', dataType: 'number' },
	];

	dialogVisible = false;

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deletePartNumberArea(event: PartNumberAreaInterface) {
		this.partNumberAreaService.deletePartNumberArea(event.id).subscribe(() => {
			this.partNumberArea$.reload();
		});
	}

	editPartNumberArea(event: PartNumberAreaInterface) {
		const partNumber = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);
		const area = this.areas$.value()?.find((item) => item.areaDescription === event.area);
		const location = this.locations$.value()?.find((item) => item.locationDescription === event.location);
		const snp = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);

		this.isEditMode = true;
		this.selectedPartNumberAreaId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber?.id,
			areaId: area?.id,
			locationId: location?.id,
			snp: snp?.snp,
		});

		// Initialize search inputs with current names
		this.partNumbersearch.set(event.partNumber);
		this.areaSearch.set(event.area);
		this.locationSearch.set(event.location);

		this.openModal();
	}

	createPartNumberArea() {
		this.isEditMode = false;
		this.form.reset();
		this.partNumbersearch.set('');
		this.areaSearch.set('');
		this.locationSearch.set('');
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
		this.partNumbersearch.set(item.partNumberName);
		this.showPartNumberDropdown.set(false);
	}

	selectArea(item: any) {
		this.form.patchValue({ areaId: item.id });
		this.areaSearch.set(item.areaDescription);
		this.showAreaDropdown.set(false);
	}

	selectLocation(item: any) {
		this.form.patchValue({ locationId: item.id });
		this.locationSearch.set(item.locationDescription);
		this.showLocationDropdown.set(false);
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
					locationId: formData.locationId,
					snp: formData.snp,
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
					locationId: formData.locationId,
					snp: formData.snp,
				};
				this.partNumberAreaService.createPartNumberArea(createPartNumberAreaData).subscribe(() => {
					this.partNumberArea$.reload();
					this.closeModal();
				});
			}
		}
	}
}
