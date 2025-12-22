import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterState {
	startDate: string;
	endDate: string;
	area: string;
	supervisor: string;
	leader: string;
	partNumber: string;
}

@Component({
	selector: 'app-dashboard-filters',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './filters.html',
})
export class FiltersComponent {
	// Inputs como Signals (Angular 17.1+)
	areas = input<string[]>([]);
	supervisors = input<string[]>([]);
	leaders = input<string[]>([]);
	parts = input<string[]>([]);

	filterChange = output<FilterState>();

	// Estado inicial constante para facilitar el reset
	private readonly INITIAL_STATE: FilterState = (() => {
		const end = new Date();
		const start = new Date();
		start.setDate(end.getDate() - 7);
		return {
			startDate: start.toISOString().split('T')[0],
			endDate: end.toISOString().split('T')[0],
			area: '',
			supervisor: '',
			leader: '',
			partNumber: '',
		};
	})();

	// Signal que contiene el estado de los filtros
	filters = signal<FilterState>({ ...this.INITIAL_STATE });

	onSearch() {
		this.filterChange.emit(this.filters());
	}

	onClear() {
		// Resetear el signal al estado inicial
		this.filters.set({ ...this.INITIAL_STATE });
		this.filterChange.emit(this.filters());
	}

	// Método helper para actualizar campos individuales del signal
	updateField(field: keyof FilterState, value: string) {
		this.filters.update((prev) => ({ ...prev, [field]: value }));
		// Dinamismo instantáneo: emitir al cambiar
		this.filterChange.emit(this.filters());
	}
}
