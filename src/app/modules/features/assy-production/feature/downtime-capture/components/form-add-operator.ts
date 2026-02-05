import { ChangeDetectionStrategy, Component, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

// PrimeNG Imports
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// Services
import { UserManager, UserInterface } from '../../../../../security/services/user-manager';
import { Authentication } from '../../../../../auth/services/authentication';

@Component({
	selector: 'form-add-operator',
	standalone: true,
	imports: [CommonModule, FormsModule, SelectModule, ButtonModule, ListboxModule, TooltipModule, TagModule],
	providers: [MessageService],
	template: `
		<div
			class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400"
		>
			<!-- Header Section - More compact -->
			<div class="flex items-start justify-between border-b border-surface-50 dark:border-surface-800 pb-2">
				<div class="flex items-start gap-2">
					<div class="bg-indigo-500/10 p-1.5 rounded-lg">
						<span class="material-symbols-outlined text-indigo-500 text-lg leading-none">person_add</span>
					</div>
					<div>
						<h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 m-0 tracking-tight">Operadores</h3>
						<p class="text-[10px] text-surface-500 m-0 font-medium">Asignación de turno</p>
					</div>
				</div>
                <div class="flex w-1/2 gap-1.5">
                    <p-select
                        [options]="availableOperators()"
                        [(ngModel)]="selectedOperator"
                        optionLabel="prettyName"
                        placeholder="Buscar..."
                        [filter]="true"
                        filterBy="prettyName,userName"
                        [showClear]="true"
                        styleClass="grow text-xs"
                        [style]="{ 'font-size': '12px' }"
                        appendTo="body"
                    >
                        <ng-template let-user pTemplate="item">
                            <div class="flex flex-col gap-0 py-0.5">
                                <span class="font-bold text-xs text-surface-900 dark:text-surface-0">{{ user.prettyName }}</span>
                                <span class="text-[9px] text-surface-500 uppercase">{{ user.userName }}</span>
                            </div>
                        </ng-template>
                    </p-select>
                    <p-button
                        icon="pi pi-plus"
                        (onClick)="onAddOperator()"
                        [disabled]="!selectedOperator"
                        severity="primary"
                        size="small"
                        pTooltip="Agregar"
                        styleClass="shadow-sm"
                    />
                </div>
			</div>

			<!-- Selection Form - Reduced padding and gaps -->
			<div class="flex flex-col gap-2">
				<div class="flex flex-col gap-1">
				</div>
			</div>

			<!-- Associated Operators List - More compact items -->
			<div class="grow flex flex-col gap-2 min-h-[150px]">
				@if (associatedOperators().length > 0) {
					<div class="flex flex-col gap-1.5 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
						@for (op of associatedOperators(); track op.id) {
							<div
								class="group flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50 rounded-lg hover:border-indigo-400 transition-all duration-200"
							>
								<div class="flex items-center gap-2">
									<div
										class="w-7 h-7 rounded bg-surface-200 dark:bg-surface-700 flex items-center justify-center font-bold text-indigo-500 text-[10px] shadow-sm"
									>
										{{ op.userName.substring(0, 2).toUpperCase() }}
									</div>
									<div class="flex flex-col min-w-0">
										<span class="font-bold text-xs text-surface-800 dark:text-surface-100 truncate">{{ op.prettyName }}</span>
										<span class="text-[9px] text-surface-500 truncate">{{ op.roleName }}</span>
									</div>
								</div>
								<p-button
									icon="pi pi-times"
									(onClick)="onRemoveOperator(op)"
									[text]="true"
									severity="danger"
									size="small"
									styleClass="p-0 h-6 w-6 opacity-40 group-hover:opacity-100"
								/>
							</div>
						}
					</div>
				} @else {
					<div class="grow flex flex-col items-center justify-center py-4 opacity-30 text-center">
						<span class="material-symbols-outlined text-2xl text-surface-400 mb-1">group_off</span>
						<p class="text-[10px] font-medium text-surface-500 italic">Sin asignar</p>
					</div>
				}
			</div>

			<!-- Quick Action Footer -->
			<div class="mt-auto pt-2 border-t border-surface-50 dark:border-surface-800 flex justify-end">
				<p-button
					label="Guardar"
					icon="pi pi-save"
					severity="success"
					size="small"
					[loading]="isSaving()"
					(onClick)="onSave()"
					styleClass="w-full font-bold shadow-sm py-2 text-xs"
					[disabled]="associatedOperators().length === 0"
				/>
			</div>
		</div>
	`,
	styles: [
		`
			.custom-scrollbar::-webkit-scrollbar {
				width: 4px;
			}
			.custom-scrollbar::-webkit-scrollbar-track {
				background: transparent;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb {
				background: #e2e8f0;
				border-radius: 10px;
			}
			.dark .custom-scrollbar::-webkit-scrollbar-thumb {
				background: #1e293b;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAddOperator {
	private readonly userManager = inject(UserManager);
	private readonly messageService = inject(MessageService);
	private readonly authService = inject(Authentication);

	// Context - To be passed or injected if needed
	@Input() currentLine: string = 'L8202';
	@Input() currentDate: string = new Date().toISOString();

	// State
	selectedOperator: UserInterface | null = null;
	associatedOperators = signal<UserInterface[]>([]);
	isSaving = signal(false);

	// Data Resources
	protected users$ = rxResource({
		stream: () =>
			this.userManager
				.getUsers()
				.pipe(map((users: UserInterface[]) => users.filter((u) => u.active).sort((a, b) => a.prettyName.localeCompare(b.prettyName)))),
	});

	// Computed
	availableOperators = computed(() => {
		const users = this.users$.value() || [];
		const associatedIds = new Set(this.associatedOperators().map((op) => op.id));

		// Return only users not already associated and with "operator" in role name
		return users.filter(
			(user) => !associatedIds.has(user.id) && (user.roleName.toLowerCase().includes('operador') || user.roleName.toLowerCase().includes('operator')),
		);
	});

	onAddOperator() {
		if (!this.selectedOperator) return;

		this.associatedOperators.update((ops) => [...ops, this.selectedOperator!]);

		this.messageService.add({
			severity: 'info',
			summary: 'Operador Agregado',
			detail: `${this.selectedOperator.prettyName} listo para asignar`,
			life: 2000,
		});

		this.selectedOperator = null;
	}

	onRemoveOperator(operator: UserInterface) {
		this.associatedOperators.update((ops) => ops.filter((op) => op.id !== operator.id));

		this.messageService.add({
			severity: 'warn',
			summary: 'Operador Retirado',
			detail: `${operator.prettyName} removido de la lista temporal`,
			life: 2000,
		});
	}

	onSave() {
		this.isSaving.set(true);

		// Mocking API call for now as per project patterns seen in other complex components
		console.log('Saving operator associations:', {
			line: this.currentLine,
			date: this.currentDate,
			operators: this.associatedOperators().map((op) => op.id),
			updatedBy: this.authService.user()?.email,
		});

		setTimeout(() => {
			this.isSaving.set(false);
			this.messageService.add({
				severity: 'success',
				summary: 'Configuración Guardada',
				detail: `Se han asociado ${this.associatedOperators().length} operadores a la línea ${this.currentLine}`,
				life: 3000,
			});
		}, 1500);
	}
}
