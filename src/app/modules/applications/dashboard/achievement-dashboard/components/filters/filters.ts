import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
	@Input() areas: string[] = [];
	@Input() supervisors: string[] = [];
	@Input() leaders: string[] = [];
	@Input() parts: string[] = [];

	@Output() filterChange = new EventEmitter<FilterState>();

	filters: FilterState = {
		startDate: '2025-12-01',
		endDate: '2025-12-31',
		area: '',
		supervisor: '',
		leader: '',
		partNumber: '',
	};

	onSearch() {
		this.filterChange.emit(this.filters);
	}

	onClear() {
		this.filters = {
			startDate: '',
			endDate: '',
			area: '',
			supervisor: '',
			leader: '',
			partNumber: '',
		};
		// Optionally emit or let user click search.
		// Usually clear implies resetting view, so let's emit.
		// However, clearing dates to empty might be bad if the backend expects dates.
		// Reverting to initial defaults might be safer if I knew them dynamically.
		// For this specific 'hardcoded' example, I will keep the hardcoded dates or clear them?
		// The previous code had hardcoded dates. I'll stick to clearing them to empty or just reset to the initial hardcoded ones?
		// Let's reset to the same hardcoded values for now to be safe, or just empty.
		// The user didn't specify. I'll use the hardcoded ones to match 'initial state'.
		this.filters = {
			startDate: '2025-12-01',
			endDate: '2025-12-31',
			area: '',
			supervisor: '',
			leader: '',
			partNumber: '',
		};
		this.filterChange.emit(this.filters);
	}
}
