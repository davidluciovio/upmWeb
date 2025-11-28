import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
	CreateProductionStation,
	ProductionStation,
	ProductionStationManager,
	UpdateProductionStation,
} from '../../services/production-station-manager';
import { PartNumberManager } from '../../services/part-number-manager';
import { LineManager } from '../../services/line-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';

@Component({
	selector: 'app-production-station-managment',
	imports: [CommonModule, ReactiveFormsModule, TableCrud],
	templateUrl: './production-station-managment.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionStationManagment {
	private readonly productionStationService = inject(ProductionStationManager);
	private readonly partNumberService = inject(PartNumberManager);
	private readonly lineService = inject(LineManager);
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(Authentication);

	readonly productionStations$ = rxResource({
		stream: () =>
			this.productionStationService.getProductionStations().pipe(
				map((productionStations) => {
					return productionStations;
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

	readonly lines$ = rxResource({
		stream: () =>
			this.lineService.getLines().pipe(
				map((lines) => {
					return lines.sort((a, b) => a.lineDescription.localeCompare(b.lineDescription));
				}),
			),
	});

	partNumberSearch = signal('');
	lineSearch = signal('');
	showPartNumberDropdown = signal(false);
	showLineDropdown = signal(false);

	filteredPartNumbers = computed(() => {
		const search = this.partNumberSearch().toLowerCase();
		const list = this.partNumbers$.value() || [];
		return list.filter((item) => item.partNumberName.toLowerCase().includes(search));
	});

	filteredLines = computed(() => {
		const search = this.lineSearch().toLowerCase();
		const list = this.lines$.value() || [];
		return list.filter((item) => item.lineDescription.toLowerCase().includes(search));
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: ['false'],
		createDate: [''],
		createBy: ['Leonardo', Validators.required],
		partNumberId: ['', Validators.required],
		lineId: ['', Validators.required],
	});

	isEditMode = false;
	selectedProductionStationId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'createBy', label: 'Creado Por' },
		{ key: 'partNumber', label: 'Part Number' },
		{ key: 'line', label: 'Línea' },
	];

	openModal() {
		const modal = document.getElementById('production_station_modal') as HTMLDialogElement;
		modal.showModal();
	}

	closeModal() {
		const modal = document.getElementById('production_station_modal') as HTMLDialogElement;
		modal.close();
	}

	deleteProductionStation(event: ProductionStation) {
		this.productionStationService.deleteProductionStation(event.id).subscribe(() => {
			this.productionStations$.reload();
		});
	}

	editProductionStation(event: ProductionStation) {
		const partNumber = this.partNumbers$.value()?.find((item) => item.partNumberName === event.partNumber);
		const line = this.lines$.value()?.find((item) => item.lineDescription === event.line);
		this.isEditMode = true;
		this.selectedProductionStationId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber?.id,
			lineId: line?.id,
		});

		// Initialize search inputs with current names
		this.partNumberSearch.set(event.partNumber);
		this.lineSearch.set(event.line);

		this.openModal();
	}

	createProductionStation() {
		this.isEditMode = false;
		this.form.reset();
		this.partNumberSearch.set('');
		this.lineSearch.set('');
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

	selectLine(item: any) {
		this.form.patchValue({ lineId: item.id });
		this.lineSearch.set(item.lineDescription);
		this.showLineDropdown.set(false);
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'Leonardo';

			if (this.isEditMode && this.selectedProductionStationId) {
				const updateData: UpdateProductionStation = {
					partNumberId: formData.partNumberId,
					lineId: formData.lineId,
					active: formData.active === true || formData.active === 'true',
					updateBy: userEmail,
				};
				this.productionStationService.updateProductionStation(this.selectedProductionStationId, updateData).subscribe(() => {
					this.productionStations$.reload();
					this.closeModal();
				});
			} else {
				const createData: CreateProductionStation = {
					createBy: userEmail,
					updateBy: userEmail,
					partNumberId: formData.partNumberId,
					lineId: formData.lineId,
				};
				this.productionStationService.createProductionStation(createData).subscribe(() => {
					this.productionStations$.reload();
					this.closeModal();
				});
			}
		}
	}
}
