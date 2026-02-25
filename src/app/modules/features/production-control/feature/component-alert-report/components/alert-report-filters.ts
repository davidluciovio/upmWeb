import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { ComponentAlertFiltersDto } from '../services/load-data-component-alert-report';
import { AreaInterface } from '../../../../../Admin/services/area-manager';
import { UserInterface } from '../../../../../security/services/user-manager';
import { PartNumberLogisticsInterface } from '../../../../../Admin/services/part-number-logistics-manager';

@Component({
	selector: 'alert-report-filters',
	standalone: true,
	imports: [CommonModule, FormsModule, DatePicker, Select, ButtonModule, FloatLabel, TooltipModule],
	template: `
		<div
			class="glass-effect p-6 rounded-3xl border border-white/40 dark:border-white/10 shadow-xl flex flex-wrap items-end gap-6 transition-all duration-500"
		>
			<div class="flex-1 min-w-[200px]">
				<p-floatLabel variant="on">
					<p-datepicker
						[(ngModel)]="dateRange"
						selectionMode="range"
						[readonlyInput]="true"
						[showIcon]="true"
						iconDisplay="input"
						inputId="date_range"
						styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50!"
						[showButtonBar]="true"
						appendTo="body"
					></p-datepicker>
					<label for="date_range" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Rango de Fechas</label>
				</p-floatLabel>
			</div>

			<div class="flex-1 min-w-[200px]">
				<p-floatLabel variant="on">
					<p-select
						[options]="areas()"
						[(ngModel)]="selectedAreaId"
						optionLabel="areaDescription"
						optionValue="id"
						[showClear]="true"
						[filter]="true"
						filterBy="areaDescription"
						inputId="area_filter"
						styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
						appendTo="body"
					></p-select>
					<label for="area_filter" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Área</label>
				</p-floatLabel>
			</div>

			<div class="flex-1 min-w-[200px]">
				<p-floatLabel variant="on">
					<p-select
						[options]="users()"
						[(ngModel)]="selectedUserId"
						optionLabel="prettyName"
						optionValue="id"
						[showClear]="true"
						[filter]="true"
						filterBy="prettyName"
						inputId="user_filter"
						styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
						appendTo="body"
					></p-select>
					<label for="user_filter" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Responsable</label>
				</p-floatLabel>
			</div>

			<div class="flex-1 min-w-[200px]">
				<p-floatLabel variant="on">
					<p-select
						[options]="partNumbers()"
						[(ngModel)]="selectedPartNumberId"
						optionLabel="partNumber"
						optionValue="id"
						[showClear]="true"
						[filter]="true"
						filterBy="partNumber"
						inputId="part_filter"
						styleClass="w-full rounded-2xl! bg-white/60! dark:bg-slate-900/60! border-white/50! h-12 flex items-center"
						appendTo="body"
					></p-select>
					<label for="part_filter" class="text-[10px] font-black uppercase tracking-widest text-slate-500">Número de Parte</label>
				</p-floatLabel>
			</div>

			<div class="flex gap-3">
				<p-button
					icon="pi pi-filter"
					label="Filtrar"
					(onClick)="handleFilter()"
					styleClass="rounded-2xl! shadow-lg shadow-indigo-500/20 px-8 h-12 font-bold"
					severity="primary"
				></p-button>
				<p-button
					icon="pi pi-refresh"
					[text]="true"
					[rounded]="true"
					severity="secondary"
					(onClick)="resetFilters()"
					pTooltip="Limpiar Filtros"
					styleClass="h-12 w-12"
				></p-button>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertReportFiltersComponent {
	areas = input<AreaInterface[]>([]);
	users = input<UserInterface[]>([]);
	partNumbers = input<PartNumberLogisticsInterface[]>([]);

	filterChange = output<ComponentAlertFiltersDto>();

	// Internal State
	dateRange = signal<Date[]>([
		new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
		new Date(),
	]);
	selectedAreaId = signal<string | null>(null);
	selectedUserId = signal<string | null>(null);
	selectedPartNumberId = signal<string | null>(null);

	handleFilter() {
		const range = this.dateRange();
		if (!range || range.length < 2 || !range[0] || !range[1]) return;

		const filters: ComponentAlertFiltersDto = {
			startDate: range[0].toISOString(),
			endDate: range[1].toISOString(),
			areaId: this.selectedAreaId(),
			userId: this.selectedUserId(),
			partNumberLogisticId: this.selectedPartNumberId(),
		};

		console.log(filters);

		this.filterChange.emit(filters);
	}

	resetFilters() {
		this.dateRange.set([new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]);
		this.selectedAreaId.set(null);
		this.selectedUserId.set(null);
		this.selectedPartNumberId.set(null);
		this.handleFilter();
	}
}
