import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FilterBar } from './components/filterBar/filter-bar';
import { LoadData, OperationalAnalysisRequestInterface } from './services/load-data';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-operational-analysis',
	imports: [FilterBar],
	templateUrl: './operational-analysis.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalAnalysis {
	private readonly _loadData = inject(LoadData);
	filters = signal<OperationalAnalysisRequestInterface | null>(null);

	data$ = rxResource({
		params: () => this.filters(),
		stream: (rx) => this._loadData.getOperationalAnalysisData(rx.params),
	}
	);

	onFiltersChange(filters: OperationalAnalysisRequestInterface) {
		this.filters.set(filters);

	}
}
