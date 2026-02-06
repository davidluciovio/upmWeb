import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, TreeNode } from 'primeng/api';

// Services
import { RoleManager, RoleResponseInterface } from '../services/role-manager';
import { ModuleManager, ModuleResponseInterface } from '../services/module-manager';
import { SubmoduleManager, SubmoduleResponseInterface } from '../services/submodule-manager';
import { PermissionManager, PermissionResponseInterface, PermissionRequestInterface } from '../services/permission-manager';
import { forkJoin } from 'rxjs';
import { ErrorHandlerService } from '../../../core/services/error-handler';
import { Authentication } from '../../auth/services/authentication';
import { RolesAdminService } from '../services/roles-admin.service';

@Component({
	selector: 'role-permissions',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TreeTableModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		SelectModule,
		ToastModule,
		RippleModule,
		TooltipModule,
	],
	providers: [MessageService],
	template: `
		<div class="flex flex-col gap-3 p-1 animate-in fade-in duration-300 h-full">
			<!-- Header Sleek Design with Tailwind -->
			<div
				class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 p-3 flex flex-col md:flex-row justify-between items-center gap-3"
			>
				<div class="flex items-center gap-3">
					<div class="bg-primary-500/10 p-2 rounded-lg transition-transform hover:scale-105">
						<span class="material-symbols-outlined text-primary-500 text-3xl">admin_panel_settings</span>
					</div>
					<div>
						<h1 class="text-xl font-bold m-0 text-surface-900 dark:text-surface-0 tracking-tight">Permisos por Rol</h1>
						<span class="text-[10px] text-surface-500 font-bold uppercase tracking-widest opacity-80">Seguridad y Privilegios</span>
					</div>
				</div>
				<div class="flex gap-2">
					<p-button
						icon="pi pi-refresh"
						(onClick)="loadData()"
						severity="secondary"
						[text]="true"
						pTooltip="Recargar datos"
						tooltipPosition="bottom"
						styleClass="hover:bg-surface-100 dark:hover:bg-surface-800"
					/>
					<p-button label="Nuevo Permiso" icon="pi pi-plus" (onClick)="openNewDialog()" severity="primary" styleClass="font-semibold shadow-sm px-4" />
				</div>
			</div>

			<!-- Main Content Grid with Tailwind -->
			<div class="flex flex-col lg:flex-row gap-3 flex-grow overflow-hidden">
				<!-- Sidebar Configuration -->
				<div class="flex flex-col gap-3 w-full lg:w-[22rem] flex-none">
					<!-- Role Selection Card -->
					<div class="bg-surface-0 dark:bg-surface-900 p-5 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800">
						<div class="flex items-center gap-2 mb-4 border-b border-surface-50 dark:border-surface-800 pb-3">
							<span class="material-symbols-outlined text-primary-500 text-lg">shield_person</span>
							<h3 class="m-0 text-xs font-black uppercase tracking-widest text-surface-500">Perfil Objetivo</h3>
						</div>

						<div class="flex flex-col gap-2 mb-5">
							<p-select
								[options]="roles"
								[(ngModel)]="selectedRole"
								optionLabel="name"
								placeholder="Seleccione un rol"
								(onChange)="onRoleChange($event)"
								styleClass="w-full"
								[filter]="true"
							/>
						</div>

						@if (selectedRole) {
							<div
								class="bg-primary-500/5 dark:bg-primary-500/10 rounded-lg border border-primary-500/20 p-3 mb-5 animate-in slide-in-from-bottom-2 duration-400"
							>
								<div class="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400">
									<i class="pi pi-info-circle text-xs"></i>
									<span class="text-[10px] font-bold tracking-widest uppercase">Modo Edición</span>
								</div>
								<p class="text-xs m-0 text-surface-600 dark:text-surface-400 leading-relaxed italic">
									Configurando privilegios específicos para <strong class="text-primary-600 underline underline-offset-2">{{ selectedRole.name }}</strong
									>.
								</p>
							</div>

							<p-button
								label="Sincronizar Cambios"
								icon="pi pi-save"
								severity="success"
								(onClick)="saveRoleAssignment()"
								[loading]="saving"
								styleClass="w-full font-bold shadow-md py-3"
							/>
						} @else {
							<div
								class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl opacity-40 bg-surface-50/50 dark:bg-surface-900/50"
							>
								<i class="pi pi-lock-open text-4xl text-surface-300 mb-3"></i>
								<p class="text-center text-[10px] font-bold uppercase tracking-tighter text-surface-400 m-0">Seleccione un perfil para comenzar</p>
							</div>
						}
					</div>

					<!-- Advanced Summary Card -->
					<div class="bg-surface-0 dark:bg-surface-900 p-5 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 hidden lg:flex flex-col">
						<div class="flex justify-between items-center mb-4 pb-2 border-b border-surface-50 dark:border-surface-800">
							<span class="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Catalogo Global</span>
							<p-button icon="pi pi-chart-pie" [text]="true" severity="secondary" size="small" />
						</div>
						<div class="flex flex-col gap-4">
							<div class="flex justify-between items-center group">
								<div class="flex items-center gap-2">
									<div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
									<span class="text-xs font-semibold text-surface-600 group-hover:text-surface-950 dark:group-hover:text-surface-0 transition-colors"
										>Definiciones</span
									>
								</div>
								<span class="text-xs font-black px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">{{
									permissions.length
								}}</span>
							</div>
							<div class="flex justify-between items-center group">
								<div class="flex items-center gap-2">
									<div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
									<span class="text-xs font-semibold text-surface-600 group-hover:text-surface-950 dark:group-hover:text-surface-0 transition-colors"
										>Estructuras</span
									>
								</div>
								<span class="text-xs font-black px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">{{
									modules.length
								}}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Permissions Matrix Container -->
				<div class="flex-grow min-w-0">
					<div
						class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 flex flex-col h-full overflow-hidden"
					>
						<div class="p-4 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/30">
							<h3 class="m-0 text-xs font-black uppercase tracking-widest text-surface-500">Matriz de Privilegios</h3>
							@if (selectedNodes.length > 0) {
								<div class="animate-in zoom-in duration-300">
									<span
										class="text-[10px] py-1 px-3 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-black border border-primary-500/20"
									>
										{{ selectedNodes.length }} ÍTEMS SELECCIONADOS
									</span>
								</div>
							}
						</div>

						<p-treeTable
							[value]="permissionTree"
							[columns]="cols"
							[paginator]="true"
							[rows]="10"
							[scrollable]="true"
							scrollHeight="flex"
							[(selection)]="selectedNodes"
							selectionMode="checkbox"
							styleClass="p-treetable-sm custom-treetable"
						>
							<ng-template pTemplate="header" let-columns>
								<tr class="!bg-transparent">
									<th
										class="w-[24rem] text-[10px] font-black uppercase tracking-widest text-surface-400 border-b-2 border-surface-100 dark:border-surface-800 py-3"
									>
										Estructura / Permiso
									</th>
									@for (col of columns; track col.field) {
										<th
											class="text-center text-[10px] font-black uppercase tracking-widest text-surface-400 border-b-2 border-surface-100 dark:border-surface-800 py-3"
										>
											{{ col.header }}
										</th>
									}
									<th
										class="text-center w-32 text-[10px] font-black uppercase tracking-widest text-surface-400 border-b-2 border-surface-100 dark:border-surface-800 py-3"
									>
										Acciones
									</th>
								</tr>
							</ng-template>
							<ng-template pTemplate="body" let-rowNode let-rowData="rowData" let-columns="columns">
								<tr
									[ttRow]="rowNode"
									[ttSelectableRow]="rowNode"
									class="group transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 border-b border-surface-50 dark:border-surface-800"
								>
									<td class="py-3 border-none">
										<div class="flex items-center gap-2 pr-2">
											<p-treeTableToggler [rowNode]="rowNode" />
											<p-treeTableCheckbox [value]="rowNode" />

											<!-- Adaptive Icons for Levels with Tailwind -->
											<div
												class="flex items-center justify-center rounded-lg w-8 h-8 flex-none transition-all shadow-sm"
												[ngClass]="{
													'bg-primary-500 text-white': rowData.type === 'module',
													'bg-orange-500 text-white': rowData.type === 'submodule',
													'bg-surface-100 dark:bg-surface-800 text-surface-500 border border-surface-200 dark:border-surface-700': rowData.type === 'permission',
												}"
											>
												<span class="material-symbols-outlined text-lg">
													{{ rowData.type === 'module' ? 'inventory_2' : rowData.type === 'submodule' ? 'folder_open' : 'key' }}
												</span>
											</div>

											<span
												class="truncate text-sm"
												[ngClass]="{
													'font-black text-surface-900 dark:text-surface-0 uppercase tracking-tight': rowData.type === 'module',
													'font-bold text-surface-700 dark:text-surface-200': rowData.type === 'submodule',
													'text-surface-500 font-medium italic text-xs': rowData.type === 'permission',
												}"
											>
												{{ rowData.name }}
											</span>
										</div>
									</td>
									@for (col of columns; track col.field) {
										<td class="text-center border-none">
											@if (rowData[col.field]) {
												<code
													class="text-[10px] font-mono font-bold bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded border border-surface-200 dark:border-surface-700 text-primary-600 dark:text-primary-400"
												>
													{{ rowData[col.field] }}
												</code>
											}
										</td>
									}
									<td class="text-center border-none">
										@if (rowData.type === 'permission') {
											<div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<p-button icon="pi pi-pencil" [text]="true" size="small" severity="secondary" (onClick)="editPermission(rowData)" pTooltip="Editar" />
												<p-button icon="pi pi-trash" [text]="true" size="small" severity="danger" (onClick)="deletePermission(rowData)" pTooltip="Eliminar" />
											</div>
										}
									</td>
								</tr>
							</ng-template>
							<ng-template pTemplate="emptymessage">
								<tr>
									<td colspan="4">
										<div class="flex flex-col items-center justify-center p-12 text-surface-300 dark:text-surface-700">
											<div class="p-6 rounded-full bg-surface-50 dark:bg-surface-800/30 mb-4 ring-8 ring-surface-50/50">
												<i class="pi pi-database text-6xl opacity-20"></i>
											</div>
											<p class="m-0 font-black uppercase tracking-[0.3em] opacity-30 text-xs">Cargando Estructura</p>
										</div>
									</td>
								</tr>
							</ng-template>
						</p-treeTable>
					</div>
				</div>
			</div>
		</div>

		<!-- Professional Dialog with Tailwind -->
		<p-dialog
			[(visible)]="displayDialog"
			[header]="isEdit ? 'Actualizar Definición' : 'Nueva Definición'"
			[modal]="true"
			[draggable]="false"
			[style]="{ width: '450px' }"
			styleClass="p-fluid shadow-2xl rounded-2xl overflow-hidden"
		>
			<div class="flex flex-col gap-5 py-4">
				<div class="flex flex-col gap-2">
					<label for="name" class="text-[10px] font-black text-surface-400 uppercase tracking-widest px-1">Etiqueta de Acceso</label>
					<input pInputText id="name" [(ngModel)]="currentPermission.permission" placeholder="Ej: Control de Inventarios" class="!rounded-xl" />
				</div>
				<div class="flex flex-col gap-2">
					<label for="clave" class="text-[10px] font-black text-surface-400 uppercase tracking-widest px-1">Código de Referencia</label>
					<input pInputText id="clave" [(ngModel)]="currentPermission.clave" placeholder="MOD_INV_VIEW" class="font-mono text-sm !rounded-xl" />
				</div>

				<div class="bg-surface-50 dark:bg-surface-800/40 p-5 rounded-2xl border border-surface-100 dark:border-surface-800 flex flex-col gap-4">
					<div class="flex flex-col gap-2">
						<label class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] px-1">Jerarquía Superior</label>
						<p-select
							[options]="modules"
							[(ngModel)]="selectedModule"
							optionLabel="module"
							placeholder="Seleccionar Módulo"
							(onChange)="onModuleChange()"
							styleClass="!rounded-xl shadow-sm"
						/>
					</div>
					<div class="flex flex-col gap-2">
						<label class="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] px-1">Nodo Específico</label>
						<p-select
							[options]="filteredSubmodules"
							[(ngModel)]="selectedSubmodule"
							optionLabel="submodule"
							placeholder="Seleccionar Submódulo"
							[disabled]="!selectedModule"
							styleClass="!rounded-xl shadow-sm"
						/>
					</div>
				</div>
			</div>

			<ng-template pTemplate="footer">
				<div class="flex gap-2 w-full pt-4 border-t border-surface-100 dark:border-surface-800">
					<p-button
						label="Descartar"
						icon="pi pi-times"
						[text]="true"
						severity="secondary"
						(onClick)="displayDialog = false"
						styleClass="font-bold flex-1"
					/>
					<p-button
						label="Finalizar Registro"
						icon="pi pi-check"
						severity="primary"
						(onClick)="savePermission()"
						[disabled]="!isFormValid()"
						styleClass="font-bold flex-1 shadow-lg"
					/>
				</div>
			</ng-template>
		</p-dialog>

		<p-toast position="bottom-right" />
	`,
	styles: [
		`
			:host ::ng-deep {
				.p-tree-table-toggler {
					width: 1.5rem;
					height: 1.5rem;
					margin-right: 0.25rem;
					transition: transform 0.2s;
				}
				.custom-treetable {
					.p-treetable-scrollable-body {
						border-radius: 0 0 12px 12px;
					}
					.p-datatable-loading-overlay {
						background: rgba(var(--surface-500-rgb), 0.1);
						backdrop-filter: blur(4px);
					}
				}
				.p-dialog {
					.p-dialog-header {
						background: var(--surface-card);
						padding: 1.5rem 1.5rem 0.5rem 1.5rem;
						.p-dialog-title {
							font-weight: 900;
							font-size: 1.1rem;
							text-transform: uppercase;
							letter-spacing: -0.02em;
						}
					}
					.p-dialog-content {
						background: var(--surface-card);
						padding: 0 1.5rem 1rem 1.5rem;
					}
					.p-dialog-footer {
						background: var(--surface-card);
						padding: 1rem 1.5rem 1.5rem 1.5rem;
					}
				}
			}
		`,
	],
})
export class RolePermissions implements OnInit {
	private readonly roleService = inject(RoleManager);
	private readonly moduleService = inject(ModuleManager);
	private readonly submoduleService = inject(SubmoduleManager);
	private readonly permissionService = inject(PermissionManager);
	private readonly messageService = inject(MessageService);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly authService = inject(Authentication);
	private readonly rolesAdminService = inject(RolesAdminService);

