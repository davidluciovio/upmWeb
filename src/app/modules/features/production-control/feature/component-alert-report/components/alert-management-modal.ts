import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { PartNumberLogisticsInterface } from '../../../../../Admin/services/part-number-logistics-manager';
import { UserInterface } from '../../../../../security/services/user-manager';

@Component({
	selector: 'alert-management-modal',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, Select, TooltipModule, DialogModule],
	template: `
		<p-dialog
			[header]="title()"
			[(visible)]="visible"
			(onHide)="close.emit()"
			[modal]="true"
			[draggable]="false"
			[resizable]="false"
			[style]="{ width: '500px' }"
			styleClass="glass-effect-modal"
			appendTo="body"
		>
			<div class="flex flex-col gap-6 py-4">
				<div class="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex gap-3 mb-2">
					<span class="material-symbols-outlined text-indigo-500 text-sm">info</span>
					<p class="text-[11px] text-indigo-800 dark:text-indigo-300 leading-snug">
						Gestione el ciclo de vida del material: Creado, Recibido por operador, o Completado (Entregado).
					</p>
				</div>

				<form [formGroup]="form()" class="flex flex-col gap-6">
					<!-- Component Selection -->
					<div class="flex flex-col gap-2.5">
						<label class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Componente & Destino</label>
						<p-select
							formControlName="partNumberLogisticsId"
							[options]="partNumbers()"
							optionLabel="partNumber"
							optionValue="id"
							placeholder="Buscar número de parte..."
							[filter]="true"
							filterBy="partNumber,area"
							[showClear]="true"
							appendTo="body"
							styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
							[loading]="loadingParts()"
						>
							<ng-template let-item pTemplate="item">
								<div class="flex items-center gap-3 py-1">
									<div class="w-8 h-8 rounded-lg bg-indigo-500/5 flex items-center justify-center text-indigo-500">
										<span class="material-symbols-outlined text-sm">widgets</span>
									</div>
									<div class="flex flex-col">
										<span class="font-bold text-xs">{{ item.partNumber }}</span>
										<span class="text-[9px] font-medium opacity-50 uppercase">{{ item.area }} • {{ item.location }}</span>
									</div>
								</div>
							</ng-template>
						</p-select>
					</div>

					<!-- Operator Selection -->
					<div class="flex flex-col gap-2.5">
						<label class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Operador Montacargas</label>
						<p-select
							formControlName="userId"
							[options]="forkliftUsers()"
							optionLabel="prettyName"
							optionValue="id"
							placeholder="Asignar operador..."
							[filter]="true"
							filterBy="prettyName,codeUser"
							[showClear]="true"
							appendTo="body"
							styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
							[loading]="loadingUsers()"
						>
							<ng-template let-user pTemplate="item">
								<div class="flex items-center gap-3 py-1">
									<div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">
										{{ user.codeUser }}
									</div>
									<div class="flex flex-col">
										<span class="font-bold text-xs">{{ user.prettyName }}</span>
										<span class="text-[9px] font-medium opacity-40 uppercase">{{ user.roleName }}</span>
									</div>
								</div>
							</ng-template>
						</p-select>
					</div>

					<!-- Status Selection
					<div class="flex flex-col gap-2.5">
						<label class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Estado Operativo</label>
						<p-select
							formControlName="status"
							[options]="statusOptions()"
							optionLabel="label"
							optionValue="value"
							placeholder="Seleccionar estado"
							styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
						>
							<ng-template let-option pTemplate="selectedItem">
								@if (option) {
									<div class="flex items-center gap-2">
										<span class="material-symbols-outlined text-sm text-(--severity-color)" [style.--severity-color]="getColorForSeverity(option.severity)">{{
											option.icon
										}}</span>
										<span class="font-bold text-xs">{{ option.label }}</span>
									</div>
								}
							</ng-template>
							<ng-template let-option pTemplate="item">
								<div class="flex items-center gap-2 py-1">
									<span class="material-symbols-outlined text-base text-(--severity-color)" [style.--severity-color]="getColorForSeverity(option.severity)">{{
										option.icon
									}}</span>
									<span class="text-xs font-medium">{{ option.label }}</span>
								</div>
							</ng-template>
						</p-select>
					</div> -->

					<!-- Critical Flag -->
					<div
						class="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 mt-2"
					>
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-rose-500" [class.animate-pulse]="form().get('isCritical')?.value">priority_high</span>
							<div class="flex flex-col">
								<span class="text-xs font-bold text-slate-700 dark:text-slate-300">Prioridad Crítica</span>
								<span class="text-[9px] text-slate-400">Marcar como urgente</span>
							</div>
						</div>
						<div class="flex items-center">
							<label class="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" formControlName="isCritical" class="sr-only peer" />
								<div
									class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"
								></div>
							</label>
						</div>
					</div>
				</form>
			</div>

			<ng-template pTemplate="footer">
				<div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
					<p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="close.emit()" styleClass="rounded-xl!"></p-button>
					<p-button
						[label]="isEdit() ? 'Actualizar Alerta' : 'Procesar Alerta'"
						[icon]="isEdit() ? 'pi pi-save' : 'pi pi-bolt'"
						severity="primary"
						styleClass="rounded-xl! shadow-xl shadow-indigo-500/25 px-6 font-bold"
						(onClick)="submit.emit()"
						[disabled]="form().invalid"
					></p-button>
				</div>
			</ng-template>
		</p-dialog>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertManagementModalComponent {
	title = input.required<string>();
	isEdit = input<boolean>(false);
	visible = true; // Controlled by parent *ngIf
	form = input.required<FormGroup>();
	partNumbers = input<PartNumberLogisticsInterface[]>([]);
	forkliftUsers = input<UserInterface[]>([]);
	statusOptions = input<any[]>([]);
	loadingParts = input<boolean>(false);
	loadingUsers = input<boolean>(false);
	creatorName = input<string>('');

	submit = output<void>();
	close = output<void>();

	protected getColorForSeverity(severity: string): string {
		const colors: any = {
			success: '#10b981',
			warn: '#f59e0b',
			danger: '#f43f5e',
			info: '#0ea5e9',
		};
		return colors[severity] || '#64748b';
	}
}
