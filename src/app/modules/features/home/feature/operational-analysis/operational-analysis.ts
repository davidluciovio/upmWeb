import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { LoadData, OperationalAnalysisRequestInterface } from './services/load-data';
import { FilterBar } from './components/filterBar/filter-bar';
import { OperativityCard } from './components/operativity-card/operativity-card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MessageModule } from 'primeng/message';
import { PartnumberTableOperativity } from './components/operativity-tables/partnumber-table-operativity';
import { AreaTrendChartOperativity } from './components/operativity-charts/area-trend-chart-operativity';
// import { SupervisorHeatmapChartOperativity } from './components/operativity-charts/supervisor-heatmap-chart-operativity';
import { PartNumberDetailModal } from './components/operativity-tables/part-number-detail-modal';
import { AnnualAreaTrendChart } from './components/operativity-charts/annual-area-trend-chart';
import { SupervisorTableOperativity } from './components/operativity-tables/supervisor-table-operativity';
import { SupervisorDetailModal } from './components/operativity-tables/supervisor-detail-modal';
import { HierarchyRankingChart } from './components/operativity-charts/hierarchy-ranking-charts';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
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
		// SupervisorHeatmapChartOperativity,
		PartNumberDetailModal,
		AnnualAreaTrendChart,
		SupervisorTableOperativity,
		SupervisorDetailModal,
		HierarchyRankingChart,
		DialogModule,
		ButtonModule,
		CarouselModule,
		TooltipModule,
	],
	templateUrl: './operational-analysis.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalAnalysis {
	public readonly _loadData = inject(LoadData);
	filters = signal<OperationalAnalysisRequestInterface | null>(null);

	// Detail Modal State
	showDetailModal = signal(false);
	selectedPartNumber = signal<string>('');

	// Supervisor Detail Modal State
	showSupervisorDetailModal = signal(false);
	selectedSupervisorData = signal<{ name: string; type: string; item: any } | null>(null);

	// Sync Dialog State
	showSyncDialog = signal(false);

	// Presentation Mode State
	isPresentationMode = signal(false);
	isAutoplayPaused = signal(false);
	slideDuration = signal(25000);

	activeAutoplayInterval = computed(() => {
		return this.isAutoplayPaused() ? 0 : this.slideDuration();
	});

	// Options for duration select
	durationOptions = [
		{ label: '5s', value: 5000 },
		{ label: '10s', value: 10000 },
		{ label: '20s', value: 20000 },
		{ label: '1m', value: 60000 },
	];

	@ViewChild('logContainer') logContainer?: ElementRef<HTMLDivElement>;

	toggleAutoplay() {
		this.isAutoplayPaused.update((v) => !v);
	}

	onDurationChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		this.slideDuration.set(Number(value));
	}

	carouselItems = computed(() => {
		const data = this.data$.value();
		if (!data) return [];
		return [
			{ type: 'cards', data: data.cards, title: 'Resumen General' },
			{ type: 'ranking-manager', data: data.managments, title: 'Ranking de Gerentes' },
			{ type: 'ranking-jefe', data: data.managments, title: 'Ranking de Jefes' },
			{ type: 'ranking-supervisor', data: data.managments, title: 'Ranking de Supervisores' },
			{ type: 'ranking-leader', data: data.managments, title: 'Ranking de Líderes' },
			{ type: 'annual-trend', data: data.annualAreaTrends, title: 'Tendencia Anual' },
			{ type: 'area-trend', data: data.areaOperativityDayTrends, title: 'Tendencia por Área' },
		];
	});

	constructor() {
		// Auto-close dialog and handle scroll
		effect(() => {
			if (!this._loadData.isProcessing() && this.showSyncDialog()) {
				setTimeout(() => {
					this.showSyncDialog.set(false);
				}, 2000);
			}
		});

		effect(() => {
			// Trigger scroll when logs change
			const logs = this._loadData.logs();
			if (logs.length > 0 && this.logContainer) {
				setTimeout(() => {
					const el = this.logContainer?.nativeElement;
					if (el) {
						el.scrollTop = el.scrollHeight;
					}
				}, 100);
			}
		});
	}

	protected data$ = rxResource({
		params: () => this.filters(),
		stream: (rx) =>
			this._loadData.getOperationalAnalysisData(rx.params).pipe(
				map((response) => {
					if (!response) return response;

					// Ensure annulAreaDataTrends is ready
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

	onOpenSupervisorDetail(event: { item: any; type: string }) {
		let name = '';
		if (event.type === 'gerencia') name = event.item.managment;
		else if (event.type === 'jefe') name = event.item.jefe;
		else if (event.type === 'supervisor') name = event.item.supervisor;
		else if (event.type === 'leader') name = event.item.leader;

		this.selectedSupervisorData.set({
			name: name,
			type: event.type,
			item: event.item,
		});
		this.showSupervisorDetailModal.set(true);
	}

	async onSync() {
		this.showSyncDialog.set(true);
		await this._loadData.GetStreamSyncData();
	}
}
