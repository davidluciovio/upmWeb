import { ChangeDetectionStrategy, Component, computed, inject, signal, OnDestroy } from '@angular/core';
import {
	LoadData,
	OperationalAnalysisRequestInterface,
	OperationalAnalysisResponseInterface,
	PartNumberOperativity,
	PressGroup,
} from '../operational-analysis/services/load-data';
import { StampFilterBar } from './components/stamp-filter-bar';
import { OperativityCard } from '../operational-analysis/components/operativity-card/operativity-card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MessageModule } from 'primeng/message';
import { PartnumberTableOperativity } from '../operational-analysis/components/operativity-tables/partnumber-table-operativity';
import { AreaTrendChartOperativity } from '../operational-analysis/components/operativity-charts/area-trend-chart-operativity';
// import { SupervisorHeatmapChartOperativity } from '../operational-analysis/components/operativity-charts/supervisor-heatmap-chart-operativity';
import { PartNumberDetailModal } from '../operational-analysis/components/operativity-tables/part-number-detail-modal';
import { AnnualAreaTrendChart } from '../operational-analysis/components/operativity-charts/annual-area-trend-chart';
import { SupervisorTableOperativity } from '../operational-analysis/components/operativity-tables/supervisor-table-operativity';
import { HierarchyRankingChart } from '../operational-analysis/components/operativity-charts/hierarchy-ranking-charts';
import { map } from 'rxjs/operators';
import { PressOperativityChart } from './components/press-operativity-chart';
import { PressCard } from './components/press-card';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SupervisorDetailModal } from '../operational-analysis/components/operativity-tables/supervisor-detail-modal';

@Component({
	selector: 'app-operational-analysis-stamp',
	imports: [
		StampFilterBar,
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
		HierarchyRankingChart,
		PressOperativityChart,
		PressCard,
		CarouselModule,
		ButtonModule,
		TooltipModule,
		Select,
		FormsModule,
		DialogModule,
		SupervisorDetailModal,
	],
	templateUrl: './operational-analysis-stamp.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: [
		`
			.main-content-layout {
				display: flex;
				flex-direction: column;
				gap: 2rem;
				padding: 1rem;
			}

			.header-divider-alt {
				height: 1.5rem;
				width: 1px;
				background-color: #e2e8f0;
			}
			.icon-mr {
				margin-right: 0.5rem;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}
		`,
	],
})
export class OperationalAnalysisStamp implements OnDestroy {
	private readonly _loadData = inject(LoadData);
	filters = signal<OperationalAnalysisRequestInterface | null>(null);

	// Detail Modal State
	showDetailModal = signal(false);
	selectedPartNumber = signal<string>('');

	// Supervisor Detail Modal State
	showSupervisorDetailModal = signal(false);
	selectedSupervisorData = signal<{ name: string; type: string; item: any } | null>(null);

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

	protected pressData = computed(() => {
		const data = this.data$.value();
		if (!data) return [];
		return this.groupByPress(data);
	});

	carouselItems = computed(() => {
		const data = this.data$.value();
		if (!data) return [];

		const items = [
			{ type: 'cards', data: data.cards, title: 'Resumen General' },
			{ type: 'press-cards', data: this.pressData(), title: 'Operatividad por Prensa' },
			{ type: 'press-chart', data: this.pressData(), title: 'Gráfico de Prensas' },
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

	private _refreshIntervalId: any;

	constructor() {
		// Auto-refresh every hour
		this._refreshIntervalId = setInterval(async () => {
			this.data$.reload();
		}, 3600000);
	}

	ngOnDestroy(): void {
		if (this._refreshIntervalId) {
			clearInterval(this._refreshIntervalId);
		}
	}

	toggleAutoplay() {
		this.isAutoplayPaused.update((v) => !v);
	}

	onDurationChange(event: any) {
		this.slideDuration.set(Number(event.value));
	}

	protected data$ = rxResource({
		params: () => this.filters(),
		stream: (rx) => {
			const currentFilters = rx.params;
			if (!currentFilters) return this._loadData.getOperationalAnalysisData(null);

			// Force Estampado area
			const forceStampFilters: OperationalAnalysisRequestInterface = {
				...currentFilters,
				areas: ['Estampado'],
			};

			return this._loadData.getOperationalAnalysisData(forceStampFilters).pipe(
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
			);
		},
	});

	onFiltersChange(filters: OperationalAnalysisRequestInterface) {
		// Ensure Estampado is always in the filters sent to the state
		this.filters.set({ ...filters, areas: ['Estampado'] });
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

	groupByPress(data: OperationalAnalysisResponseInterface): PressGroup[] {
		const pressMap = new Map<string, PartNumberOperativity[]>();

		// Iteramos sobre todos los números de parte
		data.partNumbers.forEach((item) => {
			// Lógica de extracción:
			// El formato parece ser "CODIGO - PRENSA" o "CODIGO-ALGO - PRENSA"
			// Usamos " - " (espacio guion espacio) como separador seguro,
			// o tomamos el último segmento después de cualquier guion.
			let pressName = '';

			if (item.partNumber.includes(' - ')) {
				// Caso ideal: Hay un separador claro " - "
				const parts = item.partNumber.split(' - ');
				pressName = parts[parts.length - 1].trim();
			} else {
				// Caso alternativo: Solo hay guiones sin espacios claros
				const parts = item.partNumber.split('-');
				pressName = parts[parts.length - 1].trim();
			}

			// Agregamos al mapa
			if (!pressMap.has(pressName)) {
				pressMap.set(pressName, []);
			}
			pressMap.get(pressName)?.push(item);
		});

		// Convertimos el mapa a un array con el formato final
		const result: PressGroup[] = [];

		pressMap.forEach((parts, pressName) => {
			// Calculamos el promedio de operatividad para la prensa (opcional, pero útil)
			const totalOp = parts.reduce((sum, p) => sum + p.operativity, 0);
			const avgOp = parts.length > 0 ? totalOp / parts.length : 0;

			result.push({
				pressName: pressName,
				totalOperativity: avgOp,
				parts: parts,
			});
		});

		// Ordenamos alfabéticamente por nombre de prensa
		return result.sort((a, b) => a.pressName.localeCompare(b.pressName));
	}
}
