import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

@Component({
  selector: 'app-chart-production-history-report',
  imports: [],
  templateUrl: './chartProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartProductionHistoryReportComponent {
  private _params = signal<{
    startDate: Date;
    endDate: Date;
    lineId: string;
    shiftId: string;
  } | null>(null); 
 }
