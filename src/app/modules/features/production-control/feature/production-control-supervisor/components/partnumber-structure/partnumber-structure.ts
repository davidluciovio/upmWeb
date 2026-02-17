import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TableCrud, ColumnConfig } from '../../../../../../../shared/components/table-crud/table-crud';
import {
	PartNumberStructureManager,
	PartNumberStructureResponseInterface,
	PartNumberStructureRequestInterface,
} from '../../services/part-number-structure-manager';
import { MaterialSupplierManager } from '../../services/material-supplier-manager';
import { PartNumberAreaManager, PartNumberLogisticsInterface } from '../../../../../../Admin/services/part-number-logistics-manager';
import { PartNumberInterface, PartNumberManager } from '../../../../../../Admin/services/part-number-manager';
import { ProductionStationManager, ProductionStation } from '../../../../../../Admin/services/production-station-manager';
import { ErrorHandlerService } from '../../../../../../../core/services/error-handler';
import { Authentication } from '../../../../../../auth/services/authentication';
import { HttpErrorResponse } from '@angular/common/http';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';
import { ToggleButton } from 'primeng/togglebutton';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from "primeng/table";

@Component({
	selector: 'app-partnumber-structure',
	imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableCrud,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
    Select,
    ToggleButton,
    TreeTableModule,
    TagModule,
    TooltipModule,
    TableModule
],
	templateUrl: './partnumber-structure.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberStructure {
	private readonly structureManager = inject(PartNumberStructureManager);
	private readonly supplierManager = inject(MaterialSupplierManager);
	private readonly pnLogisticManager = inject(PartNumberAreaManager);
	private readonly pnManager = inject(PartNumberManager);
	private readonly stationManager = inject(ProductionStationManager);
	private readonly fb = inject(FormBuilder);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);

	// Resources
	readonly structures$ = rxResource<PartNumberStructureResponseInterface[], any>({
		stream: () =>
			this.structureManager.getStructures().pipe(
				map((items) => {
					console.log(items);
					return items
						? items.sort((a, b) => {
								const stationA = a.productionStation?.partNumber || '';
								const stationB = b.productionStation?.partNumber || '';
								const partA = a.partNumberName || '';
								const partB = b.partNumberName || '';
								return stationA.localeCompare(stationB) || partA.localeCompare(partB);
							})
						: [];
				}),
			),
	});

	readonly suppliers$ = rxResource({
		stream: () => this.supplierManager.getModules().pipe(map((items) => items || [])),
	});

	readonly pnLogistics$ = rxResource<PartNumberLogisticsInterface[], any>({
		stream: () => this.pnLogisticManager.getPartNumberLogistics().pipe(map((items) => items || [])),
	});

	readonly partNumbers$ = rxResource<PartNumberInterface[], any>({
		stream: () => this.pnManager.getpartNumbers().pipe(map((items) => items || [])),
	});

	readonly stations$ = rxResource<ProductionStation[], any>({
		stream: () => this.stationManager.getProductionStations().pipe(map((items) => items || [])),
	});

	constructor() {
		this.form.get('partNumberLogisticId')?.valueChanges.subscribe((id) => {
			if (id) {
				this.autoPopulatePartData(id);
			}
		});
	}

	autoPopulatePartData(logisticId: string) {
		const logistic = this.pnLogistics$.value()?.find((l) => l.id === logisticId);
		if (logistic) {
			const part = this.partNumbers$.value()?.find((p) => p.partNumberName === logistic.partNumber);
			if (part) {
				this.form.patchValue({
					partNumberName: part.partNumberName,
					partNumberDescription: part.partNumberDescription,
				});
			} else {
				// Fallback to logistic's part number name if no full part record found
				this.form.patchValue({
					partNumberName: logistic.partNumber,
					partNumberDescription: '',
				});
			}
		}
	}

	// Form
	form: FormGroup = this.fb.group({
		id: [''],
		partNumberLogisticId: ['', Validators.required],
		productionStationId: ['', Validators.required],
		materialSuplierId: ['', Validators.required],
		partNumberName: ['', Validators.required],
		partNumberDescription: ['', Validators.required],
		active: [true],
		createBy: [''],
		updateBy: [''],
	});

	isEditMode = false;
	selectedStructureId: string | null = null;
	dialogVisible = false;
	viewMode = signal<'table' | 'tree'>('table');

	// Transformation for TreeView
	treeData = computed<TreeNode[]>(() => {
		const structures = this.structures$.value() || [];
		const groups = new Map<string, PartNumberStructureResponseInterface[]>();

		// Group by Station
		structures.forEach((s) => {
			const id = s.productionStationId;
			if (!groups.has(id)) groups.set(id, []);
			groups.get(id)!.push(s);
		});

		// Create TreeNodes
		return Array.from(groups.entries()).map(([stationId, components]) => {
			const first = components[0];
			return {
				data: {
					name: first.productionStation?.partNumber || 'Estación Desconocida',
					description: `Modelo: ${first.productionStation?.model || 'N/A'}`,
					type: 'Producto (Estación)',
					isStation: true,
					stationId: stationId,
				},
				expanded: true,
				children: components.map((c) => ({
					data: {
						name: c.partNumberLogistic?.partNumber || c.partNumberName,
						description: c.partNumberDescription,
						supplier: c.materialSupplierDescription,
						type: 'Componente (Logística)',
						active: c.active,
						isStation: false,
						original: c, // To allow edit from tree
					},
				})),
				stationId: stationId,
			};
		});
	});

	columns: ColumnConfig[] = [
		{ key: 'productionStation.partNumber', label: 'Producto (Estación)', active: true },
		{ key: 'partNumberLogistic.partNumber', label: 'Componente (Logística)', active: true },
		{ key: 'partNumberDescription', label: 'Descripción', active: true },
		{ key: 'materialSupplierDescription', label: 'Proveedor', active: true },
		{ key: 'active', label: 'Activo', dataType: 'boolean', active: true },
	];

	// Computed options for selects
	supplierOptions = computed(() => this.suppliers$.value() || []);
	pnLogisticOptions = computed(() =>
		(this.pnLogistics$.value() || []).map((item) => ({
			...item,
			label: `${item.partNumber} [${item.area} / ${item.location}]`,
		})),
	);
	stationOptions = computed(() =>
		(this.stations$.value() || []).map((item) => ({
			...item,
			label: `${item.partNumber} (Modelo: ${item.model})`,
		})),
	);

	toggleView() {
		this.viewMode.set(this.viewMode() === 'table' ? 'tree' : 'table');
	}

	createStructureFromStation(stationId: string) {
		this.isEditMode = false;
		this.form.reset();
		this.form.patchValue({
			productionStationId: stationId,
			active: true,
		});

		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email, updateBy: user.email });
		}

		this.openModal();
	}

	openModal() {
		this.dialogVisible = true;
	}

	closeModal() {
		this.dialogVisible = false;
	}

	deleteStructure(event: PartNumberStructureResponseInterface) {
		this.structureManager.deleteStructure(event.id).subscribe(() => {
			this.structures$.reload();
		});
	}

	editStructure(event: PartNumberStructureResponseInterface) {
		this.isEditMode = true;
		this.selectedStructureId = event.id;

		this.form.patchValue({
			...event,
		});

		this.openModal();
	}

	createStructure() {
		this.isEditMode = false;
		this.form.reset();
		this.form.patchValue({ active: true, quantity: 0 }); // Default values

		const user = this.authService.user();
		if (user) {
			this.form.patchValue({ createBy: user.email, updateBy: user.email });
		}

		this.openModal();
	}

	save() {
		if (this.form.valid) {
			const formData = this.form.getRawValue();
			const userEmail = this.authService.user()?.email || 'System';

			const requestData: PartNumberStructureRequestInterface = {
				partNumberLogisticId: formData.partNumberLogisticId,
				productionStationId: formData.productionStationId,
				materialSuplierId: formData.materialSuplierId,
				partNumberName: formData.partNumberName,
				partNumberDescription: formData.partNumberDescription,
				active: formData.active === true || formData.active === 'true',
				createBy: this.isEditMode ? formData.createBy : userEmail,
				updateBy: userEmail,
			};

			if (this.isEditMode && this.selectedStructureId) {
				this.structureManager.updateStructure(this.selectedStructureId, requestData).subscribe({
					next: () => {
						this.structures$.reload();
						this.closeModal();
					},
					error: (err: HttpErrorResponse) => {
						this.errorHandler.handleValidationError(err);
					},
				});
			} else {
				this.structureManager.createStructure(requestData).subscribe({
					next: () => {
						this.structures$.reload();
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
