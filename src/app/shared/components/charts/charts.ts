import { ChangeDetectionStrategy, Component, effect, inject, input, viewChild, computed } from '@angular/core';
import {
	ApexAxisChartSeries,
	ApexNonAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexDataLabels,
	ApexStroke,
	ApexYAxis,
	ApexFill,
	ApexTooltip,
	ApexLegend,
	ApexGrid,
	ApexStates,
	ApexPlotOptions,
	ChartComponent,
} from 'ng-apexcharts';
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
};

@Component({
	selector: 'chart',
	imports: [ChartComponent],
	templateUrl: './charts.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block w-full',
	},
})
export class Charts {
	private readonly _themeService = inject(DarkThemeService);

	chartOptions = input.required<ChartOptions>();
	chart = viewChild<ChartComponent>('chart');

	// Premium defaults
	private readonly _defaults: Partial<ChartOptions> = {
		chart: {
			toolbar: { show: true },
			type: 'line' as any,
			fontFamily: "'Inter', sans-serif",
			animations: { enabled: true, speed: 800 },
			background: 'transparent',
      zoom: { enabled: false },
		},
    responsive: [
      {
        breakpoint: 425,
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
        },
      },
    ],
    xaxis: {
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          colors: '#000',
          fontSize: '12px',
          fontWeight: 400,
        },
      },
    },
		grid: {
			show: true,
			borderColor: 'rgba(0,0,0,0.05)',
			strokeDashArray: 4,
		},
		dataLabels: { enabled: false },
		tooltip: { theme: 'light' }, // will be overridden by effect
		stroke: { curve: 'smooth', width: 3 },
	};

	// Merge input options with defaults
	mergedOptions = computed(() => {
		const opts = this.chartOptions();
		return {
			...this._defaults,
			...opts,
			chart: { ...this._defaults.chart, ...opts.chart } as ApexChart,
			grid: { ...this._defaults.grid, ...opts.grid },
			// Add other deep merges as necessary, or rely on shallow for less critical ones
		};
	});

	constructor() {
		effect(() => {
			const isDarkTheme = this._themeService.isDarkMode();
			const chart = this.chart();

			if (chart) {
				chart.updateOptions({
					theme: { mode: isDarkTheme ? 'dark' : 'light' },
					chart: { foreColor: isDarkTheme ? '#cbd5e1' : '#475569' },
					grid: { borderColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
					tooltip: { theme: isDarkTheme ? 'dark' : 'light' },
				});
			}
		});
	}
}
