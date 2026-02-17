import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Shared
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../../../../auth/services/authentication';

// Services
import {
	PartNumberStructureManager,
	CreatePartNumberStructureInterface,
	UpdatePartNumberStructureInterface,
	PartNumberStructureInterface,
} from '../../services/part-number-structure-manager';
import { PartNumberAreaInterface, PartNumberAreaManager } from '../../../../../../Admin/services/part-number-logistics-manager';
import { PartNumberInterface, PartNumberManager } from '../../../../../../Admin/services/part-number-manager';
import { MaterialSupplierInterface, MaterialSupplierManager } from '../../services/material-supplier-manager';

@Component({
	selector: 'partnumber-structure',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableCrud,
		DialogModule,
		ButtonModule,
		InputTextModule,
		AutoCompleteModule,
		InputNumberModule,
		ToggleSwitchModule,
		ProgressSpinnerModule,
	],
	template: `
		<div class="p-4 h-full flex flex-col gap-4">
			<div class="flex items-center justify-between mb-2">
				<div>
					<h1 class="text-2xl font-bold text-slate-800 dark:text-white">Estructura de Número de Parte</h1>
					<p class="text-slate-500 dark:text-slate-400 text-sm">Determine los componentes y proveedores para cada parte logística</p>
				</div>
				<button pButton pRipple label="Nueva Estructura" icon="pi pi-plus" (click)="createStructure()" class="p-button-primary"></button>
			</div>

			<div class="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
				@if (structures$.isLoading()) {
					<div class="flex flex-col items-center justify-center h-64 gap-4">
						<p-progressSpinner styleClass="w-12 h-12" strokeWidth="4" fill="transparent" animationDuration=".5s"></p-progressSpinner>
						<span class="text-slate-500 animate-pulse font-medium">Cargando estructuras...</span>
					</div>
				} @else {
					<table-crud
						[data]="structures$.value() || []"
						[columns]="columns"
						(edit)="editStructure($event)"
						(delete)="deleteStructure($event)"
						(create)="createStructure()"
					></table-crud>
				}
			</div>
		</div>

		<p-dialog
			[header]="isEditMode ? 'Editar Estructura' : 'Nueva Estructura'"
			[(visible)]="dialogVisible"
			[modal]="true"
			[style]="{ width: '100%', maxWidth: '500px' }"
			[draggable]="false"
			[resizable]="false"
			[dismissableMask]="true"
			appendTo="body"
		>
			<form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-6 pt-4">
				<div class="grid grid-cols-1 gap-5">
					<!-- Part Number Logistic Selection -->
					<div class="flex flex-col gap-2">
						<label for="logisticPart" class="text-sm font-bold text-slate-700 dark:text-slate-300">Parte Logística (Principal)</label>
						<p-autoComplete
							formControlName="partNumberLogisticId"
							[suggestions]="filteredLogistics()"
							(completeMethod)="filterLogistics($event)"
							optionLabel="partNumber"
							field="partNumber"
							placeholder="Buscar número de parte logística..."
							[dropdown]="true"
							styleClass="w-full"
							inputStyleClass="w-full"
						></p-autoComplete>
					</div>

					<!-- Component Part Selection -->
					<div class="flex flex-col gap-2">
						<label for="componentPart" class="text-sm font-bold text-slate-700 dark:text-slate-300">Componente (Parte Completa)</label>
						<p-autoComplete
							formControlName="completePartId"
							[suggestions]="filteredComponents()"
							(completeMethod)="filterComponents($event)"
							optionLabel="partNumberName"
							field="partNumberName"
							placeholder="Buscar componente..."
							[dropdown]="true"
							styleClass="w-full"
							inputStyleClass="w-full"
						></p-autoComplete>
					</div>

					<!-- Supplier Selection -->
					<div class="flex flex-col gap-2">
						<label for="supplier" class="text-sm font-bold text-slate-700 dark:text-slate-300">Proveedor de Material</label>
						<p-autoComplete
							formControlName="materialSuplierId"
							[suggestions]="filteredSuppliers()"
							(completeMethod)="filterSuppliers($event)"
							optionLabel="supplierName"
							field="supplierName"
							placeholder="Buscar proveedor..."
							[dropdown]="true"
							styleClass="w-full"
							inputStyleClass="w-full"
						></p-autoComplete>
					</div>

					<!-- Quantity -->
					<div class="flex flex-col gap-2">
						<label for="quantity" class="text-sm font-bold text-slate-700 dark:text-slate-300">Cantidad</label>
						<p-inputNumber
							id="quantity"
							formControlName="quantity"
							[showButtons]="true"
							buttonLayout="horizontal"
							spinnerMode="horizontal"
							inputId="horizontal"
							decrementButtonClass="p-button-secondary"
							incrementButtonClass="p-button-secondary"
							incrementButtonIcon="pi pi-plus"
							decrementButtonIcon="pi pi-minus"
							[min]="1"
							styleClass="w-full"
						></p-inputNumber>
					</div>

					<!-- Active Status -->
					<div class="flex items-center gap-3 mt-2">
						<p-toggleSwitch formControlName="active"></p-toggleSwitch>
						<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Estructura Activa</span>
					</div>
				</div>

				<div class="flex justify-end gap-3 mt-4">
					<button pButton type="button" label="Cancelar" class="p-button-text p-button-secondary" (click)="dialogVisible = false"></button>
					<button pButton type="submit" [label]="isEditMode ? 'Actualizar' : 'Guardar'" [disabled]="form.invalid" class="p-button-primary px-6"></button>
				</div>
			</form>
		</p-dialog>
	`,
	host: {
		class: 'flex flex-col w-full h-full',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartNumberStructure implements OnInit {
	private readonly _structureService = inject(PartNumberStructureManager);
	private readonly _logisticService = inject(PartNumberAreaManager);
	private readonly _partNumberService = inject(PartNumberManager);
	private readonly _supplierService = inject(MaterialSupplierManager);
	private readonly _fb = inject(FormBuilder);
	private readonly _authService = inject(Authentication);

	// Data resources
	readonly structures$ = rxResource<PartNumberStructureInterface[], any>({
		stream: () => this._structureService.getStructures(),
	});

	readonly logistics$ = rxResource<PartNumberAreaInterface[], any>({
		stream: () => this._logisticService.getPartNumberAreas(),
	});

	readonly components$ = rxResource<PartNumberInterface[], any>({
		stream: () => this._partNumberService.getpartNumbers(),
	});

	readonly suppliers$ = rxResource<MaterialSupplierInterface[], any>({
		stream: () => this._supplierService.getSuppliers(),
	});

	// Filtering signals
	logisticQuery = signal('');
	componentQuery = signal('');
	supplierQuery = signal('');

	filteredLogistics = computed(() => {
		const query = this.logisticQuery().toLowerCase();
		const items = this.logistics$.value() || [];
		return items.filter((i: PartNumberAreaInterface) => i.partNumber.toLowerCase().includes(query));
	});

	filteredComponents = computed(() => {
		const query = this.componentQuery().toLowerCase();
		const items = this.components$.value() || [];
		return items.filter((i: PartNumberInterface) => i.partNumberName.toLowerCase().includes(query));
	});

	filteredSuppliers = computed(() => {
		const query = this.supplierQuery().toLowerCase();
		const items = this.suppliers$.value() || [];
		return items.filter((i: MaterialSupplierInterface) => i.supplierName.toLowerCase().includes(query));
	});

	// UI State
	dialogVisible = false;
	isEditMode = false;
	selectedStructureId: string | null = null;

	columns: ColumnConfig[] = [
		{ key: 'active', label: 'Activo', dataType: 'boolean' },
		{ key: 'partNumberLogisticName', label: 'P. Logística' },
		{ key: 'completePartName', label: 'Componente' },
		{ key: 'quantity', label: 'Cantidad', dataType: 'number' },
		{ key: 'materialSuplierName', label: 'Proveedor' },
		{ key: 'createDate', label: 'Creado', dataType: 'date' },
	];

	form: FormGroup = this._fb.group({
		id: [''],
		active: [true],
		partNumberLogisticId: [null, Validators.required],
		completePartId: [null, Validators.required],
		quantity: [1, [Validators.required, Validators.min(1)]],
		materialSuplierId: [null, Validators.required],
	});

	ngOnInit() {}

	filterLogistics(event: any) {
		this.logisticQuery.set(event.query);
	}

	filterComponents(event: any) {
		this.componentQuery.set(event.query);
	}

	filterSuppliers(event: any) {
		this.supplierQuery.set(event.query);
	}

	createStructure() {
		this.isEditMode = false;
		this.selectedStructureId = null;
		this.form.reset({ active: true, quantity: 1 });
		this.dialogVisible = true;
	}

	editStructure(structure: any) {
		this.isEditMode = true;
		this.selectedStructureId = structure.id;

		const logistic = this.logistics$.value()?.find((i) => i.id === structure.partNumberLogisticId);
		const component = this.components$.value()?.find((i) => i.id === structure.completePartId);
		const supplier = this.suppliers$.value()?.find((i) => i.id === structure.materialSuplierId);

		this.form.patchValue({
			...structure,
			partNumberLogisticId: logistic,
			completePartId: component,
			materialSuplierId: supplier,
		});

		this.dialogVisible = true;
	}

	deleteStructure(structure: any) {
		if (confirm('¿Estás seguro de eliminar esta estructura?')) {
			this._structureService.deleteStructure(structure.id).subscribe(() => {
				this.structures$.reload();
			});
		}
	}

	save() {
		if (this.form.valid) {
			const rawValue = this.form.getRawValue();
			const user = this._authService.user()?.email || 'System';

			const partNumberLogisticId = rawValue.partNumberLogisticId?.id || rawValue.partNumberLogisticId;
			const completePartId = rawValue.completePartId?.id || rawValue.completePartId;
			const completePartName = rawValue.completePartId?.partNumberName || rawValue.completePartName;
			const materialSuplierId = rawValue.materialSuplierId?.id || rawValue.materialSuplierId;

			if (this.isEditMode && this.selectedStructureId) {
				const updateData: UpdatePartNumberStructureInterface = {
					id: this.selectedStructureId,
					partNumberLogisticId,
					completePartId,
					completePartName,
					quantity: rawValue.quantity,
					materialSuplierId,
					active: rawValue.active,
					updateBy: user,
				};
				this._structureService.updateStructure(this.selectedStructureId, updateData).subscribe(() => {
					this.structures$.reload();
					this.dialogVisible = false;
				});
			} else {
				const createData: CreatePartNumberStructureInterface = {
					partNumberLogisticId,
					completePartId,
					completePartName,
					quantity: rawValue.quantity,
					materialSuplierId,
					createBy: user,
				};
				this._structureService.createStructure(createData).subscribe(() => {
					this.structures$.reload();
					this.dialogVisible = false;
				});
			}
		}
	}
}
