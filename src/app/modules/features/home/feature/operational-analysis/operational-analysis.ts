import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { LoadData, OperationalAnalysisRequestInterface } from './services/load-data';
import { FilterBar } from './components/filterBar/filter-bar';
import { OperativityCard } from './components/operativity-card/operativity-card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { Select } from 'primeng/select';
import { map } from 'rxjs/operators';
import { LanguageService } from './services/language.service';

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
		Select,
		FormsModule,
	],
	templateUrl: './operational-analysis.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'operational-analysis-host',
	},
	styles: [
		`
			.operational-analysis-host {
				display: block;
				width: 100%;
				height: 100%;
				background-color: #f1f5f9;
			}
			.main-content-layout {
				display: flex;
				flex-direction: column;
				gap: 2rem;
				padding: 1rem;
			}
			@media (min-width: 768px) {
				.main-content-layout {
					gap: 1rem;
				}
			}
			@media (min-width: 1024px) {
				.main-content-layout {
					padding: 0.5rem;
				}
			}

			.log-viewer-container {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
				max-height: 24rem;
				overflow-y: auto;
				padding: 1rem;
				background-color: #0f172a;
				border-radius: 0.5rem;
				border: 1px solid #334155;
				font-family: monospace;
				font-size: 0.875rem;
			}
			.log-entry {
				color: #34d399;
			}
			.log-index {
				color: #64748b;
			}
			.log-empty {
				color: #64748b;
				font-style: italic;
			}
			.sync-processing {
				display: flex;
				items-center: center;
				gap: 0.5rem;
				color: #38bdf8;
				animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
			}

			.loading-state-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 3rem;
				gap: 2rem;
			}
			.loading-text {
				color: #64748b;
				font-weight: 500;
				animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
			}

			.cards-display-grid {
				display: grid;
				grid-template-columns: repeat(1, minmax(0, 1fr));
				gap: 1rem;
			}
			@media (min-width: 768px) {
				.cards-display-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
			@media (min-width: 1024px) {
				.cards-display-grid {
					grid-template-columns: repeat(3, minmax(0, 1fr));
				}
			}
			@media (min-width: 1280px) {
				.cards-display-grid {
					grid-template-columns: repeat(5, minmax(0, 1fr));
				}
			}

			.tables-display-grid {
				display: grid;
				grid-template-columns: repeat(1, minmax(0, 1fr));
				gap: 2rem;
			}
			@media (min-width: 1280px) {
				.tables-display-grid {
					grid-template-columns: repeat(5, minmax(0, 1fr));
				}
				.supervisor-table-span {
					grid-column: span 2 / span 2;
				}
				.partnumber-table-span {
					grid-column: span 3 / span 3;
				}
			}

			.rankings-display-grid {
				display: grid;
				grid-template-columns: repeat(1, minmax(0, 1fr));
				gap: 1.5rem;
			}
			@media (min-width: 768px) {
				.rankings-display-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
			@media (min-width: 1280px) {
				.span-two-cols {
					grid-column: span 2 / span 2;
				}
			}

			.empty-state-container {
				display: flex;
				justify-content: center;
				padding: 3rem;
			}

			.card-entry-animation {
				animation: fadeInUp 0.5s ease-out forwards;
				opacity: 0;
			}
			.fade-in-up-container {
				animation: fadeInUp 0.5s ease-out forwards;
			}
		`,
	],
})
export class OperationalAnalysis implements OnDestroy {
	public readonly _loadData = inject(LoadData);
	public readonly langService = inject(LanguageService);
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
	slideDuration = signal(10000);

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
	private _refreshIntervalId: any;

	toggleAutoplay() {
		this.isAutoplayPaused.update((v) => !v);
	}

	onDurationChange(event: any) {
		this.slideDuration.set(Number(event.value));
	}

	carouselItems = computed(() => {
		const data = this.data$.value();
		if (!data) return [];

		const items = [
			{ type: 'cards', data: data.cards, title: this.langService.translateDual('generalSummary') },
			{ type: 'supervisor-table', data: data.managments, title: this.langService.translateDual('hierarchicalAnalysis') },
			{ type: 'part-number-table', data: data.partNumbers, title: this.langService.translateDual('efficiencyByPart') },
			{ type: 'ranking-manager', data: data.managments, title: this.langService.translateDual('managerRanking') },
			{ type: 'ranking-jefe', data: data.managments, title: this.langService.translateDual('jefeRanking') },
			{ type: 'ranking-supervisor', data: data.managments, title: this.langService.translateDual('supervisorRanking') },
			{ type: 'ranking-leader', data: data.managments, title: this.langService.translateDual('leaderRanking') },
			{ type: 'annual-trend', data: data.annualAreaTrends, title: this.langService.translateDual('annualTrend') },
			{ type: 'area-trend', data: data.areaOperativityDayTrends, title: this.langService.translateDual('areaTrend') },
		];

		// Filter out items with no data to avoid blank slides
		return items.filter((item) => {
			if (!item.data) return false;
			if (Array.isArray(item.data)) return item.data.length > 0;
			return true;
		});
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

		// Configurar sincronización y actualización automática cada hora
		this._refreshIntervalId = setInterval(async () => {
			console.log(this.langService.translateDual('startingSync'));
			// await this.onSync();
			this.data$.reload();
		}, 3600000); // 1 hora
	}

	ngOnDestroy(): void {
		if (this._refreshIntervalId) {
			clearInterval(this._refreshIntervalId);
		}
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
