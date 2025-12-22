import { Component, Input, ChangeDetectionStrategy, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PartNode {
	number: string;
	area: string;
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
	currentPage = signal(1);
	pageSize = signal(10);

	// Computed: Filtrado reactivo (se dispara solo cuando cambia _data o searchText)
	filteredData = computed(() => {
		const query = this.searchText().toLowerCase().trim();
		const data = this._data();

		const filtered = !query ? data : data.filter((p) => p.number.toLowerCase().includes(query) || p.area.toLowerCase().includes(query));

		// Ordenar de menor a mayor cumplimiento (ach)
		return [...filtered].sort((a, b) => a.ach - b.ach);
	});

	// Computed: Paginación reactiva vinculada al filtro
	paginatedData = computed(() => {
		const start = (this.currentPage() - 1) * this.pageSize();
		return this.filteredData().slice(start, start + this.pageSize());
	});

	// Metadatos de paginación
	totalItems = computed(() => this.filteredData().length);
	totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

	// Computed: Generación de array de páginas (ventana de 5 páginas)
	pagesArray = computed(() => {
		const total = this.totalPages();
		const current = this.currentPage();
		let start = Math.max(1, current - 2);
		let end = Math.min(total, start + 4);

		if (end - start < 4) start = Math.max(1, end - 4);
		return Array.from({ length: end - Math.max(1, start) + 1 }, (_, i) => Math.max(1, start) + i);
	});

	onSearch(val: string) {
		this.searchText.set(val);
		this.currentPage.set(1); // Resetear a la primera página al buscar
	}

	changePage(page: number) {
		if (page >= 1 && page <= this.totalPages()) {
			this.currentPage.set(page);
		}
	}

	triggerDetail(part: PartNode) {
		this.openDetail.emit({ title: part.number, records: part.records });
	}
}
