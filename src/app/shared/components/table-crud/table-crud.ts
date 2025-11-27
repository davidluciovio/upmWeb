import { ChangeDetectionStrategy, input, output, Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para definir la configuración de las columnas
export interface ColumnConfig {
	key: string; // La 'key' del objeto de datos (ej: 'user.name')
	label: string; // El texto a mostrar en el encabezado (ej: 'Nombre')
	sortable?: boolean; // Opcional: si la columna se puede ordenar
	dataType?: 'string' | 'number' | 'date' | 'boolean'; // Opcional: el tipo de dato para formato
}

@Component({
	selector: 'table-crud',
	imports: [CommonModule, FormsModule],
	templateUrl: './table-crud.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCrud {
	// --- ENTRADAS (Inputs) ---
	data = input<any[]>();
	columns = input<ColumnConfig[]>();

	// --- SALIDAS (Outputs) ---
	edit = output<any>();
	delete = output<any>();
	create = output<void>();

	// --- LÓGICA INTERNA ---
	public filteredData: any[] = [];
	public paginatedData: any[] = [];
	public filterValue: string = '';

	// --- Lógica de Paginación ---
	public currentPage: number = 1;
	public itemsPerPage: number = 10;

	// --- Lógica de Filtros por Columna ---
	public columnFilters: { [key: string]: string } = {};

	// --- Lógica de Ordenamiento ---
	public sortColumn: string | null = null;
	public sortDirection: 'asc' | 'desc' = 'asc';

	constructor() {
		effect(() => {
			// Cada vez que los datos originales cambien, reiniciamos los filtros y actualizamos la vista.
			this.columnFilters = {};
			this.currentPage = 1; // Reiniciar a la primera página
			this.updateData();
		});
	}

	/**
	 * Orquesta el filtrado, ordenamiento y paginación de los datos.
	 */
	updateData(): void {
		this.applyFilter();
		this.applySorting();
		this.applyPagination();
	}

	/**
	 * Se llama cuando cambia un valor de filtro para reiniciar la paginación.
	 */
	onFilterChange(): void {
		this.currentPage = 1;
		this.updateData();
	}

	/**
	 * Filtra los datos basándose en el filtro global y los filtros por columna.
	 */
	applyFilter(): void {
		const globalFilter = this.filterValue.toLowerCase();
		let data = [...(this.data() || [])];

		// 1. Aplicar filtros por columna (lógica AND)
		const activeColumnFilters = Object.entries(this.columnFilters).filter(([, value]) => value);

		if (activeColumnFilters.length > 0) {
			data = data.filter((item) => {
				return activeColumnFilters.every(([key, filterValue]) => {
					let value = this.getValue(item, key);

					// Si es fecha, convertimos a string ISO simple (YYYY-MM-DD) para comparar
					if (value instanceof Date) {
						value = value.toISOString().split('T')[0];
					}

					return value != null && String(value).toLowerCase().includes(filterValue.toLowerCase());
				});
			});
		}

		// 2. Aplicar filtro global (lógica OR sobre el resultado anterior)
		if (globalFilter) {
			data = data.filter((item) => {
				return this.columns()!.some((col) => {
					const value = this.getValue(item, col.key);
					return value != null && String(value).toLowerCase().includes(globalFilter);
				});
			});
		}

		this.filteredData = data;
	}

	/**
	 * Ordena los datos filtrados según la columna y dirección seleccionadas.
	 */
	applySorting(): void {
		if (!this.sortColumn) {
			return; // No hay columna de ordenamiento seleccionada
		}

		this.filteredData.sort((a, b) => {
			const valA = this.getValue(a, this.sortColumn!);
			const valB = this.getValue(b, this.sortColumn!);

			// Manejar nulos o indefinidos para que siempre aparezcan al final
			if (valA == null) return 1;
			if (valB == null) return -1;

			// Comparación estándar
			if (valA < valB) {
				return this.sortDirection === 'asc' ? -1 : 1;
			}
			if (valA > valB) {
				return this.sortDirection === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}

	/**
	 * Aplica la paginación a los datos filtrados y ordenados.
	 */
	applyPagination(): void {
		const startIndex = (this.currentPage - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
		this.paginatedData = this.filteredData.slice(startIndex, endIndex);
	}

	/**
	 * Cambia a la página especificada.
	 */
	goToPage(page: number): void {
		if (page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
			this.updateData();
		}
	}

	/**
	 * Cambia a la página siguiente.
	 */
	nextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.updateData();
		}
	}

	/**
	 * Cambia a la página anterior.
	 */
	previousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.updateData();
		}
	}

	/**
	 * Calcula el número total de páginas.
	 */
	get totalPages(): number {
		return Math.ceil(this.filteredData.length / this.itemsPerPage);
	}

	/**
	 * Se llama al hacer clic en el encabezado de una columna para ordenarla.
	 */
	onSort(columnKey: string): void {
		const column = this.columns()?.find((c) => c.key === columnKey);
		if (!column || column.sortable === false) {
			return; // No hacer nada si la columna no es ordenable
		}

		if (this.sortColumn === columnKey) {
			// Si ya se ordena por esta columna, invertir la dirección
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Si es una nueva columna, establecerla como la de ordenamiento
			this.sortColumn = columnKey;
			this.sortDirection = 'asc';
		}

		this.updateData();
	}

	/**
	 * Helper para obtener valores de propiedades anidadas (ej: 'user.address.city').
	 */
	getValue(item: any, key: string): any {
		return key.split('.').reduce((acc, part) => acc?.[part], item);
	}

	// --- Emisores de Eventos ---
	editRow(item: any): void {
		this.edit.emit(item);
	}

	deleteRow(item: any): void {
		this.delete.emit(item);
	}

	createNew(): void {
		this.create.emit();
	}

	/**
	 * Exporta los datos filtrados de la tabla a un archivo CSV.
	 */
	exportToCsv(): void {
		if (!this.filteredData || this.filteredData.length === 0) {
			console.warn('No hay datos para exportar.');
			return;
		}

		const columns = this.columns();
		if (!columns) {
			console.warn('No hay configuración de columnas para exportar.');
			return;
		}

		// 1. Crear los encabezados del CSV
		const header = columns.map((col) => col.label).join(',');

		// 2. Crear las filas de datos
		const rows = this.filteredData
			.map((item) => {
				return columns
					.map((col) => {
						const value = this.getValue(item, col.key);
						// Escapar comas y comillas en los datos
						const stringValue = String(value ?? '').replaceAll('"', '""');
						return `"${stringValue}"`;
					})
					.join(',');
			})
			.join('\n');

		// 3. Combinar encabezado y filas
		const csvContent = `${header}\n${rows}`;

		// 4. Crear y descargar el archivo
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		if (link.href) {
			URL.revokeObjectURL(link.href);
		}
		link.href = URL.createObjectURL(blob);
		link.download = 'export_data.csv';
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		link.remove();
	}
}
