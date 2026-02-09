import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
	selector: 'modal-add-downtime',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, InputNumberModule, FloatLabelModule],
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
						<p-select
							id="type"
							[options]="types"
							formControlName="type"
							optionLabel="label"
							optionValue="value"
							styleClass="w-full"
							appendTo="body"
						></p-select>
						<label for="type">Tipo de Paro</label>
					</p-floatLabel>

					<p-floatLabel>
						<input pInputText id="reason" formControlName="reason" class="w-full" />
						<label for="reason">Motivo / Causa</label>
					</p-floatLabel>

					<p-floatLabel>
						<p-inputNumber
							id="duration"
							formControlName="duration"
							[showButtons]="true"
							buttonLayout="horizontal"
							spinnerMode="horizontal"
							decrementButtonClass="p-button-secondary"
							incrementButtonClass="p-button-secondary"
							incrementButtonIcon="pi pi-plus"
							decrementButtonIcon="pi pi-minus"
							suffix=" min"
							styleClass="w-full"
							[min]="1"
						></p-inputNumber>
						<label for="duration">Duración (Minutos)</label>
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

	types = [
		{ label: 'Planeado (P)', value: 'P' },
		{ label: 'No Planeado (NP)', value: 'NP' },
	];

	form = this._fb.group({
		type: ['NP', Validators.required],
		reason: ['', Validators.required],
		duration: [5, [Validators.required, Validators.min(1)]],
	});

	close() {
		this.visible = false;
		this.visibleChange.emit(false);
	}

	onHide() {
		this.visibleChange.emit(false);
		this.form.reset({ type: 'NP', duration: 5 });
	}

	onSubmit() {
		if (this.form.valid) {
			this.onSave.emit(this.form.value);
			this.close();
		}
	}
}
