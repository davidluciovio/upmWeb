import { Component, ChangeDetectionStrategy, signal, inject, output, OnInit, input, computed, OnDestroy } from '@angular/core';
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
					class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4 p-4 rounded-lg items-end bg-[#024a70] shadow-2xl"
				>
					<div class="flex flex-col gap-1 w-full">
						<span class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Fecha Inicio</span>
						<p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

					<div class="flex flex-col gap-1 w-full">
						<span class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Fecha Fin</span>
						<p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>
					@if (showArea()) {
						<div class="flex flex-col gap-1 w-full">
							<label for="areaSelect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Área</label>
							<p-multiSelect
								[options]="filterData$.value().areas"
								formControlName="areas"
								placeholder="Seleccionar"
								display="chip"
								[filter]="true"
								[showClear]="true"
								appendTo="body"
							/>
						</div>
					}
					<div class="flex flex-col gap-1 w-full">
						<label for="partNumberselect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Gerentes</label>
						<p-multiSelect
							[options]="filterData$.value().managments"
							formControlName="managments"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
							appendTo="body"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="shiftSelect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Jefes</label>
						<p-multiSelect
							[options]="filterData$.value().jefes"
							formControlName="jefes"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
							appendTo="body"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="supervisorSelect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Supervisor</label>
						<p-multiSelect
							[options]="filterData$.value().supervisors"
							formControlName="supervisors"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
							appendTo="body"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="leaderSelect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Leader</label>
						<p-multiSelect
							[options]="filterData$.value().leaders"
							formControlName="leaders"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
							appendTo="body"
						/>
					</div>

					@if (showPresses()) {
						<div class="flex flex-col gap-1 w-full">
							<label for="pressSelect" class="text-sm font-black ml-1 uppercase tracking-tight" [style.color]="'#ffffff'">Prensa</label>
							<p-multiSelect
								[options]="availablePresses()"
								formControlName="presses"
								placeholder="Seleccionar"
								display="chip"
								[filter]="true"
								[showClear]="true"
								appendTo="body"
							/>
						</div>
					}

					<div class="flex flex-row justify-evenly sm:col-span-2 lg:col-span-3 xl:col-span-1 gap-1 w-full">
						<p-button
							type="submit"
							label="BUSCAR"
							fluid="true"
							[style]="{ 'background-color': '#0ea5e9', 'border-color': '#0ea5e9' }"
							class="w-full"
						></p-button>
						@if (isSuperAdmin() || isAdmin()) {
							<p-button
								[style]="{ 'background-color': '#10b981', 'border-color': '#10b981' }"
								fluid="true"
								[loading]="isSyncing()"
								(click)="onSyncClick.emit()"
							>
								<ng-template pTemplate="icon"><span class="material-symbols-outlined">refresh</span></ng-template>
							</p-button>
						}
						<p-button [style]="{ 'background-color': '#64748b', 'border-color': '#64748b' }" fluid="true" (click)="clear()"
							><ng-template pTemplate="icon"><span class="material-symbols-outlined">delete</span></ng-template></p-button
						>
						<p-button [style]="{ 'background-color': '#4f46e5', 'border-color': '#4f46e5' }" fluid="true" (click)="onPresentationModeClick.emit()">
							<ng-template pTemplate="icon"><span class="material-symbols-outlined">slideshow</span></ng-template>
						</p-button>
					</div>
				</form>
			} @else {
				<div class="alert alert-info">No hay datos</div>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'flex justify-center bg-[#024a70] dark:bg-[#024a70] border border-[#024a70] dark:border-[#024a70] shadow-xl rounded-xl',
	},
})
export class FilterBar implements OnInit, OnDestroy {
	showArea = input<boolean>(true);
	showPresses = input<boolean>(false);
	public isSyncing = input<boolean>(false);
	private readonly _loadData = inject(LoadData);
	private readonly _fb = inject(FormBuilder);
	private _refreshIntervalId: any;
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

	public isAdmin = computed(() => {
		return this.authService.isAdmin();
	});

	public filters = output<OperationalAnalysisRequestInterface>();
	public onSyncClick = output<void>();
	public onPresentationModeClick = output<void>();

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

	constructor() {
		// Actualizar opciones de filtros cada hora
		this._refreshIntervalId = setInterval(() => {
			console.log('Actualizando opciones de filtros...');
			this.filterData$.reload();
		}, 3600000);
	}
	ngOnInit(): void {
		const { presses, ...filters } = this._filterInitialData();
		this.filters.emit(filters as OperationalAnalysisRequestInterface);
	}

	ngOnDestroy(): void {
		if (this._refreshIntervalId) {
			clearInterval(this._refreshIntervalId);
		}
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
