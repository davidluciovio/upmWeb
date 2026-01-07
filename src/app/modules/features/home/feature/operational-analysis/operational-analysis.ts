import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FilterBar, FilterBarData } from './components/filterBar/filter-bar';

@Component({
	selector: 'app-operational-analysis',
	imports: [FilterBar],
	templateUrl: './operational-analysis.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalAnalysis {
	filters = signal<FilterBarData | null>(null);

	onFiltersChange(filters: FilterBarData) {
		this.filters.set(filters);
	}
}
