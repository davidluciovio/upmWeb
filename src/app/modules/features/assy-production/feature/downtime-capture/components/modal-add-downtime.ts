import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
	selector: 'modal-add-downtime',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, DatePicker, FloatLabelModule],
	template: `
		<p-dialog
			header="Registrar Paro de Producción"
			[(visible)]="visible"
			[modal]="true"
			[style]="{ width: '100%', maxWidth: '500px' }"
			[draggable]="false"
			[resizable]="false"
			[dismissableMask]="true"
			(onHide)="onHide()"
		>
			<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 pt-2">
				<p class="text-slate-500 dark:text-slate-400 text-sm -mt-2">Ingrese los detalles del tiempo muerto ocurrido en la línea.</p>

				<div class="flex flex-col gap-5">
					<p-floatLabel>
						<p-datepicker
							id="startDowntimeDatetime"
							formControlName="startDowntimeDatetime"
							[showTime]="true"
							[showIcon]="true"
							hourFormat="24"
							styleClass="w-full"
							appendTo="body"
						></p-datepicker>
						<label for="startDowntimeDatetime">Inicio del Paro</label>
					</p-floatLabel>

					<p-floatLabel>
						<p-datepicker
							id="endDowntimeDatetime"
							formControlName="endDowntimeDatetime"
							[showTime]="true"
							[showIcon]="true"
							hourFormat="24"
							styleClass="w-full"
							appendTo="body"
						></p-datepicker>
						<label for="endDowntimeDatetime">Fin del Paro</label>
					</p-floatLabel>

					<p-floatLabel>
						<input pInputText id="dataProductionDowntimeId" formControlName="dataProductionDowntimeId" class="w-full" />
						<label for="dataProductionDowntimeId">ID Razón del Paro</label>
					</p-floatLabel>

					<p-floatLabel>
						<input pInputText id="productionStationId" formControlName="productionStationId" class="w-full" />
						<label for="productionStationId">ID Estación de Producción</label>
					</p-floatLabel>
				</div>

				<div class="flex justify-end gap-3 mt-4">
					<p-button label="Cancelar" [text]="true" severity="secondary" (click)="close()" />
					<p-button
						label="Registrar Paro"
						icon="material-symbols-outlined width-20 height-20 timer_off"
						[disabled]="form.invalid"
						(click)="onSubmit()"
						styleClass="!bg-rose-500 !border-rose-500 hover:!bg-rose-600 !text-white !px-4 !rounded-xl"
					/>
				</div>
			</form>
		</p-dialog>
	`,
})
export class ModalAddDowntime {
	@Input() visible = false;
	@Output() visibleChange = new EventEmitter<boolean>();
	@Output() onSave = new EventEmitter<any>();

	private readonly _fb = inject(FormBuilder);

	form = this._fb.group({
		startDowntimeDatetime: ['', Validators.required],
		endDowntimeDatetime: ['', Validators.required],
		dataProductionDowntimeId: ['', Validators.required],
		productionStationId: ['', Validators.required],
	});

	close() {
		this.visible = false;
		this.visibleChange.emit(false);
	}

	onHide() {
		this.visibleChange.emit(false);
		this.form.reset();
	}

	onSubmit() {
		if (this.form.valid) {
			this.onSave.emit(this.form.value);
			this.close();
		}
	}
}
