import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
	selector: 'modal-add-material-alert',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, FloatLabelModule],
	template: `
		<p-dialog
			header="Nueva Alerta de Material"
			[(visible)]="visible"
			[modal]="true"
			[style]="{ width: '100%', maxWidth: '500px' }"
			[draggable]="false"
			[resizable]="false"
			[dismissableMask]="true"
			styleClass="p-0 overflow-hidden"
			(onHide)="onHide()"
		>
			<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 pt-2">
				<p class="text-slate-500 dark:text-slate-400 text-sm -mt-2">Reporte una incidencia de material para notificar al equipo de logística.</p>

				<div class="flex flex-col gap-4">
					<p-floatLabel>
						<input pInputText id="component" formControlName="component" class="w-full" />
						<label for="component">Número de Parte / Componente</label>
					</p-floatLabel>

					<p-floatLabel>
						<textarea pTextarea id="description" formControlName="description" rows="4" class="w-full" [autoResize]="true"></textarea>
						<label for="description">Descripción del Problema</label>
					</p-floatLabel>
				</div>

				<div class="flex justify-end gap-3 mt-4">
					<p-button label="Cancelar" [text]="true" severity="secondary" (click)="close()" styleClass="!px-4" />
					<p-button
						label="Crear Alerta"
						icon="material-symbols-outlined width-20 height-20 notifications_active"
						[disabled]="form.invalid"
						(click)="onSubmit()"
						styleClass="!bg-amber-500 !border-amber-500 hover:!bg-amber-600 !text-white !px-4 !rounded-xl"
					/>
				</div>
			</form>
		</p-dialog>
	`,
})
export class ModalAddMaterialAlert {
	@Input() visible = false;
	@Output() visibleChange = new EventEmitter<boolean>();
	@Output() onSave = new EventEmitter<{ component: string; description: string }>();

	private readonly _fb = inject(FormBuilder);

	form = this._fb.group({
		component: ['', Validators.required],
		description: ['', Validators.required],
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
			this.onSave.emit(this.form.value as { component: string; description: string });
			this.close();
			this.form.reset();
		}
	}
}