	// Data
	roles: RoleResponseInterface[] = [];
	modules: ModuleResponseInterface[] = [];
	submodules: SubmoduleResponseInterface[] = [];
	permissions: PermissionResponseInterface[] = [];

	filteredSubmodules: SubmoduleResponseInterface[] = [];

	// Tree
	permissionTree: TreeNode[] = [];
	cols: any[] = [{ field: 'clave', header: 'Clave Técnica' }];
	selectedNodes: TreeNode[] = [];

	// State
	selectedRole: RoleResponseInterface | null = null;
	selectedModule: ModuleResponseInterface | null = null;
	selectedSubmodule: SubmoduleResponseInterface | null = null;

	displayDialog = false;
	isEdit = false;
	saving = false;

	currentPermission: Partial<PermissionResponseInterface> = {
		permission: '',
		clave: '',
		active: true,
	};

	ngOnInit() {
		this.loadData();
	}

	loadData() {
		forkJoin({
			roles: this.roleService.getRoles(),
			modules: this.moduleService.getModules(),
			submodules: this.submoduleService.getSubmodules(),
			permissions: this.permissionService.getPermissions(),
		}).subscribe({
			next: (res) => {
				this.roles = res.roles;
				this.modules = res.modules;
				this.submodules = res.submodules;
				this.permissions = res.permissions;
				this.buildTree();
				if (this.selectedRole) {
					this.rolesAdminService.getRolePermissions(this.selectedRole.name).subscribe({
						next: (permisosClave) => {
							this.selectNodesByClaves(permisosClave);
						},
					});
				}
			},
			error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos' }),
		});
	}

