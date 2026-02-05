import { Component, ChangeDetectionStrategy, signal, inject, output, OnInit, input, computed } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { LoadData, OperationalAnalysisRequestInterface } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Authentication } from '../../../../../../auth/services/authentication';

@Component({
	selector: 'filter-bar',
	imports: [FormsModule, ReactiveFormsModule, MultiSelect, DatePicker, ButtonModule],
	template: `
		@if (filterData$.isLoading()) {
			<div class="flex justify-center p-4">
				<span class="loading loading-spinner loading-md"></span>
			</div>
		} @else {
			@if (filterData$.hasValue()) {
				<form
					[formGroup]="form"
					(ngSubmit)="onSubmit()"
					class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4 p-4 rounded-lg items-end"
				>
					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-surface-100 ml-1">Fecha Inicio</span>
						<p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-surface-100 ml-1">Fecha Fin</span>
						<p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>
					@if (showArea()) {
						<div class="flex flex-col gap-1 w-full">
							<label for="areaSelect" class="text-xs font-bold text-surface-100 ml-1">Área</label>
							<p-multiSelect
								[options]="filterData$.value().areas"
								formControlName="areas"
								placeholder="Seleccionar"
								display="chip"
								[filter]="true"
								[showClear]="true"
							/>
						</div>
					}
					<div class="flex flex-col gap-1 w-full">
						<label for="partNumberselect" class="text-xs font-bold text-surface-100 ml-1">Gerentes</label>
						<p-multiSelect
							[options]="filterData$.value().managments"
							formControlName="managments"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="shiftSelect" class="text-xs font-bold text-surface-100 ml-1">Jefes</label>
						<p-multiSelect
							[options]="filterData$.value().jefes"
							formControlName="jefes"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="supervisorSelect" class="text-xs font-bold text-surface-100 ml-1">Supervisor</label>
						<p-multiSelect
							[options]="filterData$.value().supervisors"
							formControlName="supervisors"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="leaderSelect" class="text-xs font-bold text-surface-100 ml-1">Leader</label>
						<p-multiSelect
							[options]="filterData$.value().leaders"
							formControlName="leaders"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>

					@if (showPresses()) {
						<div class="flex flex-col gap-1 w-full">
							<label for="pressSelect" class="text-xs font-bold text-surface-100 ml-1">Prensa</label>
							<p-multiSelect
								[options]="availablePresses()"
								formControlName="presses"
								placeholder="Seleccionar"
								display="chip"
								[filter]="true"
								[showClear]="true"
							/>
						</div>
					}

					<div class="flex flex-row justify-evenly sm:col-span-2 lg:col-span-3 xl:col-span-1 gap-1 w-full">
						<p-button type="submit" label="BUSCAR" fluid="true" class="w-full"></p-button>
						@if (isSuperAdmin()) {
							<p-button severity="info" fluid="true" [loading]="isSyncing()" (click)="onSyncClick.emit()">
								<ng-template pTemplate="icon"><span class="material-symbols-outlined">refresh</span></ng-template>
							</p-button>
						}
						<p-button severity="secondary" fluid="true" (click)="clear()"
							><ng-template pTemplate="icon"><span class="material-symbols-outlined">delete</span></ng-template></p-button
						>
					</div>
				</form>
			} @else {
				<div class="alert alert-info">No hay datos</div>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class:
			'flex justify-center bg-sky-900/90 dark:bg-surface-900/60 border border-surface-200/20 dark:border-surface-900/5 shadow-xl rounded-xl backdrop-blur-xl',
	},
})
export class FilterBar implements OnInit {
	showArea = input<boolean>(true);
	showPresses = input<boolean>(false);
	public isSyncing = input<boolean>(false);
	private readonly _loadData = inject(LoadData);
	private readonly _fb = inject(FormBuilder);
	private readonly _filterInitialData = signal<any>({
		startDate: (() => {
			const d = new Date();
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			return new Date(year, Number(month) - 1, 1);
		})(),
		// startDate: '2026-01-27',
		endDate: new Date(),
		areas: [],
		supervisors: [],
		leaders: [],
		managments: [],
		jefes: [],
		partNumbers: [],
		shifts: [],
		presses: [],
	});

	public authService = inject(Authentication);

	public isSuperAdmin = computed(() => {
		return this.authService.isSuperAdmin();
	});

	public filters = output<OperationalAnalysisRequestInterface>();
	public onSyncClick = output<void>();

	form = this._fb.group({
		startDate: [this._filterInitialData().startDate, Validators.required],
		endDate: [this._filterInitialData().endDate, Validators.required],
		areas: [this._filterInitialData().areas],
		supervisors: [this._filterInitialData().supervisors],
		leaders: [this._filterInitialData().leaders],
		managments: [this._filterInitialData().managments],
		jefes: [this._filterInitialData().jefes],
		partNumbers: [this._filterInitialData().partNumbers],
		shifts: [this._filterInitialData().shifts],
		presses: [[] as string[]],
	});

	availablePresses = computed(() => {
		const pns = this.filterData$.value().managments;
		if (!pns || pns.length === 0) return [];
		const presses = new Set<string>();
		pns.forEach((pn) => {
			const pressName = this.extractPress(pn);
			if (pressName) presses.add(pressName);
		});
		return Array.from(presses).sort();
	});

	filterData$ = rxResource({
		stream: () => this._loadData.getFiltersData(),
		defaultValue: {
			startDate: new Date(),
			endDate: new Date(),
			leaders: [],
			managments: [],
			areas: [],
			supervisors: [],
			jefes: [],
			partNumbers: [],
			shifts: [],
		},
	});

	constructor() {}
	ngOnInit(): void {
		const { presses, ...filters } = this._filterInitialData();
		this.filters.emit(filters as OperationalAnalysisRequestInterface);
	}

	clear() {
		this.form.setValue(this._filterInitialData());
		const { presses, ...filters } = this._filterInitialData();
		this.filters.emit(filters as OperationalAnalysisRequestInterface);
	}

	onSubmit() {
		const formValue = this.form.getRawValue();
		const { presses, ...filters } = formValue as any;

		let selectedPNs = [...(filters.managments || [])];

		if (this.showPresses() && presses?.length > 0) {
			const pnsByPress = this.filterData$.value().managments.filter((pn) => {
				const pressName = this.extractPress(pn);
				return presses.includes(pressName);
			});
			selectedPNs = Array.from(new Set([...selectedPNs, ...pnsByPress]));
		}

		this.filters.emit({
			...filters,
			managments: selectedPNs,
		} as OperationalAnalysisRequestInterface);
	}

	private extractPress(pn: string): string {
		if (pn.includes(' - ')) {
			const parts = pn.split(' - ');
			return parts[parts.length - 1].trim();
		} else {
			const parts = pn.split('-');
			return parts[parts.length - 1].trim();
		}
	}
}
