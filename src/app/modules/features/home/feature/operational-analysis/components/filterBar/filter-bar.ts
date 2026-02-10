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
			<div class="filter-loading-container">
				<span class="loading-spinner"></span>
			</div>
		} @else {
			@if (filterData$.hasValue()) {
				<form [formGroup]="form" (ngSubmit)="onSubmit()" class="filter-form">
					<div class="filter-field-group">
						<span class="filter-label">Fecha Inicio</span>
						<p-datepicker formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>

					<div class="filter-field-group">
						<span class="filter-label">Fecha Fin</span>
						<p-datepicker formControlName="endDate" dateFormat="yy-mm-dd" [showIcon]="true" placeholder="Seleccionar Fecha" fluid="true" />
					</div>
					@if (showArea()) {
						<div class="filter-field-group">
							<label for="areaSelect" class="filter-label">Área</label>
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
					<div class="filter-field-group">
						<label for="managmentSelect" class="filter-label">Gerentes</label>
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
					<div class="filter-field-group">
						<label for="jefeSelect" class="filter-label">Jefes</label>
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
					<div class="filter-field-group">
						<label for="supervisorSelect" class="filter-label">Supervisor</label>
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
					<div class="filter-field-group">
						<label for="leaderSelect" class="filter-label">Leader</label>
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
						<div class="filter-field-group">
							<label for="pressSelect" class="filter-label">Prensa</label>
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

					<div class="filter-actions-group">
						<p-button type="submit" label="BUSCAR" fluid="true" class="btn-search"></p-button>
						@if (isSuperAdmin() || isAdmin()) {
							<p-button fluid="true" [loading]="isSyncing()" (click)="onSyncClick.emit()" class="btn-sync">
								<ng-template pTemplate="icon"><span class="material-symbols-outlined">refresh</span></ng-template>
							</p-button>
						}
						<p-button fluid="true" (click)="clear()" class="btn-delete">
							<ng-template pTemplate="icon"><span class="material-symbols-outlined">delete</span></ng-template>
						</p-button>
						<p-button fluid="true" (click)="onPresentationModeClick.emit()" class="btn-presentation">
							<ng-template pTemplate="icon"><span class="material-symbols-outlined">slideshow</span></ng-template>
						</p-button>
					</div>
				</form>
			} @else {
				<div class="no-data-alert">No hay datos</div>
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'filter-bar-host',
	},
	styles: [
		`
			.filter-bar-host {
				display: flex;
				justify-content: center;
				background-color: #024a70;
				border: 1px solid #024a70;
				box-shadow:
					0 20px 25px -5px rgba(0, 0, 0, 0.1),
					0 10px 10px -5px rgba(0, 0, 0, 0.04);
				border-radius: 0.75rem;
				width: 100%;
			}
			.filter-loading-container {
				display: flex;
				justify-content: center;
				padding: 1rem;
			}
			.loading-spinner {
				width: 1.5rem;
				height: 1.5rem;
				border: 2px solid #ffffff;
				border-top-color: transparent;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
			@keyframes spin {
				to {
					transform: rotate(360deg);
				}
			}

			.filter-form {
				width: 100%;
				display: grid;
				grid-template-columns: repeat(1, minmax(0, 1fr));
				gap: 1rem;
				padding: 1rem;
				border-radius: 0.5rem;
				align-items: end;
				background-color: #024a70;
				box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
			}
			@media (min-width: 640px) {
				.filter-form {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
			@media (min-width: 1024px) {
				.filter-form {
					grid-template-columns: repeat(3, minmax(0, 1fr));
				}
			}
			@media (min-width: 1280px) {
				.filter-form {
					grid-template-columns: repeat(8, minmax(0, 1fr));
				}
			}

			.filter-field-group {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				width: 100%;
			}
			.filter-label {
				font-size: 0.875rem;
				font-weight: 900;
				margin-left: 0.25rem;
				text-transform: uppercase;
				letter-spacing: -0.025em;
				color: #ffffff;
			}

			.filter-actions-group {
				display: flex;
				flex-direction: row;
				justify-content: space-evenly;
				gap: 0.25rem;
				width: 100%;
			}
			@media (min-width: 640px) {
				.filter-actions-group {
					grid-column: span 2 / span 2;
				}
			}
			@media (min-width: 1024px) {
				.filter-actions-group {
					grid-column: span 3 / span 3;
				}
			}
			@media (min-width: 1280px) {
				.filter-actions-group {
					grid-column: span 1 / span 1;
				}
			}

			::ng-deep .btn-search .p-button {
				background-color: #0ea5e9 !important;
				border-color: #0ea5e9 !important;
				width: 100%;
			}
			::ng-deep .btn-sync .p-button {
				background-color: #10b981 !important;
				border-color: #10b981 !important;
			}
			::ng-deep .btn-delete .p-button {
				background-color: #64748b !important;
				border-color: #64748b !important;
			}
			::ng-deep .btn-presentation .p-button {
				background-color: #4f46e5 !important;
				border-color: #4f46e5 !important;
			}

			.no-data-alert {
				padding: 1rem;
				background-color: #dbeafe;
				color: #1e40af;
				border-radius: 0.5rem;
			}
		`,
	],
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
