import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ForkliftAlertInterface } from '../../services/forklift-global-report.service';

interface UserWorkload {
	name: string;
	alerts: ForkliftAlertInterface[];
	workload: {
		label: string;
		severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;
	};
}

interface AreaGroup {
	name: string;
	health: number;
	users: UserWorkload[];
}

@Component({
	selector: 'forklift-area-card',
	standalone: true,
	imports: [CommonModule, TagModule],
	template: `
		<div
			class="col-span-12 xl:col-span-6 bg-surface-0 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500 hover:border-primary-500/30"
		>
			<!-- Area Leadership Header -->
			<div class="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div class="flex items-center gap-5">
					<div
						class="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-3xl flex items-center justify-center border border-surface-200 dark:border-surface-700 shadow-inner"
					>
						<span class="material-symbols-outlined text-primary-500 text-3xl">location_on</span>
					</div>
					<div>
						<h2 class="text-2xl font-black text-surface-900 dark:text-surface-0 tracking-tight m-0 uppercase">
							{{ area().name }}
						</h2>
						<p class="text-[10px] font-bold text-surface-400 tracking-widest m-0 mt-1 uppercase opacity-60">Matriz de Distribución Operativa</p>
					</div>
				</div>

				<div class="flex items-center gap-6 w-full md:w-auto">
					<div class="grow md:grow-0 text-right">
						<p class="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Efficiency Rating</p>
						<div class="flex items-center gap-3">
							<div
								class="w-32 h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner ring-1 ring-surface-200 dark:ring-surface-700"
							>
								<div
									class="h-full transition-all duration-1000 ease-out"
									[ngClass]="{
										'bg-linear-to-r from-green-500 to-emerald-400': area().health > 80,
										'bg-linear-to-r from-orange-500 to-amber-400': area().health > 50 && area().health <= 80,
										'bg-linear-to-r from-red-600 to-red-400': area().health <= 50,
									}"
									[style.width.%]="area().health"
								></div>
							</div>
							<span class="text-xs font-black text-surface-700 dark:text-surface-300">{{ area().health | number: '1.0-0' }}%</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Users Swimlanes -->
			<div class="p-8 pt-6 space-y-10">
				@for (user of area().users; track user.name) {
					<div class="relative pl-6 border-l-2 border-surface-100 dark:border-surface-800 group/user hover:border-primary-500/40 transition-colors">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center gap-3">
								<div
									class="w-10 h-10 rounded-2xl bg-surface-100/50 dark:bg-surface-800/50 flex items-center justify-center font-black text-sm text-surface-500 border border-surface-100 dark:border-surface-700 group-hover/user:bg-primary-500 group-hover/user:text-white transition-all duration-500"
								>
									{{ user.name.charAt(0) }}
								</div>
								<div>
									<h3 class="text-sm font-black text-surface-800 dark:text-surface-200 m-0 leading-none">
										{{ user.name }}
									</h3>
									<p class="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1 opacity-50">Operations Manager</p>
								</div>
							</div>
							<p-tag
								[value]="user.workload.label"
								[severity]="user.workload.severity"
								styleClass="px-3 py-1 font-black text-[9px] tracking-widest rounded-full uppercase"
							/>
						</div>

						<!-- Alerts Tiles -->
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							@for (alert of user.alerts; track alert.id) {
								<div
									(click)="onAlertClick.emit(alert)"
									[ngClass]="{
										'border-red-500/30 bg-red-500/2': alert.criticalDate,
										'border-green-500/30 bg-green-500/2': alert.completeDate,
										'border-surface-200/50 bg-surface-100/10': !alert.criticalDate && !alert.completeDate,
									}"
									class="relative group/card p-4 rounded-3xl border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
								>
									<!-- Status Glow -->
									@if (alert.criticalDate) {
										<div class="absolute -top-4 -right-4 w-12 h-12 bg-red-500/10 blur-2xl rounded-full animate-pulse"></div>
									} @else if (alert.completeDate) {
										<div class="absolute -top-4 -right-4 w-12 h-12 bg-green-500/10 blur-2xl rounded-full"></div>
									}

									<div class="flex justify-between items-start mb-4">
										<p class="text-sm font-black text-surface-900 dark:text-surface-0 m-0 tracking-tight group-hover/card:text-primary-500 transition-colors">
											{{ alert.partNumberLogisticsResponseDto.partNumber }}
										</p>
										<span
											class="material-symbols-outlined text-lg leading-none"
											[ngClass]="{
												'text-red-500 animate-bounce': alert.criticalDate,
												'text-green-500': alert.completeDate,
												'text-amber-500': !alert.criticalDate && !alert.completeDate,
											}"
										>
											{{ alert.criticalDate ? 'error' : alert.completeDate ? 'check_circle' : 'pending' }}
										</span>
									</div>

									<div class="flex items-center gap-2 mb-4 bg-surface-100/50 dark:bg-surface-800/50 p-2 rounded-2xl border border-surface-200/20">
										<span class="material-symbols-outlined text-sm text-surface-400">shelves</span>
										<span class="text-[10px] font-black tracking-wider text-surface-600 dark:text-surface-300 truncate uppercase">
											{{ alert.partNumberLogisticsResponseDto.location }}
										</span>
									</div>

									<div class="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
										<div class="flex flex-col">
											<span class="text-[8px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">Standard SNP</span>
											<span class="text-xs font-black text-surface-800 dark:text-surface-200 leading-none">{{ alert.partNumberLogisticsResponseDto.snp }}</span>
										</div>
										<div class="text-right">
											<span class="text-[8px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">Created At</span>
											<p class="text-[10px] font-black text-surface-500 m-0 leading-none">
												{{ alert.createDate | date: 'HH:mm' }}
											</p>
										</div>
									</div>
								</div>
							}
						</div>
					</div>
				}
			</div>

			<!-- Area Footer Summary -->
			<div class="p-6 bg-surface-50 dark:bg-surface-800/30 border-t border-surface-100 dark:border-surface-800 flex justify-center items-center gap-6">
				<div class="flex items-center gap-2">
					<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
					<span class="text-[9px] font-black text-surface-400 uppercase tracking-widest">Failures Detected</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
					<span class="text-[9px] font-black text-surface-400 uppercase tracking-widest">Optimized Output</span>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftAreaCardComponent {
	area = input.required<AreaGroup>();
	onAlertClick = output<ForkliftAlertInterface>();
}
