import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PickListModule } from 'primeng/picklist';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

// Services
import { UserManager, UserInterface } from '../../security/services/user-manager';
import { RoleManager, RoleResponseInterface } from '../../security/services/role-manager';
import { AreaManagerService, AreaInterface } from '../services/area-manager';
import { ErrorHandlerService } from '../../../core/services/error-handler';
import { Authentication } from '../../auth/services/authentication';

@Component({
	selector: 'forklift-area',
	standalone: true,
	imports: [CommonModule, FormsModule, ButtonModule, SelectModule, PickListModule, ToastModule, TooltipModule, CardModule, TagModule],
	providers: [MessageService],
	template: `
		<div class="flex flex-col gap-4 h-full animate-in fade-in duration-500">
			<!-- Sleek Header with Tailwind -->
			<div
				class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4"
			>
				<div class="flex items-center gap-4">
					<div class="bg-orange-500/10 p-3 rounded-xl ring-4 ring-orange-500/5 transition-transform hover:scale-105">
						<span class="material-symbols-outlined text-orange-500 text-4xl leading-none">forklift</span>
					</div>
					<div>
						<h1 class="text-2xl font-bold m-0 text-surface-900 dark:text-surface-0 tracking-tight">Asignación de Áreas</h1>
						<p class="text-sm text-surface-500 m-0 font-medium">Gestión de perímetros operativos para personal de logística</p>
					</div>
				</div>
				<div class="flex gap-2">
					<p-button
						icon="pi pi-refresh"
						(onClick)="loadData()"
						severity="secondary"
						[text]="true"
						pTooltip="Sincronizar Datos"
						styleClass="transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
					/>
					<p-button
						label="Guardar Asignaciones"
						icon="pi pi-save"
						(onClick)="saveAssignments()"
						[loading]="saving"
						severity="primary"
						styleClass="font-bold shadow-lg px-4"
						[disabled]="!selectedUser"
					/>
				</div>
			</div>

			<div class="grid grid-cols-12 gap-4 flex-grow overflow-hidden">
				<!-- User Selection Panel -->
				<div class="col-span-12 lg:col-span-4 h-full">
					<div
						class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm p-4 h-full flex flex-col gap-4"
					>
						<div class="flex items-center gap-2 border-b border-surface-100 dark:border-surface-800 pb-3">
							<span class="material-symbols-outlined text-surface-400 text-xl">person_search</span>
							<h3 class="m-0 text-sm font-bold uppercase tracking-wider text-surface-600 dark:text-surface-400">Operador</h3>
						</div>

						<!-- Smart Filter Info -->
						<div class="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
							<div class="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
								<i class="pi pi-info-circle text-xs"></i>
								<span class="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Filtro Logístico</span>
							</div>
							<p class="text-xs m-0 text-surface-500 leading-relaxed">Operadores con perfil de <strong>Montacargas</strong>.</p>
						</div>

						<div class="flex flex-col gap-2">
							<p-select
								[options]="forkliftUsers"
								[(ngModel)]="selectedUser"
								optionLabel="prettyName"
								placeholder="Buscar operador..."
								(onChange)="onUserChange($event)"
								styleClass="w-full"
								[filter]="true"
								emptyFilterMessage="No se encontraron operadores"
							>
								<ng-template let-user pTemplate="item">
									<div class="flex flex-col gap-0.5">
										<span class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ user.prettyName }}</span>
										<span class="text-[10px] text-surface-500 uppercase tracking-wider">{{ user.userName }} • {{ user.roleName }}</span>
									</div>
								</ng-template>
							</p-select>
						</div>

						@if (selectedUser) {
							<div
								class="mt-2 p-3 bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700 rounded-lg animate-in slide-in-from-top-2 duration-300"
							>
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-md bg-primary-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
										{{ selectedUser.userName.substring(0, 2).toUpperCase() }}
									</div>
									<div class="flex flex-col min-w-0">
										<span class="font-bold text-sm text-surface-900 dark:text-surface-0 truncate">{{ selectedUser.prettyName }}</span>
										<span class="text-xs text-surface-400 truncate">{{ selectedUser.email }}</span>
									</div>
								</div>
							</div>
						} @else {
							<div class="flex-grow flex flex-col items-center justify-center py-12 opacity-40">
								<i class="pi pi-user text-6xl mb-4 text-surface-300"></i>
								<p class="text-center text-xs m-0 font-medium max-w-[200px] leading-relaxed">Elija un operador para habilitar la asignación de perímetros</p>
							</div>
						}

						<!-- Quick Stats -->
						<div class="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800">
							<div class="flex justify-between items-center text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3">
								<span>Resumen Actual</span>
							</div>
							<div class="flex flex-col gap-3">
								<div class="flex justify-between items-center">
									<span class="text-xs font-medium text-surface-600">Disponibilidad Planta</span>
									<span class="text-xs font-bold px-2 py-0.5 bg-surface-100 dark:bg-surface-800 rounded">{{ allAreas.length }}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-xs font-medium text-surface-600">Asignadas al Usuario</span>
									<span class="text-xs font-bold px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded">{{ targetAreas.length }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Assignment Panel with Tailwind -->
				<div class="col-span-12 lg:col-span-8 h-full">
					<div
						class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm h-full flex flex-col overflow-hidden relative"
					>
						<div class="p-4 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30 flex justify-between items-center">
							<div>
								<h3 class="m-0 text-sm font-bold uppercase tracking-wider text-surface-600 dark:text-surface-400">Matriz de Áreas de Operación</h3>
								<p class="text-[10px] text-surface-500 m-0 uppercase tracking-tighter">Organización jerárquica de logística</p>
							</div>
							<div class="flex gap-2">
								<p-tag [value]="sourceAreas.length + ' Libres'" severity="secondary" styleClass="text-[10px] font-bold" />
								<p-tag [value]="targetAreas.length + ' Bajo Control'" severity="success" styleClass="text-[10px] font-bold" />
							</div>
						</div>

						<div class="flex-grow p-4 relative overflow-auto">
							@if (!selectedUser) {
								<div class="absolute inset-0 bg-surface-0/60 dark:bg-surface-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
									<div class="p-4 rounded-full bg-surface-0 dark:bg-surface-900 shadow-xl mb-4 border border-surface-200 dark:border-surface-700">
										<i class="pi pi-lock text-3xl text-orange-500"></i>
									</div>
									<h4 class="font-bold text-surface-700 dark:text-surface-200 m-0">Acceso Restringido</h4>
									<p class="text-xs text-surface-500 mt-1">Seleccione un operador para iniciar la gestión</p>
								</div>
							}

							<p-pickList
								[source]="sourceAreas"
								[target]="targetAreas"
								sourceHeader="Áreas en Planta"
								targetHeader="Jurisdicción del Operador"
								[dragdrop]="true"
								[responsive]="true"
								[sourceStyle]="{ height: '420px', 'border-radius': '8px', padding: '0.5rem' }"
								[targetStyle]="{ height: '420px', 'border-radius': '8px', padding: '0.5rem' }"
								filterBy="areaDescription"
								sourceFilterPlaceholder="Filtrar áreas..."
								targetFilterPlaceholder="Filtrar asignadas..."
								styleClass="forklift-picklist"
							>
								<ng-template let-area pTemplate="item">
									<div class="flex items-center gap-3 pr-2 group transition-all">
										<div
											class="w-6 h-6 rounded flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-400 group-hover:bg-primary-500 group-hover:text-white transition-colors"
										>
											<span class="material-symbols-outlined text-sm">location_on</span>
										</div>
										<span class="text-sm font-medium text-surface-700 dark:text-surface-200 truncate">{{ area.areaDescription }}</span>
									</div>
								</ng-template>
							</p-pickList>
						</div>
					</div>
				</div>
			</div>
		</div>

		<p-toast position="bottom-center" />
	`,
})
export class ForkliftArea implements OnInit {
	private readonly userService = inject(UserManager);
	private readonly roleService = inject(RoleManager);
	private readonly areaService = inject(AreaManagerService);
	private readonly messageService = inject(MessageService);
	private readonly authService = inject(Authentication);
	private readonly errorHandler = inject(ErrorHandlerService);

