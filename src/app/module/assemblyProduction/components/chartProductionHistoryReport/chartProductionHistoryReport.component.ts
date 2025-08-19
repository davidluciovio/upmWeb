import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
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

@Component({
  selector: 'chart-production-history-report',
  imports: [ChartComponent],
  templateUrl: './chartProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartProductionHistoryReportComponent {
  private _productionReportService = inject(ProductionReportService);
  //
  //
  public chartData = computed(() =>
    this._productionReportService.ProductionReport()
  );
  //
  public chart: ApexChart = {
    height: 350,
    width: '100%',
    type: 'line',
    stacked: true,
    background: 'transparent',
  } as ApexChart;
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
  constructor() {}
  //
}
