import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LoadData, OperationalAnalysisRequestInterface } from './services/load-data';
import { FilterBar } from './components/filterBar/filter-bar';
import { OperativityCard } from './components/operativity-card/operativity-card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MessageModule } from 'primeng/message';
import { PartnumberTableOperativity } from './components/operativity-tables/partnumber-table-operativity';
import { AreaTrendChartOperativity } from './components/operativity-charts/area-trend-chart-operativity';
import { SupervisorHeatmapChartOperativity } from './components/operativity-charts/supervisor-heatmap-chart-operativity';
import { PartNumberDetailModal } from './components/operativity-tables/part-number-detail-modal';
import { AnnualAreaTrendChart } from './components/operativity-charts/annual-area-trend-chart';
import { SupervisorTableOperativity } from './components/operativity-tables/supervisor-table-operativity';
import { map } from 'rxjs/operators';

@Component({
	selector: 'app-operational-analysis',
	imports: [
		FilterBar,
		OperativityCard,
		ProgressSpinnerModule,
		CommonModule,
		MessageModule,
		PartnumberTableOperativity,
		AreaTrendChartOperativity,
		SupervisorHeatmapChartOperativity,
		PartNumberDetailModal,
		AnnualAreaTrendChart,
		SupervisorTableOperativity,
	],
	templateUrl: './operational-analysis.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalAnalysis {
	private readonly _loadData = inject(LoadData);
	filters = signal<OperationalAnalysisRequestInterface | null>(null);

	// Detail Modal State
	showDetailModal = signal(false);
	selectedPartNumber = signal<string>('');

	protected data$ = rxResource({
		params: () => this.filters(),
		stream: (rx) =>
			this._loadData.getOperationalAnalysisData(rx.params).pipe(
				map((response) => {
					if (!response) return response;

					// Mock Supervisor Heatmap Trends if missing
					if (
						(!response.supervisorOperativityDayHeatMaps || response.supervisorOperativityDayHeatMaps.length === 0) &&
						response.supervisors?.length > 0 &&
						response.areaOperativityDayTrends?.length > 0
					) {
						const dates = response.areaOperativityDayTrends[0].dayOperativities.map((d) => d.day);
						response.supervisorOperativityDayHeatMaps = response.supervisors.map((sup) => ({
							supervisor: sup.supervisor,
							dayOperativities: dates.map((date) => ({
								day: date,
								operativity: Math.min(1, Math.max(0, sup.operativity + (Math.random() * 0.2 - 0.1))),
							})),
							leaders: (sup.leaders || []).map((l) => ({
								leader: l.leader,
								dayOperativities: dates.map((date) => ({
									day: date,
									operativity: Math.min(1, Math.max(0, l.operativity + (Math.random() * 0.2 - 0.1))),
								})),
							})),
						}));
					}

					// Mock Annual Area Trends if missing
					if (!response.annualAreaTrends || response.annualAreaTrends.length === 0) {
						const currentYear = new Date().getFullYear();
						const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
						const areas = Array.from(new Set(response.cards?.map((c) => c.area) || []));

						response.annualAreaTrends = areas.map((area) => ({
							area: area,
							months: monthNames.map((name, index) => ({
								year: currentYear,
								month: index + 1,
								monthName: name,
								operativity: Math.min(1, Math.max(0.6, 0.82 + (Math.random() * 0.2 - 0.1))),
							})),
						}));
					}

					return response;
				}),
			),
	});

	onFiltersChange(filters: OperationalAnalysisRequestInterface) {
		this.filters.set(filters);
	}

	onOpenDetail(partNumber: string) {
		this.selectedPartNumber.set(partNumber);
		this.showDetailModal.set(true);
	}
}
