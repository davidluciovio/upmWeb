import { ChangeDetectionStrategy, Component, inject, computed, Input, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

// PrimeNG Imports
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';

// Services
import { UserManager, UserInterface } from '../../../../../security/services/user-manager';

@Component({
	selector: 'form-add-operator',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, Select, ButtonModule, TooltipModule, DatePicker, FloatLabelModule],
	providers: [MessageService],
	template: `
		<div
			class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm p-4 flex flex-col gap-4"
		>
			<div class="flex items-start gap-2 border-b border-surface-100 dark:border-surface-800 pb-3">
				<div class="bg-indigo-500/10 p-2 rounded-lg">
					<span class="material-symbols-outlined text-indigo-500 text-xl leading-none">person_add</span>
				</div>
				<div>
					<h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0 tracking-tight">Registrar Operador</h3>
					<p class="text-xs text-surface-500 m-0 font-medium">Asigne un operador a un turno específico.</p>
				</div>
			</div>

			<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
				<p-floatLabel>
					<p-select
						id="operator"
						[options]="availableOperators()"
						formControlName="operator"
						optionLabel="prettyName"
						placeholder="Buscar..."
						[filter]="true"
						filterBy="prettyName,userName"
						[showClear]="true"
						styleClass="w-full"
						appendTo="body"
					>
						<ng-template let-user pTemplate="item">
							<div class="flex flex-col gap-0 py-0.5">
								<span class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ user.prettyName }}</span>
								<span class="text-xs text-surface-500 uppercase">{{ user.userName }}</span>
							</div>
						</ng-template>
					</p-select>
					<label for="operator">Seleccionar Operador</label>
				</p-floatLabel>

				<p-floatLabel>
					<p-datepicker
						id="startDatetime"
						formControlName="startDatetime"
						[showTime]="true"
						[showIcon]="true"
						hourFormat="24"
						styleClass="w-full"
						appendTo="body"
					></p-datepicker>
					<label for="startDatetime">Inicio del Turno</label>
				</p-floatLabel>

				<p-floatLabel>
					<p-datepicker
						id="endDatetime"
						formControlName="endDatetime"
						[showTime]="true"
						[showIcon]="true"
						hourFormat="24"
						styleClass="w-full"
						appendTo="body"
					></p-datepicker>
					<label for="endDatetime">Fin del Turno</label>
				</p-floatLabel>

				<div class="mt-2">
					<p-button
						label="Guardar"
						icon="pi pi-save"
						type="submit"
						styleClass="w-full font-bold shadow-sm"
						[disabled]="form.invalid"
					/>
				</div>
			</form>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAddOperator {
	private readonly userManager = inject(UserManager);
	private readonly _fb = inject(FormBuilder);

	currentLine = input<string>();
	@Output() onSave = new EventEmitter<any>();

	form = this._fb.group({
		operator: [null as UserInterface | null, Validators.required],
		startDatetime: ['', Validators.required],
		endDatetime: ['', Validators.required],
	});

	protected users$ = rxResource({
		stream: () =>
			this.userManager
				.getUsers()
				.pipe(map((users: UserInterface[]) => users.filter((u) => u.active).sort((a, b) => a.prettyName.localeCompare(b.prettyName)))),
	});

	availableOperators = computed(() => {
		const users = this.users$.value() || [];
		return users.filter(
			(user) => user.roleName.toLowerCase().includes('operador') || user.roleName.toLowerCase().includes('operator')
		);
	});

	onSubmit() {
		if (this.form.valid) {
			const formValue = this.form.value;
			const operator = formValue.operator as UserInterface | null;
			this.onSave.emit({
				lineId: this.currentLine(),
				operatorCode: operator?.userName,
				operatorName: operator?.prettyName,
				startDatetime: formValue.startDatetime,
				endDatetime: formValue.endDatetime,
			});
			this.form.reset();
		}
	}
}
