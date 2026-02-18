import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'forklift-report-header',
	standalone: true,
	imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TagModule, TooltipModule],
	template: `
		<header class="glass-card p-6 flex flex-col lg:flex-row justify-between items-center gap-6 sticky top-4 z-40">
			<div class="flex items-center gap-5">
				<div class="relative">
					<div class="bg-primary-500 p-4 rounded-2xl shadow-xl shadow-primary-500/20 rotate-3 group-hover:rotate-0 transition-transform">
						<span class="material-symbols-outlined text-white text-3xl leading-none">monitoring</span>
					</div>
					@if (overallStatus().severity === 'danger') {
						<span class="absolute -top-1 -right-1 flex h-4 w-4">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
						</span>
					}
				</div>
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-3xl font-black m-0 text-surface-900 dark:text-surface-0 tracking-tighter uppercase">Command Center</h1>
						<p-tag
							[severity]="overallStatus().severity"
							styleClass="px-3 py-1 font-black text-[9px] tracking-[0.2em] rounded-full border border-white/10 uppercase"
						>
							<div class="flex items-center gap-2">
								<span class="material-symbols-outlined text-[10px]">{{ overallStatus().icon }}</span>
								{{ overallStatus().label }}
							</div>
						</p-tag>
					</div>
					<p class="text-xs text-surface-500 m-0 font-bold uppercase tracking-widest mt-1 opacity-60">SGAAC • LOGISTICS REPORTING v2.0</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
				<div class="relative group grow lg:grow-0">
					<span
						class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-surface-400 group-focus-within:text-primary-500 transition-colors z-10"
						>search</span
					>
					<input
						type="text"
						placeholder="FILTRAR MATRIZ..."
						class="w-full lg:w-72 bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 rounded-2xl py-3 pl-12 pr-4 text-xs font-black tracking-widest text-surface-700 dark:text-surface-200 focus:ring-4 focus:ring-primary-500/20 focus:bg-surface-0 dark:focus:bg-surface-900 transition-all outline-none"
						[ngModel]="searchTerm()"
						(ngModelChange)="onSearchChange.emit($event)"
					/>
				</div>
				<div class="flex gap-2">
					<p-button
						icon="pi pi-refresh"
						(onClick)="onReload.emit()"
						[loading]="isLoading()"
						severity="secondary"
						[text]="true"
						styleClass="p-3 rounded-2xl border border-surface-200/50 dark:border-surface-700/50"
					/>
					<p-button
						icon="pi pi-filter-slash"
						(onClick)="onClearFilters.emit()"
						severity="secondary"
						[text]="true"
						styleClass="p-3 rounded-2xl border border-surface-200/50 dark:border-surface-700/50"
						pTooltip="Limpiar filtros"
					/>
				</div>
			</div>
		</header>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftReportHeaderComponent {
	overallStatus = input.required<{ label: string; severity: any; icon: string }>();
	searchTerm = input.required<string>();
	isLoading = input.required<boolean>();

	onSearchChange = output<string>();
	onReload = output<void>();
	onClearFilters = output<void>();
}
