import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
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
  host:{
    class:"w-full h-fit p-6 bg-base-200 rounded-lg border border-base-300"
  }
})
export class Charts {
  private readonly _themeService = inject(DarkThemeService);

  chartOptions = input.required<ChartOptions>();
  chart = viewChild<ChartComponent>('chart');

  constructor() {
    effect(() => {
      const isDarkTheme = this._themeService.isDarkMode();
      const chart = this.chart(); // <-- Access the chart signal here

      if (chart) {
        // <-- Check if the chart exists
        chart.updateOptions({
          theme: { mode: isDarkTheme ? 'dark' : 'light' },
          chart: { foreColor: isDarkTheme ? 'white' : 'black' },
        });
      }
    });
  }
}
