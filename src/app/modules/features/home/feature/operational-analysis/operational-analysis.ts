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

			.presentation-overlay {
				position: fixed;
				inset: 0;
				z-index: 1000;
				color: #1e293b;
				display: flex;
				flex-direction: column;
				animation: fadeIn 0.5s ease-in-out;
				padding: 1rem 1.5rem;
				background-color: #f1f5f9;
			}
			:host-context(.dark-mode) .presentation-overlay {
				background-color: #020617;
				color: #f1f5f9;
			}

			.presentation-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 1rem 2rem;
				background-color: #ffffff;
				border-bottom: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
			}
			:host-context(.dark-mode) .presentation-header {
				background-color: #0f172a;
				border-color: #1e293b;
			}

			.header-logo-section {
				display: flex;
				align-items: center;
				gap: 1rem;
			}
			.logo-image {
				height: 2rem;
			}
			.header-divider {
				height: 2rem;
				width: 1px;
				background-color: #e2e8f0;
				margin: 0 0.5rem;
			}
			.header-title {
				font-size: 1.25rem;
				font-weight: 700;
				letter-spacing: -0.025em;
				color: #0f172a;
				margin: 0;
			}
			:host-context(.dark-mode) .header-title {
				color: #f1f5f9;
			}

			.header-actions {
				display: flex;
				align-items: center;
				gap: 1.5rem;
			}
			.controls-group {
				display: flex;
				align-items: center;
				gap: 1rem;
				padding: 0.25rem 0.5rem;
				background-color: #f8fafc;
				border: 1px solid #e2e8f0;
				border-radius: 9999px;
			}
			:host-context(.dark-mode) .controls-group {
				background-color: #1e293b;
				border-color: #334155;
			}

			.control-btn {
				width: 2rem !important;
				height: 2rem !important;
				padding: 0 !important;
			}
			.control-btn .material-symbols-outlined {
				font-size: 1.25rem;
			}

			.duration-control {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				padding-right: 0.5rem;
			}
			.duration-label {
				font-size: 10px;
				font-weight: 700;
				color: #64748b;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			:host-context(.dark-mode) .duration-label {
				color: #94a3b8;
			}
			.duration-select {
				background: transparent;
				border: none;
				font-size: 12px;
				font-weight: 700;
				color: #0f172a;
				cursor: pointer;
				outline: none;
				padding: 0.125rem;
			}
			:host-context(.dark-mode) .duration-select {
				color: #f1f5f9;
			}

			.header-divider-alt {
				height: 1.5rem;
				width: 1px;
				background-color: #e2e8f0;
			}
			.icon-mr {
				margin-right: 0.5rem;
			}

			.presentation-content {
				flex-grow: 1;
				overflow: hidden;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 1.5rem 0;
			}
			.carousel-slide {
				height: 100%;
				width: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			.slide-header {
				font-size: 1.875rem;
				font-weight: 900;
				text-align: center;
				margin-bottom: 1rem;
				color: #1e293b;
				letter-spacing: -0.025em;
				text-transform: uppercase;
				font-style: italic;
			}
			:host-context(.dark-mode) .slide-header {
				color: #f8fafc;
			}

			.slide-body {
				position: relative;
				width: 100%;
				height: calc(100% - 60px);
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.slide-content-wrapper {
				width: 100%;
				height: 100%;
				overflow: hidden;
				padding: 1rem;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.slide-content-inner {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				overflow: auto;
			}

			::ng-deep .duration-select-prime {
				background: transparent !important;
				border: none !important;
				box-shadow: none !important;
				height: 2rem !important;
			}
			::ng-deep .duration-select-prime .p-select-label {
				padding: 0 0.5rem !important;
				font-size: 11px !important;
				font-weight: 900 !important;
				color: #0f172a !important;
				line-height: 2rem !important;
			}
			:host-context(.dark-mode) ::ng-deep .duration-select-prime .p-select-label {
				color: #f1f5f9 !important;
			}
			::ng-deep .duration-select-prime .p-select-dropdown {
				width: 1.5rem !important;
			}

			.slide-cards-summary-container {
				display: flex;
				flex-direction: column;
				gap: 2.5rem;
				width: 100%;
				padding: 1rem;
				overflow: auto;
				height: 100%;
			}
			.cards-flex-wrap {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 1.5rem;
				width: 100%;
			}
			.carousel-tables-grid {
				display: grid;
				grid-template-columns: repeat(1, minmax(0, 1fr));
				gap: 2rem;
				width: 100%;
				max-width: 1700px;
				margin: 0 auto;
				padding-bottom: 2rem;
			}
			@media (min-width: 1280px) {
				.carousel-tables-grid {
					grid-template-columns: repeat(5, minmax(0, 1fr));
				}
				.carousel-supervisor-table {
					grid-column: span 2 / span 2;
				}
				.carousel-partnumber-table {
					grid-column: span 3 / span 3;
				}
			}

			.ranking-slide-wrapper {
				width: 95%;
				height: 95%;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.ranking-chart-container {
				width: 100%;
				height: 100%;
			}

			.trend-slide-wrapper {
				width: 95%;
				height: 95%;
				display: flex;
			}
			.width-height-full {
				width: 100%;
				height: 100%;
			}
			.width-full {
				width: 100%;
			}

			.custom-carousel {
				width: 100%;
				height: 100%;
			}

			::ng-deep .custom-carousel .p-carousel {
				display: flex;
				flex-direction: column;
				height: 100%;
				width: 100%;
			}

			::ng-deep .custom-carousel .p-carousel-content {
				flex: 1;
				height: 100%;
				width: 100%;
				min-height: 0;
			}

			::ng-deep .custom-carousel .p-carousel-container {
				height: 100%;
				width: 100%;
			}

			::ng-deep .custom-carousel .p-carousel-item {
				height: 100%;
				width: 100%;
			}

			::ng-deep .custom-carousel .p-carousel-prev,
			::ng-deep .custom-carousel .p-carousel-next {
				width: 3.5rem;
				height: 3.5rem;
				border-radius: 50%;
				background-color: white !important;
				border: 1px solid #e2e8f0 !important;
				color: #475569 !important;
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				opacity: 1 !important;
				display: flex !important;
				align-items: center;
				justify-content: center;
				z-index: 2000 !important;
			}
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-prev,
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-next {
				background-color: #0f172a !important;
				border-color: #334155 !important;
				color: #cbd5e1 !important;
			}
			::ng-deep .custom-carousel .p-carousel-prev:hover,
			::ng-deep .custom-carousel .p-carousel-next:hover {
				background-color: #f8fafc !important;
				color: #0284c7 !important;
				transform: scale(1.1);
			}
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-prev:hover,
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-next:hover {
				background-color: #1e293b !important;
				color: #38bdf8 !important;
			}
			::ng-deep .custom-carousel .p-carousel-prev {
				margin-right: 1.5rem;
			}
			::ng-deep .custom-carousel .p-carousel-next {
				margin-left: 1.5rem;
			}

			::ng-deep .custom-carousel .p-carousel-indicators {
				padding-top: 1.5rem;
				gap: 0.5rem;
			}
			::ng-deep .custom-carousel .p-carousel-indicator button {
				width: 1.5rem;
				height: 0.5rem;
				border-radius: 9999px;
				background-color: #e2e8f0;
				transition: all 0.3s;
			}
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-indicator button {
				background-color: #334155;
			}
			::ng-deep .custom-carousel .p-carousel-indicator.p-highlight button {
				background-color: #0284c7;
				width: 3rem;
			}
			:host-context(.dark-mode) ::ng-deep .custom-carousel .p-carousel-indicator.p-highlight button {
				background-color: #38bdf8;
			}

			.filter-bar-sticky {
				position: sticky;
				top: 0;
				z-index: 50;
			}
			.empty-message-info {
				width: 100%;
				max-width: 32rem;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}
			@keyframes pulse {
				0%,
				100% {
					opacity: 1;
				}
				50% {
					opacity: 0.5;
				}
			}
			@keyframes fadeInUp {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
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
			{ type: 'cards', data: data.cards, title: 'Resumen General' },
			{ type: 'supervisor-table', data: data.managments, title: 'Análisis Jerárquico' },
			{ type: 'part-number-table', data: data.partNumbers, title: 'Eficiencia por No. de Parte' },
			{ type: 'ranking-manager', data: data.managments, title: 'Ranking de Gerentes' },
			{ type: 'ranking-jefe', data: data.managments, title: 'Ranking de Jefes' },
			{ type: 'ranking-supervisor', data: data.managments, title: 'Ranking de Supervisores' },
			{ type: 'ranking-leader', data: data.managments, title: 'Ranking de Líderes' },
			{ type: 'annual-trend', data: data.annualAreaTrends, title: 'Tendencia Anual' },
			{ type: 'area-trend', data: data.areaOperativityDayTrends, title: 'Tendencia por Área' },
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
			console.log('Iniciando sincronización automática por hora...');
			await this.onSync();
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
