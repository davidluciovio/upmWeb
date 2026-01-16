import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { LoadData, OperationalAnalysisRequestInterface } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

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
					class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 p-4 border border-base-300 bg-base-100 rounded-lg shadow-sm items-end"
				>
					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-base-content/60 ml-1">Fecha Inicio</span>
						<p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-base-content/60 ml-1">Fecha Fin</span>
						<p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="areaSelect" class="text-xs font-bold text-base-content/60 ml-1">Área</label>
						<p-multiSelect
							[options]="filterData$.value().areas"
							formControlName="areas"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="supervisorSelect" class="text-xs font-bold text-base-content/60 ml-1">Supervisor</label>
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
						<label for="leaderSelect" class="text-xs font-bold text-base-content/60 ml-1">Leader</label>
						<p-multiSelect
							[options]="filterData$.value().leaders"
							formControlName="leaders"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label for="partNumberSelect" class="text-xs font-bold text-base-content/60 ml-1">Part Number</label>
						<p-multiSelect
							[options]="filterData$.value().partNumbers"
							formControlName="partNumbers"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>

					<div class="flex flex-col sm:col-span-2 lg:col-span-3 xl:col-span-1 gap-1 w-full">
						<p-button type="submit" label="BUSCAR" fluid="true"></p-button>
					</div>
				</form>
			} @else {
				<div class="alert alert-info">No hay datos</div>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'flex justify-center ',
	},
})
export class FilterBar {
	private readonly _loadData = inject(LoadData);
	private readonly _fb = inject(FormBuilder);
	private readonly _filterInitialData = signal<OperationalAnalysisRequestInterface>({
		startDate: (() => {
			const d = new Date();
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			return new Date(year, Number(month) - 1, 1);
		})(),
		endDate: new Date(),
		areas: [],
		supervisors: [],
		leaders: [],
		partNumbers: [],
		shifts: [],
	});

	public filters = output<OperationalAnalysisRequestInterface>();

	form = this._fb.group({
		startDate: [this._filterInitialData().startDate, Validators.required],
		endDate: [this._filterInitialData().endDate, Validators.required],
		areas: [this._filterInitialData().areas],
		supervisors: [this._filterInitialData().supervisors],
		leaders: [this._filterInitialData().leaders],
		partNumbers: [this._filterInitialData().partNumbers],
	});

	filterData$ = rxResource({
		stream: () => this._loadData.getFiltersData(),
		defaultValue: {
			startDate: new Date(),
			endDate: new Date(),
			leaders: [],
			partNumbers: [],
			areas: [],
			supervisors: [],
			shifts: [],
		},
	});

	constructor() {}

	onSubmit() {
		this.filters.emit(this.form.value as OperationalAnalysisRequestInterface);
	}
}
