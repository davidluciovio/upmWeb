import { ChangeDetectionStrategy, Component, input, output, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para DatePipe
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
export interface ColumnConfig {
	key: string;
	label: string;
	sortable?: boolean;
	dataType?: 'string' | 'number' | 'date' | 'boolean';
	active?: boolean;
}

@Component({
	selector: 'table-crud',
	standalone: true,
	imports: [
		CommonModule, // Se mantiene por el pipe | date
		FormsModule,
		TableModule,
		ButtonModule,
		InputTextModule,
		IconFieldModule,
		TooltipModule,
		TagModule,
	],
	templateUrl: './table-crud.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block h-full w-full',
	},
})
export class TableCrud {
	data = input<any[]>([]);
	columns = input<ColumnConfig[]>([]);

	pTableColumns = computed(() => {
		return (
			this.columns()?.map((col) => ({
				...col,
				field: col.key,
				header: col.label,
			})) || []
		);
	});

	edit = output<any>();
	delete = output<any>();
	create = output<void>();

	@ViewChild('dt') dt: Table | undefined;

	globalFilterFields = computed(() => {
		return this.columns()?.map((col) => col.key) || [];
	});

	getValue(item: any, key: string): any {
		return key.split('.').reduce((acc, part) => acc?.[part], item);
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}

	editRow(item: any): void {
		this.edit.emit(item);
	}

	exportToCsv(): void {
		this.dt?.exportCSV();
	}

	createNew(): void {
		this.create.emit();
	}
}