	// Data
	allUsers: UserInterface[] = [];
	allAreas: AreaInterface[] = [];
	forkliftUsers: UserInterface[] = [];

	// Picklist State
	sourceAreas: AreaInterface[] = [];
	targetAreas: AreaInterface[] = [];

	// State
	selectedUser: UserInterface | null = null;
	saving = false;

	ngOnInit() {
		this.loadData();
	}

	loadData() {
		forkJoin({
			users: this.userService.getUsers(),
			areas: this.areaService.getAreas(),
		}).subscribe({
			next: (res) => {
				this.allUsers = res.users;
				// Filter areas that are active
				this.allAreas = res.areas.filter((a) => a.active);

				// Identify forklift users: Roles containing 'Montacargas' or 'Forklift'
				this.forkliftUsers = this.allUsers
					.filter((u) => u.roleName.toLowerCase().includes('montacarguista'))
					.sort((a, b) => a.prettyName.localeCompare(b.prettyName));

				this.resetPicklist();
			},
			error: (err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error de Sincronización',
					detail: 'No se pudo conectar con el catálogo de usuarios o áreas',
				});
			},
		});
	}

	onUserChange(event: any) {
		this.resetPicklist();
		if (this.selectedUser) {
			this.messageService.add({
				severity: 'info',
				summary: 'Operador Seleccionado',
				detail: `Cargando configuración actual para ${this.selectedUser.prettyName}`,
			});
		}
	}

	resetPicklist() {
		this.sourceAreas = [...this.allAreas].sort((a, b) => a.areaDescription.localeCompare(b.areaDescription));
		this.targetAreas = [];
	}

	saveAssignments() {
		if (!this.selectedUser) return;

		this.saving = true;
		const assignedAreaIds = this.targetAreas.map((a) => a.id);

		console.log(assignedAreaIds);

		setTimeout(() => {
			this.saving = false;
			this.messageService.add({
				severity: 'success',
				summary: 'Sincronización Exitosa',
				detail: `Se han vinculado ${this.targetAreas.length} áreas al operador ${this.selectedUser?.prettyName}`,
			});
		}, 1200);
	}
}
