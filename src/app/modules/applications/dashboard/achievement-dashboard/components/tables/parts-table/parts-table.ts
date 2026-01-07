import { Component, Input, ChangeDetectionStrategy, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PartNode {
	number: string;
	area: string;
	supervisor: string;
	obj: number;
	real: number;
	ach: number;
	records: any[];
}

@Component({
	selector: 'app-parts-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule],
	templateUrl: './parts-table.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartsTableComponent {
	// Transformamos el Input en una señal para reactividad total
	private _data = signal<PartNode[]>([]);
	@Input({ required: true }) set data(val: PartNode[]) {
		this._data.set(val);
	}

	@Output() openDetail = new EventEmitter<{ title: string; records: any[] }>();

	searchText = signal('');

	// Estado de ordenamiento
	sortField = signal<keyof PartNode>('ach');
	sortOrder = signal<'asc' | 'desc'>('asc');

	// Computed: Filtrado y ordenado reactivo
	filteredData = computed(() => {
		const query = this.searchText().toLowerCase().trim();
		const data = this._data();
		const field = this.sortField();
		const order = this.sortOrder();

		let filtered = !query ? data : data.filter((p) => p.number.toLowerCase().includes(query) || p.area.toLowerCase().includes(query) || p.supervisor.toLowerCase().includes(query));

		// Ordenado dinámico
		return [...filtered].sort((a, b) => {
			let valA: any = a[field];
			let valB: any = b[field];

			if (typeof valA === 'string') {
				valA = valA.toLowerCase();
				valB = valB.toLowerCase();
			}

			if (valA < valB) return order === 'asc' ? -1 : 1;
			if (valA > valB) return order === 'asc' ? 1 : -1;
			return 0;
		});
	});

	// Para mostrar el conteo total en la UI
	totalItems = computed(() => this.filteredData().length);

	onSearch(val: string) {
		this.searchText.set(val);
	}

	toggleSort(field: keyof PartNode) {
		if (this.sortField() === field) {
			this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
		} else {
			this.sortField.set(field);
			this.sortOrder.set('asc');
		}
	}

	triggerDetail(part: PartNode) {
		this.openDetail.emit({ title: part.number, records: part.records });
	}
}
