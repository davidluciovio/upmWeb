import { Component, ChangeDetectionStrategy, signal, inject, output, OnInit, input, computed, OnDestroy } from '@angular/core';
import { LoadData, OperationalAnalysisRequestInterface } from '../../services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Authentication } from '../../../../../../auth/services/authentication';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
	selector: 'filter-bar',
	imports: [FormsModule, ReactiveFormsModule, CommonModule],
	template: `
		@if (filterData$.isLoading()) {
			<div class="filter-loading-container">
				<span class="loading loading-spinner text-white"></span>
			</div>
		} @else {
			@if (filterData$.hasValue()) {
				<form [formGroup]="form" (ngSubmit)="$event.preventDefault(); onSubmit()" class="filter-form">
					<!-- Start Date -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('startDate') }}</label>
						<input type="date" formControlName="startDate" class="input input-bordered input-sm w-full bg-white text-black" />
					</div>

					<!-- End Date -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('endDate') }}</label>
						<input type="date" formControlName="endDate" class="input input-bordered input-sm w-full bg-white text-black" />
					</div>

					<!-- Areas MultiSelect -->
					@if (showArea()) {
						<div class="filter-field-group">
							<label class="filter-label">{{ langService.translateDual('area') }}</label>
							<div class="dropdown w-full">
								<div
									tabindex="0"
									role="button"
									class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
								>
									<span class="truncate">{{ getSelectedLabel(form.get('areas')?.value) }}</span>
									<span class="material-symbols-outlined text-sm">expand_more</span>
								</div>
								<ul
									tabindex="0"
									class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800"
								>
									@for (opt of filterData$.value().areas; track opt) {
										<li>
											<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
												<input
													type="checkbox"
													[checked]="form.get('areas')?.value?.includes(opt)"
													(change)="toggleSelection('areas', opt)"
													class="checkbox checkbox-primary checkbox-xs"
												/>
												<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
											</label>
										</li>
									}
								</ul>
							</div>
						</div>
					}

					<!-- Managements MultiSelect -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('managers') }}</label>
						<div class="dropdown w-full">
							<div
								tabindex="0"
								role="button"
								class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
							>
								<span class="truncate">{{ getSelectedLabel(form.get('managments')?.value) }}</span>
								<span class="material-symbols-outlined text-sm">expand_more</span>
							</div>
							<ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800">
								@for (opt of filterData$.value().managments; track opt) {
									<li>
										<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
											<input
												type="checkbox"
												[checked]="form.get('managments')?.value?.includes(opt)"
												(change)="toggleSelection('managments', opt)"
												class="checkbox checkbox-primary checkbox-xs"
											/>
											<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
										</label>
									</li>
								}
							</ul>
						</div>
					</div>

					<!-- Jefes MultiSelect -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('jefes') }}</label>
						<div class="dropdown w-full">
							<div
								tabindex="0"
								role="button"
								class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
							>
								<span class="truncate">{{ getSelectedLabel(form.get('jefes')?.value) }}</span>
								<span class="material-symbols-outlined text-sm">expand_more</span>
							</div>
							<ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800">
								@for (opt of filterData$.value().jefes; track opt) {
									<li>
										<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
											<input
												type="checkbox"
												[checked]="form.get('jefes')?.value?.includes(opt)"
												(change)="toggleSelection('jefes', opt)"
												class="checkbox checkbox-primary checkbox-xs"
											/>
											<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
										</label>
									</li>
								}
							</ul>
						</div>
					</div>

					<!-- Supervisors MultiSelect -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('supervisors') }}</label>
						<div class="dropdown w-full">
							<div
								tabindex="0"
								role="button"
								class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
							>
								<span class="truncate">{{ getSelectedLabel(form.get('supervisors')?.value) }}</span>
								<span class="material-symbols-outlined text-sm">expand_more</span>
							</div>
							<ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800">
								@for (opt of filterData$.value().supervisors; track opt) {
									<li>
										<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
											<input
												type="checkbox"
												[checked]="form.get('supervisors')?.value?.includes(opt)"
												(change)="toggleSelection('supervisors', opt)"
												class="checkbox checkbox-primary checkbox-xs"
											/>
											<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
										</label>
									</li>
								}
							</ul>
						</div>
					</div>

					<!-- Leaders MultiSelect -->
					<div class="filter-field-group">
						<label class="filter-label">{{ langService.translateDual('leaders') }}</label>
						<div class="dropdown w-full">
							<div
								tabindex="0"
								role="button"
								class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
							>
								<span class="truncate">{{ getSelectedLabel(form.get('leaders')?.value) }}</span>
								<span class="material-symbols-outlined text-sm">expand_more</span>
							</div>
							<ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800">
								@for (opt of filterData$.value().leaders; track opt) {
									<li>
										<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
											<input
												type="checkbox"
												[checked]="form.get('leaders')?.value?.includes(opt)"
												(change)="toggleSelection('leaders', opt)"
												class="checkbox checkbox-primary checkbox-xs"
											/>
											<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
										</label>
									</li>
								}
							</ul>
						</div>
					</div>

					<!-- Presses MultiSelect -->
					@if (showPresses()) {
						<div class="filter-field-group">
							<label class="filter-label">{{ langService.translateDual('press') }}</label>
							<div class="dropdown w-full">
								<div
									tabindex="0"
									role="button"
									class="select select-bordered select-sm w-full flex items-center justify-between bg-white text-black font-normal overflow-hidden whitespace-nowrap"
								>
									<span class="truncate">{{ getSelectedLabel(form.get('presses')?.value) }}</span>
									<span class="material-symbols-outlined text-sm">expand_more</span>
								</div>
								<ul
									tabindex="0"
									class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto block dark:bg-slate-800"
								>
									@for (opt of availablePresses(); track opt) {
										<li>
											<label class="label cursor-pointer justify-start gap-3 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700">
												<input
													type="checkbox"
													[checked]="form.get('presses')?.value?.includes(opt)"
													(change)="toggleSelection('presses', opt)"
													class="checkbox checkbox-primary checkbox-xs"
												/>
												<span class="label-text text-sm dark:text-slate-200">{{ opt }}</span>
											</label>
										</li>
									}
								</ul>
							</div>
						</div>
					}

					<!-- Actions -->
					<div class="filter-actions-group">
						<button type="submit" class="btn btn-info btn-sm grow text-white shadow-sm hover:scale-105 transition-transform">
							<span class="material-symbols-outlined text-lg">search</span>
						</button>

						@if (isSuperAdmin() || isAdmin()) {
							<button
								type="button"
								(click)="onSyncClick.emit()"
								class="btn btn-success btn-sm text-white shadow-sm hover:scale-105 transition-transform"
								[disabled]="isSyncing()"
							>
								@if (isSyncing()) {
									<span class="loading loading-spinner loading-xs"></span>
								} @else {
									<span class="material-symbols-outlined text-lg">refresh</span>
								}
							</button>
						}

						<button
							type="button"
							(click)="clear()"
							class="btn btn-ghost btn-sm bg-slate-500/20 hover:bg-slate-500/40 text-white shadow-sm hover:scale-105 transition-transform"
						>
							<span class="material-symbols-outlined text-lg">delete</span>
						</button>

						<button
							type="button"
							(click)="onPresentationModeClick.emit()"
							class="btn btn-primary btn-sm text-white shadow-sm hover:scale-105 transition-transform"
						>
							<span class="material-symbols-outlined text-lg">slideshow</span>
						</button>
					</div>
				</form>
			} @else {
				<div class="alert alert-info">
					<span class="material-symbols-outlined">info</span>
					<span>{{ langService.translateDual('noFiltersData') }}</span>
				</div>
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
				align-items: center;
				padding: 2rem;
				width: 100%;
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
				font-size: 0.75rem;
				font-weight: 800;
				margin-left: 0.25rem;
				text-transform: uppercase;
				color: rgba(255, 255, 255, 0.9);
				letter-spacing: 0.025em;
			}

			.filter-actions-group {
				display: flex;
				flex-direction: row;
				justify-content: space-evenly;
				gap: 0.4rem;
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

			/* Custom scrollbar for dropdown menus */
			.dropdown-content::-webkit-scrollbar {
				width: 5px;
			}
			.dropdown-content::-webkit-scrollbar-track {
				background: transparent;
			}
			.dropdown-content::-webkit-scrollbar-thumb {
				background: #cbd5e1;
				border-radius: 10px;
			}
			.dropdown-content::-webkit-scrollbar-thumb:hover {
				background: #94a3b8;
			}

			/* Fix for dropdown ghost clicks: prevent invisible content from capturing clicks */
			.dropdown-content {
				pointer-events: none;
				visibility: hidden;
				opacity: 0;
			}

			/* Ensure dropdown is visible and interactive when focused */
			.dropdown:focus .dropdown-content,
			.dropdown:focus-within .dropdown-content {
				pointer-events: auto;
				visibility: visible;
				opacity: 1;
				transform: translateY(0);
			}

			/* Style for selected item label in dropdown button */
			.select {
				padding-left: 0.75rem;
				padding-right: 0.75rem;
			}
		`,
	],
})
export class FilterBar implements OnInit, OnDestroy {
	showArea = input<boolean>(true);
	showPresses = input<boolean>(false);
	public isSyncing = input<boolean>(false);
	public readonly langService = inject(LanguageService);
	private readonly _loadData = inject(LoadData);
	private readonly _fb = inject(FormBuilder);
	private _refreshIntervalId: any;

