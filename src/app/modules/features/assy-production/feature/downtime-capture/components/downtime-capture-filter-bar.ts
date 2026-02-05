import { Component, ChangeDetectionStrategy, inject, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { LineManager } from '../../../../../Admin/services/line-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { DowntimeCaptureRequestInterface } from '../services/load-data-downtime-capture';

@Component({
	selector: 'downtime-capture-filter-bar',
	standalone: true,
	imports: [ReactiveFormsModule, DatePicker, Select, ButtonModule],
	template: `
		<form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 items-end">
			<div class="flex flex-col gap-1 text-white">
				<span class="text-xs font-bold ml-1">Fecha Inicio</span>
				<p-datepicker formControlName="startDatetime" [showTime]="true" [showIcon]="true" appendTo="body" fluid="true" />
			</div>

			<div class="flex flex-col gap-1 text-white">
				<span class="text-xs font-bold ml-1">Fecha Fin</span>
				<p-datepicker formControlName="endDatetime" [showTime]="true" [showIcon]="true" appendTo="body" fluid="true" />
			</div>

			<div class="flex flex-col gap-1 text-white">
				<span class="text-xs font-bold ml-1">Línea</span>
				<p-select
					[options]="linesResource.value() || []"
					formControlName="lineDescription"
					optionLabel="lineDescription"
					optionValue="lineDescription"
					placeholder="Seleccionar Línea"
					[filter]="true"
					fluid="true"
				/>
			</div>

			<div class="flex gap-2">
				<p-button type="submit" label="BUSCAR" icon="pi pi-search" class="grow" fluid="true" />
				<p-button type="button" icon="pi pi-trash" [outlined]="true" severity="secondary" (click)="onClear()" />
			</div>
		</form>
	`,
	styles: [
		`
			:host {
				display: block;
				background: rgba(15, 23, 42, 0.8);
				backdrop-filter: blur(8px);
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 1rem;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeCaptureFilterBar implements OnInit {
	private readonly _fb = inject(FormBuilder);
	private readonly _lineManager = inject(LineManager);

	filters = output<DowntimeCaptureRequestInterface>();

	protected linesResource = rxResource({
		stream: () => this._lineManager.getLines(),
	});

	form = this._fb.group({
		startDatetime: [new Date(new Date().setHours(0, 0, 0, 0)), Validators.required],
		endDatetime: [new Date(), Validators.required],
		lineDescription: ['', Validators.required],
	});

	constructor() {}

	ngOnInit() {}

	onSubmit() {
		if (this.form.valid) {
			const val = this.form.getRawValue();
			this.filters.emit({
				startDatetime: val.startDatetime?.toISOString() || '',
				endDatetime: val.endDatetime?.toISOString() || '',
				lineDescription: val.lineDescription || '',
			});
		}
	}

	onClear() {
		this.form.patchValue({
			startDatetime: new Date(new Date().setHours(0, 0, 0, 0)),
			endDatetime: new Date(),
			lineDescription: '',
		});
	}
}
