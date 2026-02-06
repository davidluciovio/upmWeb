import { ChangeDetectionStrategy, Component, inject, input, viewChild, computed } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts'; // Asegúrate de importar el módulo
import { DarkThemeService } from '../../../core/services/dark-theme';

export type ChartOptions = {
	series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
	chart?: ApexChart;
	xaxis?: ApexXAxis;
	yaxis?: ApexYAxis | ApexYAxis[];
	dataLabels?: ApexDataLabels;
	stroke?: ApexStroke;
	fill?: ApexFill;
	tooltip?: ApexTooltip;
	legend?: ApexLegend;
	grid?: ApexGrid;
	states?: ApexStates;
	plotOptions?: ApexPlotOptions;
	labels?: string[];
	colors?: string[];
	responsive?: ApexResponsive[];
	theme?: ApexTheme;
	title?: ApexTitleSubtitle;
	markers?: ApexMarkers;
	annotations?: ApexAnnotations;
};

@Component({
	selector: 'chart',
	standalone: true,
	imports: [NgApexchartsModule],
	template: `
		@if (chartOptions()) {
			<apx-chart
				#chart
				[series]="finalOptions().series!"
				[chart]="finalOptions().chart!"
				[xaxis]="finalOptions().xaxis!"
				[yaxis]="finalOptions().yaxis!"
				[dataLabels]="finalOptions().dataLabels!"
				[stroke]="finalOptions().stroke!"
				[fill]="finalOptions().fill!"
				[tooltip]="finalOptions().tooltip!"
				[legend]="finalOptions().legend!"
				[grid]="finalOptions().grid!"
				[plotOptions]="finalOptions().plotOptions!"
				[colors]="finalOptions().colors!"
				[labels]="finalOptions().labels!"
				[markers]="finalOptions().markers!"
				[annotations]="finalOptions().annotations!"
			>
			</apx-chart>
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'block w-full' },
})
export class Charts {
	private readonly _themeService = inject(DarkThemeService);

	chartOptions = input.required<any>();
	chart = viewChild<ChartComponent>('chart');

	// Agrupamos todo en un único computed para evitar múltiples ciclos de renderizado
	finalOptions = computed(() => {
		const isDark = this._themeService.isDarkMode();
		const userOpts = this.chartOptions();

		// Configuración de colores según el tema
		const foreColor = isDark ? '#cbd5e1' : '#475569';
		const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
		const themeMode = isDark ? 'dark' : 'light';

		return {
			...userOpts,
			chart: {
				...userOpts.chart,
				foreColor,
				background: 'transparent',
				fontFamily: "'Inter', sans-serif",
				animations: {
					enabled: userOpts.chart?.animations?.enabled ?? false,
					speed: userOpts.chart?.animations?.speed ?? 800,
				},
				toolbar: { show: true },
				zoom: { enabled: false },
				
			},
			grid: {
				...userOpts.grid,
				borderColor: gridColor,
				strokeDashArray: 4,
			},
			theme: { mode: themeMode },
			tooltip: {
				...userOpts.tooltip,
				theme: themeMode,
			},
			stroke: {
				show: true,
				curve: userOpts.stroke?.curve || 'straight',
				width: userOpts.stroke?.width || 2,
			},
		};
	});
	public updateSeries(series: ApexAxisChartSeries | ApexNonAxisChartSeries, animate: boolean = false) {
		this.chart()?.updateSeries(series, animate);
	}

	public updateOptions(options: any, redrawPaths?: boolean, animate?: boolean, updateSyncedCharts?: boolean) {
		this.chart()?.updateOptions(options, redrawPaths, animate, updateSyncedCharts);
	}
}