	buildTree() {
		const tree: TreeNode[] = [];

		this.modules.forEach((mod) => {
			const modNode: TreeNode = {
				data: { id: mod.id, name: mod.module, type: 'module' },
				expanded: true,
				children: [],
			};

			const modSubmodules = this.submodules.filter((s) => s.moduleId === mod.id);
			modSubmodules.forEach((sub) => {
				const subNode: TreeNode = {
					data: { id: sub.id, name: sub.submodule, type: 'submodule' },
					expanded: true,
					children: [],
				};

				const subPermissions = this.permissions.filter((p) => p.submoduleId === sub.id);
				subPermissions.forEach((perm) => {
					subNode.children?.push({
						data: {
							id: perm.id,
							name: perm.permission,
							clave: perm.clave,
							type: 'permission',
						},
					});
				});

				if (subNode.children && subNode.children.length > 0) {
					modNode.children?.push(subNode);
				}
			});

			if (modNode.children && modNode.children.length > 0) {
				tree.push(modNode);
			}
		});

		this.permissionTree = tree;
	}

	onRoleChange(event: any) {
		this.selectedNodes = [];
		if (this.selectedRole) {
			this.messageService.add({
				severity: 'info',
				summary: 'Cambio de Contexto',
				detail: `Cargando permisos para ${this.selectedRole.name}`,
			});

			this.rolesAdminService.getRolePermissions(this.selectedRole.name).subscribe({
				next: (permisosClave) => {
					this.selectNodesByClaves(permisosClave);
				},
				error: (err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'No se pudieron cargar los permisos del rol',
					});
				},
			});
		}
	}

	selectNodesByClaves(claves: string[]) {
		this.selectedNodes = [];
		const selectRecursive = (nodes: TreeNode[]) => {
			nodes.forEach((node) => {
				if (node.data.type === 'permission' && claves.includes(node.data.clave)) {
					this.selectedNodes.push(node);
				}
				if (node.children) {
					selectRecursive(node.children);
				}
			});
		};
		selectRecursive(this.permissionTree);
	}

	onModuleChange() {
		if (this.selectedModule) {
			this.filteredSubmodules = this.submodules.filter((s) => s.moduleId === this.selectedModule?.id);
		} else {
			this.filteredSubmodules = [];
		}
		this.selectedSubmodule = null;
	}

	openNewDialog() {
		this.isEdit = false;
		this.currentPermission = { permission: '', clave: '', active: true };
		this.selectedModule = null;
		this.selectedSubmodule = null;
		this.displayDialog = true;
	}

	editPermission(rowData: any) {
		this.isEdit = true;
		const perm = this.permissions.find((p) => p.id === rowData.id);
		if (perm) {
			this.currentPermission = { ...perm };
			const sub = this.submodules.find((s) => s.id === perm.submoduleId);
			if (sub) {
				this.selectedModule = this.modules.find((m) => m.id === sub.moduleId) || null;
				this.onModuleChange();
				this.selectedSubmodule = sub;
			}
		}
		this.displayDialog = true;
	}

	deletePermission(rowData: any) {
		this.permissionService.deletePermission(rowData.id).subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Operación Exitosa', detail: 'El permiso ha sido removido del sistema' });
				this.loadData();
			},
		});
	}

	savePermission() {
		if (!this.selectedSubmodule) return;

		const request: PermissionRequestInterface = {
			permission: this.currentPermission.permission!,
			clave: this.currentPermission.clave!,
			submoduleId: this.selectedSubmodule.id,
			active: true,
			createBy: this.authService.user()?.email || 'system',
		};

		const obs = this.isEdit
			? this.permissionService.updatePermission(this.currentPermission.id!, request)
			: this.permissionService.createPermission(request);

		obs.subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Registro Guardado', detail: 'La definición ha sido almacenada correctamente' });
				this.displayDialog = false;
				this.loadData();
			},
			error: (err) => this.errorHandler.handleValidationError(err),
		});
	}

	saveRoleAssignment() {
		if (!this.selectedRole) return;

		this.saving = true;
		const selectedPermissionClaves = this.selectedNodes.filter((node) => node.data.type === 'permission').map((node) => node.data.clave);

		this.rolesAdminService.assignPermissionsToRole(this.selectedRole.name, selectedPermissionClaves).subscribe({
			next: () => {
				this.saving = false;
				this.messageService.add({
					severity: 'success',
					summary: 'Sincronización Completa',
					detail: 'Privilegios aplicados exitosamente',
				});
			},
			error: (err) => {
				this.saving = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron sincronizar los permisos',
				});
			},
		});
	}

	isFormValid() {
		return this.currentPermission.permission && this.currentPermission.clave && this.selectedSubmodule;
	}
}
