import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexYAxis,
  ApexTooltip,
  ApexTitleSubtitle,
  ApexXAxis,
  NgApexchartsModule,
  ApexDataLabels,
  ApexTheme,
} from 'ng-apexcharts';
import { ProductionReportService } from '../../services/productionReport.service';
import { ThemeService } from '@primeng/themes';
import { ThemeModeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'chart-production-history-report',
  imports: [ChartComponent],
  templateUrl: './chartProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartProductionHistoryReportComponent {
  private _productionReportService = inject(ProductionReportService);
  private _themeService = inject(ThemeModeService);
  private _viewChart = viewChild.required<ChartComponent>('chartProductionReport')
  //
  //
  public chartData = computed(() =>
    this._productionReportService.ProductionReport()
  );
  //
  public chart = computed<ApexChart>(() =>  {
    return {
      height: 400,
      width: '100%',
      type: 'line',
      stacked: true,
      background: 'transparent',
      foreColor: this._themeService.IsDarkTheme() ? 'white' : 'black'
    }
  } );
  //
  public dataLabels: ApexDataLabels = {
    enabled: true,
  } as ApexDataLabels;
  //
  public labels: string[] = [];
  //
  public series = computed(() => {
    let series: ApexAxisChartSeries = [];
    this.chartData().forEach((data) => {
      series.push({
        name: data.partNumber.partNumberName,
        type: 'bar',
        data: data.timeProductions.map((x) => x.production),
      });

      // series.push({
      //   name: 'Plan Objetivo',
      //   type: 'line',
      //   data: data.timeProductions.map((x) => Math.round(x.plan)),
      // });

      this.labels = data.timeProductions.map((x) =>
        new Date(x.time).toLocaleTimeString()
      );
    });
    return series;
  });
  //
  public theme = computed<ApexTheme>(() => {
    const theme =  this._themeService.IsDarkTheme() ? 'dark' : 'light';

    // this._viewChart().theme().mode = theme;
    return {
      mode: theme,
    }
  });
  //
  constructor() {}
  //
}
