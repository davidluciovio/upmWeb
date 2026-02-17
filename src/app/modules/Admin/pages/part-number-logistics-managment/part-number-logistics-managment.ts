import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
	CreatePartNumberLogisticsInterface,
	PartNumberAreaManager,
	PartNumberLogisticsInterface,
	UpdatePartNumberLogisticsInterface,
} from '../../services/part-number-logistics-manager';
import { PartNumberManager } from '../../services/part-number-manager';
import { AreaManagerService } from '../../services/area-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';
import { LocationManagerService } from '../../services/location-manager';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
	selector: 'app-part-number-logistics-managment',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableCrud,
		DialogModule,
		ButtonModule,
		InputTextModule,
		ToggleSwitchModule,
		AutoCompleteModule,
		InputNumberModule,
		ProgressSpinnerModule,
	],
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
			this.partNumberAreaService.getPartNumberLogistics().pipe(
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

	partNumberQuery = signal('');
	areaQuery = signal('');
	locationQuery = signal('');

	filteredPartNumbers = computed(() => {
		const query = this.partNumberQuery().toLowerCase();
		const items = this.partNumbers$.value() || [];
		return items.filter((i) => i.partNumberName.toLowerCase().includes(query));
	});

	filteredAreas = computed(() => {
		const query = this.areaQuery().toLowerCase();
		const items = this.areas$.value() || [];
		return items.filter((a) => a.areaDescription.toLowerCase().includes(query));
	});

	filteredLocations = computed(() => {
		const query = this.locationQuery().toLowerCase();
		const items = this.locations$.value() || [];
		return items.filter((l) => l.locationDescription.toLowerCase().includes(query));
	});

	filterPartNumbers(event: any) {
		this.partNumberQuery.set(event.query);
	}

	filterAreas(event: any) {
		this.areaQuery.set(event.query);
	}

	filterLocations(event: any) {
		this.locationQuery.set(event.query);
	}

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

	deletePartNumberArea(event: PartNumberLogisticsInterface) {
		this.partNumberAreaService.deletePartNumberLogistics(event.id).subscribe(() => {
			this.partNumberArea$.reload();
		});
	}

	editPartNumberArea(event: PartNumberLogisticsInterface) {
		const partNumber = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);
		const area = this.areas$.value()?.find((item) => item.areaDescription === event.area);
		const location = this.locations$.value()?.find((item) => item.locationDescription === event.location);
		const snp = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);

		this.isEditMode = true;
		this.selectedPartNumberAreaId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber,
			areaId: area,
			locationId: location,
			snp: snp?.snp,
		});

		// Initialize search inputs with current names
		this.partNumberQuery.set(event.partNumber);
		this.areaQuery.set(event.area);
		this.locationQuery.set(event.location);

		this.openModal();
	}

	createPartNumberArea() {
		this.isEditMode = false;
		this.form.reset();
		this.partNumberQuery.set('');
		this.areaQuery.set('');
		this.locationQuery.set('');
		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email });
		} else {
			this.form.patchValue({ createBy: 'Leonardo' });
		}
		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'Leonardo';

			const partNumberId = formData.partNumberId?.id || formData.partNumberId;
			const areaId = formData.areaId?.id || formData.areaId;
			const locationId = formData.locationId?.id || formData.locationId;

			if (this.isEditMode && this.selectedPartNumberAreaId) {
				const updateData: UpdatePartNumberLogisticsInterface = {
					partNumberId: partNumberId,
					areaId: areaId,
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
					createBy: formData.createBy,
					locationId: locationId,
					snp: formData.snp,
				};
				this.partNumberAreaService.updatePartNumberLogistics(this.selectedPartNumberAreaId, updateData).subscribe(() => {
					this.partNumberArea$.reload();
					this.closeModal();
				});
			} else {
				const createPartNumberAreaData: CreatePartNumberLogisticsInterface = {
					createBy: userEmail,
					updateBy: userEmail,
					partNumberId: partNumberId,
					areaId: areaId,
					locationId: locationId,
					snp: formData.snp,
				};
				this.partNumberAreaService.createPartNumberLogistics(createPartNumberAreaData).subscribe(() => {
					this.partNumberArea$.reload();
					this.closeModal();
				});
			}
		}
	}
}
