import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ComponentAlertReportResponseInterface } from '../services/load-data-component-alert-report';

@Component({
	selector: 'alert-report-table',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		InputTextModule,
		IconFieldModule,
		InputIconModule,
		TagModule,
		TooltipModule,
		ButtonModule,
		PaginatorModule,
		DatePipe,
	],
	template: `
		<section class="glass-effect overflow-hidden flex flex-col min-h-[700px] border border-white/60 dark:border-white/5 shadow-2xl">
			<!-- Advanced Table Toolbar -->
			<div
				class="p-6 border-b border-white/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/20 dark:bg-white/5 backdrop-blur-sm"
			>
				<div class="flex items-center gap-4 w-full md:w-1/2">
					<p-iconfield iconPosition="left" class="flex-1">
						<p-inputicon styleClass="pi pi-search"></p-inputicon>
						<input
							pInputText
							type="text"
							placeholder="Filtrar por Parte, Destino, Operador o Estado..."
							class="w-full rounded-2xl! border-white/50! bg-white/50 dark:bg-slate-900/50 backdrop-blur-md h-12 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
							[ngModel]="searchTerm()"
							(ngModelChange)="searchChange.emit($event)"
						/>
					</p-iconfield>
					<p-button
						label="Nueva Alerta"
						icon="pi pi-plus"
						severity="primary"
						(onClick)="add.emit()"
						styleClass="rounded-2xl! h-12 px-6 shadow-lg shadow-indigo-500/20 font-bold"
					></p-button>
				</div>

				<div class="flex items-center gap-4">
					<div class="flex -space-x-3 overflow-hidden">
						@for (user of avatars(); track user.id) {
							<div
								class="flex h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white"
								[pTooltip]="user.prettyName"
							>
								{{ user.prettyName.substring(0, 1) }}
							</div>
						}
						@if (totalAvatars() > 4) {
							<div
								class="flex h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black"
							>
								+{{ totalAvatars() - 4 }}
							</div>
						}
					</div>
					<div class="hidden md:block w-px h-8 bg-slate-300 dark:bg-white/10"></div>
					<span class="text-xs font-black text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-xl"> {{ alerts().length }} REGISTROS </span>
				</div>
			</div>

			<!-- Dynamic Data Table -->
			<div class="flex-1 overflow-auto custom-scrollbar">
				<p-table
					[value]="alerts()"
					[loading]="loading()"
					[paginator]="true"
					[rows]="15"
					[showCurrentPageReport]="true"
					currentPageReportTemplate="Línea {first} a {last} de {totalRecords}"
					[rowsPerPageOptions]="[15, 30, 50, 100]"
					styleClass="p-datatable-sm p-datatable-gridlines border-none"
					[rowHover]="true"
				>
					<ng-template pTemplate="header">
						<tr class="bg-indigo-500/5! border-b! border-white/40!">
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400 py-5 pl-8">Registro Temporal</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400">Gestor / Usuario</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400">Identificador Parte</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400 border-none">Logística de Área</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400">Estado Actual</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400">Timeline</th>
							<th class="text-[10px]! font-black uppercase tracking-widest text-slate-400 pr-8 text-center">Acciones</th>
						</tr>
					</ng-template>
					<ng-template pTemplate="body" let-alert>
						<tr class="hover:bg-indigo-500/5 dark:hover:bg-white/5 transition-all duration-300 group border-b border-white/20 dark:border-white/5">
							<td class="py-4 pl-8">
								<div class="flex flex-col">
									<span class="font-black text-xs text-slate-800 dark:text-slate-200 tracking-tight">{{ alert.createDate | date: 'dd MMM, yyyy' }}</span>
									<span class="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{{
										alert.createDate | date: 'HH:mm:ss'
									}}</span>
								</div>
							</td>
							<td>
								<div class="flex items-center gap-3">
									<div
										class="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-white/40 shadow-sm transition-transform group-hover:scale-110"
									>
										<span class="material-symbols-outlined text-sm opacity-70">person</span>
									</div>
									<div class="flex flex-col">
										<span class="text-xs font-black text-slate-700 dark:text-slate-300">{{ alert.user }}</span>
										<span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Operador Asignado</span>
									</div>
								</div>
							</td>
							<td>
								<div class="flex flex-col">
									<span class="font-black text-indigo-600 dark:text-indigo-400 tracking-widest text-sm">{{ alert.partNumberLogistics.partNumber }}</span>
									<span class="text-[9px] font-bold text-slate-400">SKU ID: {{ alert.id.substring(0, 8) }}</span>
								</div>
							</td>
							<td>
								<div class="flex flex-col gap-1.5">
									<div class="flex items-center gap-2">
										<span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
										<span class="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">{{ alert.partNumberLogistics.area }}</span>
									</div>
									<div class="flex items-center gap-2 ml-3 opacity-60">
										<span class="material-symbols-outlined text-[12px]">location_on</span>
										<span class="text-[9px] font-bold uppercase">{{ alert.partNumberLogistics.location }}</span>
									</div>
								</div>
							</td>
							<td>
								<div class="flex items-center gap-2">
									<p-tag
										[value]="alert.status"
										[severity]="getStatusSeverity(alert.status)"
										styleClass="uppercase text-[9px] font-black px-3 py-1 rounded-xl border-none shadow-md"
									>
										<ng-template pTemplate="content">
											<div class="flex items-center gap-1.5 px-1">
												<span class="material-symbols-outlined text-[14px]">{{ getStatusIcon(alert.status) }}</span>
												<span>{{ alert.status }}</span>
											</div>
										</ng-template>
									</p-tag>
									@if (isCritical(alert)) {
										<div
											class="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 animate-bounce"
											[pTooltip]="alert.criticalDate ? 'Prioridad Crítica Manual' : 'Crítico por Tiempo (>30 min)'"
										>
											<span class="material-symbols-outlined text-sm">priority_high</span>
										</div>
									}
								</div>
							</td>
							<td class="pr-8">
								<div class="flex items-center gap-2">
									<!-- Milestone: Created (Always) -->
									<div class="flex flex-col items-center min-w-14 group/step">
										<span class="text-[7px] uppercase font-black text-slate-400 group-hover/step:text-indigo-500 transition-colors">Creado</span>
										<div class="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-sm">
											<span class="text-[10px] font-black text-indigo-500">{{ alert.createDate | date: 'HH:mm' }}</span>
										</div>
									</div>

									<div class="w-3 h-px bg-slate-200 dark:bg-white/5 mt-3"></div>

									<!-- Milestone: Critical (Conditional) -->
									@if (alert.criticalDate) {
										<div class="flex flex-col items-center min-w-14 group/step">
											<span class="text-[7px] uppercase font-black text-rose-500">Crítico</span>
											<div class="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-sm animate-pulse">
												<span class="text-[10px] font-black text-rose-500">{{ alert.criticalDate | date: 'HH:mm' }}</span>
											</div>
										</div>
										<div class="w-3 h-px bg-slate-200 dark:bg-white/5 mt-3"></div>
									}

									<!-- Milestone: Final (Completed or Cancelled) -->
									@if (alert.cancelDate) {
										<div class="flex flex-col items-center min-w-14 group/step">
											<span class="text-[7px] uppercase font-black text-rose-500">Cancelado</span>
											<div class="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-sm">
												<span class="text-[10px] font-black text-rose-500">{{ alert.cancelDate | date: 'HH:mm' }}</span>
											</div>
										</div>
									} @else {
										<div class="flex flex-col items-center min-w-14 group/step">
											<span class="text-[7px] uppercase font-black text-slate-400 group-hover/step:text-emerald-500 transition-colors">Entregado</span>
											<div
												class="w-7 h-7 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300"
												[ngClass]="
													alert.completeDate
														? 'bg-emerald-500/10 border-emerald-500/20 scale-110'
														: 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-40'
												"
											>
												<span class="text-[10px] font-black" [class.text-emerald-500]="alert.completeDate">
													{{ alert.completeDate ? (alert.completeDate | date: 'HH:mm') : '--:--' }}
												</span>
											</div>
										</div>
									}
									<!-- Milestone: Received -->
									<div class="flex flex-col items-center min-w-14 group/step">
										<span class="text-[7px] uppercase font-black text-slate-400 group-hover/step:text-amber-500 transition-colors">Recibido</span>
										<div
											class="w-7 h-7 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300"
											[ngClass]="
												alert.receivedDate
													? 'bg-amber-500/10 border-amber-500/20 scale-110'
													: 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-40'
											"
										>
											<span class="text-[10px] font-black" [class.text-amber-500]="alert.receivedDate">
												{{ alert.receivedDate ? (alert.receivedDate | date: 'HH:mm') : '--:--' }}
											</span>
										</div>
									</div>

									<div class="w-3 h-px bg-slate-200 dark:bg-white/5 mt-3"></div>
								</div>
							</td>
							<td class="pr-8">
								<div class="flex items-center justify-center gap-2">
									<p-button [text]="true" rounded="true" severity="info" (onClick)="edit.emit(alert)" [pTooltip]="'Editar Alerta'" severity="secondary">
										<span class="material-symbols-outlined">edit</span>
									</p-button>
								</div>
							</td>
						</tr>
					</ng-template>
					<ng-template pTemplate="emptymessage">
						<tr>
							<td colspan="7" class="p-24 text-center">
								<div class="flex flex-col items-center gap-6 opacity-20">
									<div class="w-24 h-24 rounded-full bg-slate-300 dark:bg-white/10 flex items-center justify-center">
										<span class="material-symbols-outlined text-6xl">search_off</span>
									</div>
									<div class="space-y-1">
										<p class="font-black uppercase tracking-[0.2em] text-sm">Sin registros estratégicos</p>
										<p class="text-[10px] font-bold">Inicie una gestión presionando 'Nueva Alerta'</p>
									</div>
								</div>
							</td>
						</tr>
					</ng-template>
				</p-table>
			</div>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertReportTableComponent {
	alerts = input.required<ComponentAlertReportResponseInterface[]>();
	loading = input<boolean>(false);
	searchTerm = input<string>('');
	avatars = input<any[]>([]);
	totalAvatars = input<number>(0);

	searchChange = output<string>();
	add = output<void>();
	edit = output<ComponentAlertReportResponseInterface>();

	protected isCritical(alert: ComponentAlertReportResponseInterface): boolean {
		if (alert.criticalDate) return true;
		if (alert.status !== 'COMPLETED' && alert.status !== 'CANCELLED') {
			const createTime = new Date(alert.createDate).getTime();
			const now = new Date().getTime();
			return (now - createTime) / (1000 * 60) > 30;
		}
		return false;
	}

	protected getStatusSeverity(status: string): any {
		switch (status) {
			case 'CREATED':
				return 'info';
			case 'RECEIVED':
				return 'warn';
			case 'COMPLETED':
				return 'success';
			case 'CANCELLED':
				return 'danger';
			default:
				return 'secondary';
		}
	}

	protected getStatusIcon(status: string): string {
		switch (status) {
			case 'CREATED':
				return 'pending';
			case 'RECEIVED':
				return 'forklift';
			case 'COMPLETED':
				return 'check_circle';
			case 'CANCELLED':
				return 'cancel';
			default:
				return 'help';
		}
	}
}
