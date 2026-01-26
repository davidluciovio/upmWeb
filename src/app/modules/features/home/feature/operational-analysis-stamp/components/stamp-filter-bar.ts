import { Component, ChangeDetectionStrategy, signal, inject, output, OnInit, computed } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { LoadData, OperationalAnalysisRequestInterface } from '../../operational-analysis/services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'stamp-filter-bar',
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
					class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 p-4 rounded-lg items-end"
				>
					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-surface-100 ml-1">Fecha Inicio</span>
						<p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

					<div class="flex flex-col gap-1 w-full">
						<span class="text-xs font-bold text-surface-100 ml-1">Fecha Fin</span>
						<p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

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

					<div class="flex flex-col gap-1 w-full">
						<label for="shiftSelect" class="text-xs font-bold text-surface-100 ml-1">Turno</label>
						<p-multiSelect
							[options]="filterData$.value().shifts"
							formControlName="shifts"
							placeholder="Seleccionar"
							display="chip"
							[filter]="true"
							[showClear]="true"
						/>
					</div>

					<div class="flex flex-row justify-evenly sm:col-span-2 lg:col-span-3 xl:col-span-1 gap-1 w-full">
						<p-button type="submit" label="BUSCAR" fluid="true" class="w-full"></p-button>
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
export class StampFilterBar implements OnInit {
	private readonly _loadData = inject(LoadData);
	private readonly _fb = inject(FormBuilder);
	private readonly _filterInitialData = {
		startDate: (() => {
			const d = new Date();
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			return new Date(year, Number(month) - 1, 1);
		})(),
		endDate: new Date(),
		areas: ['Estampado'],
		supervisors: [] as string[],
		leaders: [] as string[],
		partNumbers: [] as string[],
		shifts: [] as string[],
		presses: [] as string[],
	};

	public filters = output<OperationalAnalysisRequestInterface>();

	form = this._fb.group({
		startDate: [this._filterInitialData.startDate, Validators.required],
		endDate: [this._filterInitialData.endDate, Validators.required],
		supervisors: [this._filterInitialData.supervisors],
		leaders: [this._filterInitialData.leaders],
		presses: [this._filterInitialData.presses],
		shifts: [this._filterInitialData.shifts],
	});

	availablePresses = computed(() => {
		const data = this.filterData$.value();
		const pns = data?.partNumbers || [];
		if (pns.length === 0) return [];
		const presses = new Set<string>();
		pns.forEach((pn) => {
			if (!pn.includes(' - ')) return;
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
			leaders: [] as string[],
			partNumbers: [] as string[],
			areas: [] as string[],
			supervisors: [] as string[],
			shifts: [] as string[],
		},
	});

	ngOnInit(): void {
		this.emitFilters();
	}

	clear() {
		this.form.patchValue({
			startDate: this._filterInitialData.startDate,
			endDate: this._filterInitialData.endDate,
			supervisors: [],
			leaders: [],
			presses: [],
			shifts: [],
		});
		this.emitFilters();
	}

	onSubmit() {
		this.emitFilters();
	}

	private emitFilters() {
		const formValue = this.form.getRawValue(); 
		const selectedPresses = formValue.presses || [];

		let partNumbers: string[] = [];

		if (selectedPresses.length > 0) {
			partNumbers = this.filterData$.value().partNumbers.filter((pn) => {
				const pressName = this.extractPress(pn);
				return selectedPresses.includes(pressName);
			});
		}

		this.filters.emit({
			startDate: formValue.startDate!,
			endDate: formValue.endDate!,
			areas: ['Estampado'],
			supervisors: formValue.supervisors || [],
			leaders: formValue.leaders || [],
			shifts: formValue.shifts || [],
			partNumbers: partNumbers,
		});
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
