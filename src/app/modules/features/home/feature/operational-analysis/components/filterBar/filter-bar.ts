import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, signal, inject, OnInit, output } from '@angular/core';
import 'cally';
import { LoadData } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

export interface FilterBarData {
	fechaInicio: string;
	fechaFin: string;
	area: string;
	supervisor: string;
	leader: string;
	partNumber: string;
}

@Component({
	selector: 'filter-bar',
	imports: [FormsModule, ReactiveFormsModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		@if (filterData$.isLoading()) {
			<div>Loading...</div>
		} @else {
			@if (filterData$.hasValue()) {
				<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-row gap-2 p-4 border border-base-300 bg-base-100 rounded-lg shadow-sm ">
					<div class="flex flex-col gap-1 w-60">
						<span class="text-xs font-bold text-base-content/60 ml-1">Fecha Inicio</span>
						<button
							type="button"
							popovertarget="dcally-popover1"
							class="dinput dinput-border w-60 text-left px-3"
							id="dcally1"
							style="anchor-name:--dcally1"
						>
							{{ form.get('fechaInicio')?.value || 'Seleccionar' }}
						</button>
						<div popover id="dcally-popover1" class="ddropdown bg-base-100 rounded-box shadow-lg" style="position-anchor:--dcally1">
							<calendar-date class="dcally" (change)="onDateChange($event, 'dcally1', 'fechaInicio')">
								<svg aria-label="Previous" class="dfill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
								</svg>
								<svg aria-label="Next" class="dfill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
								</svg>
								<calendar-month></calendar-month>
							</calendar-date>
						</div>
					</div>

					<div class="flex flex-col gap-1 w-60">
						<span class="text-xs font-bold text-base-content/60 ml-1">Fecha Fin</span>
						<button
							type="button"
							popovertarget="dcally-popover2"
							class="dinput dinput-border w-60 text-left px-3"
							id="dcally2"
							style="anchor-name:--dcally2"
						>
							{{ form.get('fechaFin')?.value || 'Seleccionar' }}
						</button>
						<div popover id="dcally-popover2" class="ddropdown bg-base-100 rounded-box shadow-lg" style="position-anchor:--dcally2">
							<calendar-date
								class="dcally"
								(change)="onDateChange($event, 'dcally2', 'fechaFin')"
								(ngModelChange)="onDateChange($event, 'dcally2', 'fechaFin')"
							>
								<svg aria-label="Previous" class="dfill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
								</svg>
								<svg aria-label="Next" class="dfill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
								</svg>
								<calendar-month></calendar-month>
							</calendar-date>
						</div>
					</div>
					<div class="flex flex-col gap-1 w-60">
						<label for="areaSelect" class="text-xs font-bold text-base-content/60 ml-1">Área</label>
						<select formControlName="area" id="areaSelect" class="dselect">
							<option value="">Todos</option>
							@for (area of filterData$.value().areas; track $index) {
								<option>{{ area }}</option>
							}
						</select>
					</div>
					<div class="flex flex-col gap-1 w-60">
						<label for="supervisorSelect" class="text-xs font-bold text-base-content/60 ml-1">Supervisor</label>
						<select formControlName="supervisor" id="supervisorSelect" class="dselect">
							<option value="">Todos</option>
							@for (supervisor of filterData$.value().supervisors; track $index) {
								<option>{{ supervisor }}</option>
							}
						</select>
					</div>
					<div class="flex flex-col gap-1 w-60">
						<label for="leaderSelect" class="text-xs font-bold text-base-content/60 ml-1">Leader</label>
						<select formControlName="leader" id="leaderSelect" class="dselect">
							<option value="">Todos</option>
							@for (leader of filterData$.value().leaders; track $index) {
								<option>{{ leader }}</option>
							}
						</select>
					</div>
					<div class="flex flex-col gap-1 w-60">
						<label for="partNumberSelect" class="text-xs font-bold text-base-content/60 ml-1">Part Number</label>
						<select formControlName="partNumber" id="partNumberSelect" class="dselect">
							<option value="">Todos</option>
							@for (partNumber of filterData$.value().partNumbers; track $index) {
								<option>{{ partNumber }}</option>
							}
						</select>
					</div>

					<div class="flex items-end flex-col gap-1 pb-1">
						<button
							type="submit"
							class="dbtn dbtn-sm bg-[#002855] hover:bg-[#001d3d] text-white px-8 font-bold text-[10px] uppercase tracking-widest shadow-sm"
						>
							BUSCAR
						</button>
					</div>
				</form>
			} @else {
				<div>No hay datos</div>
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
	private readonly _filterInitialData = signal<FilterBarData>({
		fechaInicio: (() => {
			const d = new Date();
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			return `${year}-${month}-01`;
		})(),
		fechaFin: new Date().toISOString().split('T')[0],
		area: '',
		supervisor: '',
		leader: '',
		partNumber: '',
	});

	public filters = output<FilterBarData>();

	form = this._fb.group({
		fechaInicio: [this._filterInitialData().fechaInicio, Validators.required],
		fechaFin: [this._filterInitialData().fechaFin, Validators.required],
		area: [this._filterInitialData().area],
		supervisor: [this._filterInitialData().supervisor],
		leader: [this._filterInitialData().leader],
		partNumber: [this._filterInitialData().partNumber],
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

	onDateChange(event: any, targetId: string, controlName: string) {
		const button = document.getElementById(targetId);
		if (button) {
			button.innerText = event.target.value;
		}
		this.form.get(controlName)?.setValue(event.target.value);
	}

	constructor() {}

	onSubmit() {
		this.filters.emit(this.form.value as FilterBarData);
	}
}
