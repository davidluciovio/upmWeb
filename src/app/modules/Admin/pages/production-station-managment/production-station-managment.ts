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
import { ModelManagerService } from '../../services/model-manager';

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
	private readonly modelService = inject(ModelManagerService);
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

	readonly models$ = rxResource({
		stream: () =>
			this.modelService.getModels().pipe(
				map((models) => {
					return models.sort((a, b) => a.modelDescription.localeCompare(b.modelDescription));
				}),
			),
	});

	partNumberSearch = signal('');
	lineSearch = signal('');
	modelSearch = signal('');
	showPartNumberDropdown = signal(false);
	showLineDropdown = signal(false);
	showModelDropdown = signal(false);

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

	filteredModels = computed(() => {
		const search = this.modelSearch().toLowerCase();
		const list = this.models$.value() || [];
		return list.filter((item) => item.modelDescription.toLowerCase().includes(search));
	});

	form: FormGroup = this.fb.group({
		id: [0],
		active: ['false'],
		createDate: [''],
		createBy: ['Leonardo', Validators.required],
		partNumberId: ['', Validators.required],
		lineId: ['', Validators.required],
		modelId: ['', Validators.required],
		objetiveTime: ['', Validators.required],
		netoTime: ['', Validators.required],
		operatorQuantity: ['', Validators.required],
		partNumberQuantity: ['', Validators.required],
	});

	isEditMode = false;
	selectedProductionStationId: string | null = null;

	columns: ColumnConfig[] = [
		// { key: 'id', label: 'ID', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
		{ key: 'createBy', label: 'Creado Por', active: true },
		{ key: 'partNumber', label: 'Part Number', active: true },
		{ key: 'line', label: 'Línea', active: true },
		{ key: 'model', label: 'Modelo', active: true },
		{ key: 'objetiveTime', label: 'Tiempo Objetivo', active: false },
		{ key: 'netoTime', label: 'Tiempo HP', active: false },
		{ key: 'operatorQuantity', label: 'Cantidad de Operadores', active: false },
		{ key: 'partNumberQuantity', label: 'Cantidad de Partes', active: false },
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
		const model = this.models$.value()?.find((item) => item.modelDescription === event.model);
		this.isEditMode = true;
		this.selectedProductionStationId = event.id;
		this.form.patchValue({
			...event,
			partNumberId: partNumber?.id,
			lineId: line?.id,
			modelId: model?.id,
			objetiveTime: event.objetiveTime,
			netoTime: event.netoTime,
			operatorQuantity: event.operatorQuantity,
			partNumberQuantity: event.partNumberQuantity,
		});

		// Initialize search inputs with current names
		this.partNumberSearch.set(event.partNumber);
		this.lineSearch.set(event.line);
		this.modelSearch.set(event.model);

		this.openModal();
	}

	createProductionStation() {
		this.isEditMode = false;
		this.form.reset();
		this.partNumberSearch.set('');
		this.lineSearch.set('');
		this.modelSearch.set('');
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

	selectModel(item: any) {
		this.form.patchValue({ modelId: item.id });
		this.modelSearch.set(item.modelDescription);
		this.showModelDropdown.set(false);
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
					modelId: formData.modelId,
					objetiveTime: formData.objetiveTime,
					netoTime: formData.netoTime,
					operatorQuantity: formData.operatorQuantity,
					partNumberQuantity: formData.partNumberQuantity,
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
					modelId: formData.modelId,
					objetiveTime: formData.objetiveTime,
					netoTime: formData.netoTime,
					operatorQuantity: formData.operatorQuantity,
					partNumberQuantity: formData.partNumberQuantity,
				};
				this.productionStationService.createProductionStation(createData).subscribe(() => {
					this.productionStations$.reload();
					this.closeModal();
				});
			}
		}
	}
}