	private readonly _filterInitialData = signal<any>({
		startDate: (() => {
			const d = new Date();
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			return `${year}-${month}-01`;
		})(),
		endDate: new Date().toISOString().split('T')[0],
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

	protected filterValueDefault = computed(() => {
		const filterValueDefault = localStorage.getItem('operationalAnalysisFilterValueDefault');
		if (filterValueDefault) {
			const parsed = JSON.parse(filterValueDefault);
			// Asegurar que las fechas se conviertan a strings si vienen como objetos Date de versiones previas
			parsed.startDate = (() => {
				const d = new Date();
				const year = d.getFullYear();
				const month = String(d.getMonth() + 1).padStart(2, '0');
				return `${year}-${month}-01`;
			})();
			parsed.endDate = new Date().toISOString().split('T')[0];
			return parsed;
		}
		return this._filterInitialData();
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
		this.form.patchValue(this.filterValueDefault());
		// Actualizar opciones de filtros cada hora
		this._refreshIntervalId = setInterval(() => {
			console.log('Actualizando opciones de filtros...');
			this.filterData$.reload();
		}, 3600000);
	}

	ngOnInit(): void {
		const formValue = this.filterValueDefault();
		const { presses, ...filters } = formValue;
		const request = {
			...filters,
			startDate: this.formatToDate(formValue.startDate),
			endDate: this.formatToDate(formValue.endDate),
		} as OperationalAnalysisRequestInterface;
		this.filters.emit(request);
	}

	ngOnDestroy(): void {
		if (this._refreshIntervalId) {
			clearInterval(this._refreshIntervalId);
		}
	}

	public toggleSelection(controlName: string, value: string) {
		const control = this.form.get(controlName);
		if (control) {
			const currentValues = (control.value as string[]) || [];
			const index = currentValues.indexOf(value);
			if (index > -1) {
				control.setValue(currentValues.filter((v: string) => v !== value));
			} else {
				control.setValue([...currentValues, value]);
			}
		}
	}

	public getSelectedLabel(values: string[] | null | undefined): string {
		if (!values || values.length === 0) return this.langService.translateDual('select');
		if (values.length === 1) return values[0];
		return `${values.length} Items`;
	}

	private formatToDate(dateStr: string): Date {
		return new Date(dateStr + 'T00:00:00');
	}

	clear() {
		this.form.setValue(this._filterInitialData());
		const formValue = this._filterInitialData();
		const { presses, ...filters } = formValue;
		const request = {
			...filters,
			startDate: this.formatToDate(formValue.startDate),
			endDate: this.formatToDate(formValue.endDate),
		} as OperationalAnalysisRequestInterface;
		this.filters.emit(request);
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

		const request = {
			...filters,
			startDate: this.formatToDate(filters.startDate),
			endDate: this.formatToDate(filters.endDate),
			managments: selectedPNs,
		} as OperationalAnalysisRequestInterface;

		this.filters.emit(request);
		localStorage.setItem('operationalAnalysisFilterValueDefault', JSON.stringify(formValue));
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
