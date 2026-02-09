import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
	selector: 'modal-add-rack',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, FloatLabelModule],
	template: `
		<p-dialog
			header="Agregar Rack / Contenedor"
			[(visible)]="visible"
			[modal]="true"
			[style]="{ width: '100%', maxWidth: '400px' }"
			[draggable]="false"
			[resizable]="false"
			[dismissableMask]="true"
			(onHide)="onHide()"
		>
			<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 pt-2">
				<p class="text-slate-500 dark:text-slate-400 text-sm -mt-2">Registre el ingreso de un nuevo rack a la línea.</p>

				<div class="flex flex-col gap-5">
					<p-floatLabel>
						<input pInputText id="rackCode" formControlName="rackCode" class="w-full" />
						<label for="rackCode">Código del Rack</label>
					</p-floatLabel>

					<p-floatLabel>
						<p-inputNumber id="quantity" formControlName="quantity" styleClass="w-full" [min]="1"></p-inputNumber>
						<label for="quantity">Cantidad de Piezas</label>
					</p-floatLabel>
				</div>

				<div class="flex justify-end gap-3 mt-4">
					<p-button label="Cancelar" [text]="true" severity="secondary" (click)="close()" />
					<p-button
						label="Agregar"
						icon="pi pi-plus"
						[disabled]="form.invalid"
						(click)="onSubmit()"
						styleClass="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 !text-white !px-4 !rounded-xl"
					/>
				</div>
			</form>
		</p-dialog>
	`,
})
export class ModalAddRack {
	@Input() visible = false;
	@Output() visibleChange = new EventEmitter<boolean>();
	@Output() onSave = new EventEmitter<any>();

	private readonly _fb = inject(FormBuilder);

	form = this._fb.group({
		rackCode: ['', Validators.required],
		quantity: [null, [Validators.required, Validators.min(1)]],
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
