import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
	CreatePartNumberLocationInterface,
	PartNumberLocationInterface,
	PartNumberLocationManager,
	UpdatePartNumberLocationInterface,
} from '../../services/part-number-location-manager';
import { PartNumberManager } from '../../services/part-number-manager';
import { LocationManagerService } from '../../services/location-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';

@Component({
	selector: 'app-part-number-location-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud],
	templateUrl: './part-number-location-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberLocationManagment {
	private readonly partNumberLocationService = inject(PartNumberLocationManager);
	private readonly partNumberService = inject(PartNumberManager);
	private readonly locationService = inject(LocationManagerService);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly partNumberLocation$ = rxResource({
		stream: () =>
			this.partNumberLocationService.getPartNumberLocations().pipe(
				map((partNumberLocations) => {
					return partNumberLocations;
				}),
			),
	});

	readonly partNumbers$ = rxResource({
		stream: () =>
			this.partNumberService.getPartNumbers().pipe(
				map((partNumbers) => {
					return partNumbers.sort((a, b) => a.partNumberName.localeCompare(b.partNumberName));
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

	partNumberSearch = signal('');
	locationSearch = signal('');
	showPartNumberDropdown = signal(false);
	showLocationDropdown = signal(false);

	filteredPartNumbers = computed(() => {
		const search = this.partNumberSearch().toLowerCase();
		const list = this.partNumbers$.value() || [];
		return list.filter((item) => item.partNumberName.toLowerCase().includes(search));
	});

	filteredLocations = computed(() => {
		const search = this.locationSearch().toLowerCase();
		const list = this.locations$.value() || [];
		return list.filter((item) => item.locationDescription.toLowerCase().includes(search));
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: ['false'],
		createDate: [''],
		createBy: ['Leonardo', Validators.required],
		partNumberId: ['', Validators.required],
		locationId: ['', Validators.required],
	});

	isEditMode = false;
	selectedPartNumberLocationId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'partNumber', label: 'Part Number' },
		{ key: 'location', label: 'Ubicación' },
	];

	openModal() {
		const modal = document.getElementById('part_number_location_modal') as HTMLDialogElement;
		modal.showModal();
	}

	closeModal() {
		const modal = document.getElementById('part_number_location_modal') as HTMLDialogElement;
		modal.close();
	}

	deletePartNumberLocation(event: PartNumberLocationInterface) {
		this.partNumberLocationService.deletePartNumberLocation(event.id).subscribe(() => {
			this.partNumberLocation$.reload();
		});
	}

	editPartNumberLocation(event: PartNumberLocationInterface) {
		const partNumber = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);
		const location = this.locations$.value()?.find((item) => item.locationDescription === event.location);
		this.isEditMode = true;
		this.selectedPartNumberLocationId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber?.id,
			locationId: location?.id,
		});

		// Initialize search inputs with current names
		this.partNumberSearch.set(event.partNumber);
		this.locationSearch.set(event.location);

		this.openModal();
	}

	createPartNumberLocation() {
		this.isEditMode = false;
		this.form.reset();
		this.partNumberSearch.set('');
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
		this.partNumberSearch.set(item.partNumberName);
		this.showPartNumberDropdown.set(false);
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

			if (this.isEditMode && this.selectedPartNumberLocationId) {
				const updateData: UpdatePartNumberLocationInterface = {
					partNumberId: formData.partNumberId,
					locationId: formData.locationId,
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					createBy: formData.createBy,
				};
				this.partNumberLocationService.updatePartNumberLocation(this.selectedPartNumberLocationId, updateData).subscribe(() => {
					this.partNumberLocation$.reload();
					this.closeModal();
				});
			} else {
				const createPartNumberLocationData: CreatePartNumberLocationInterface = {
					createBy: userEmail,
					updateBy: userEmail,
					partNumberId: formData.partNumberId,
					locationId: formData.locationId,
				};
				this.partNumberLocationService.createPartNumberLocation(createPartNumberLocationData).subscribe(() => {
					this.partNumberLocation$.reload();
					this.closeModal();
				});
			}
		}
	}
}
