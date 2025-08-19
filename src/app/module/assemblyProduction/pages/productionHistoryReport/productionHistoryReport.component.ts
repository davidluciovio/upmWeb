import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FilterProductionHistoryReportComponent } from '../../components/filterProductionHistoryReport/filterProductionHistoryReport.component';
import { Lider } from '../../interfaces/lider.interface';
import { Line } from '../../interfaces/line.interface';
import { WorkShift } from '../../interfaces/workShift.interface';
import { TableProductionHistoryReportComponent } from '../../components/tableProductionHistoryReport/tableProductionHistoryReport.component';
import { TitlePageComponent } from '../../../../shared/titlePage/titlePage.component';
import { Model } from '../../interfaces/model.interface';
import { ProductionReportService } from '../../services/productionReport.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ChartProductionHistoryReportComponent } from "../../components/chartProductionHistoryReport/chartProductionHistoryReport.component";
import { SubTitlePageComponent } from "../../../../shared/subTitlePage/subTitlePage.component";
import { DatePipe } from '@angular/common';
import { CardProductionDataComponent } from "../../components/cardProductionData/cardProductionData.component";

@Component({
  selector: 'app-production-history-report',
  imports: [
    FilterProductionHistoryReportComponent,
    TableProductionHistoryReportComponent,
    TitlePageComponent,
    ChartProductionHistoryReportComponent,
    SubTitlePageComponent,
    CardProductionDataComponent
],
  templateUrl: './productionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export default class ProductionHistoryReportComponent {
  private _productionReportService = inject(ProductionReportService);
  private _datePipe = inject(DatePipe);
  //
  // 
  public reportData$ = rxResource({
    params: () => this.SelectedReport(),
    stream: (rx) => {
      if (rx.params == null) return of([]);
      
      return this._productionReportService.GetProductionReport(
        rx.params.dateStart,
        rx.params.dateEnd,
        rx.params.line.lineId,
        rx.params.model.modelId
      );
    },
})
  public Filters = signal<{
    Liders: Lider[];
    Lines: Line[]; 
    Models: Model[];
    Shifts: WorkShift[];
    Dates: Date[];
  }>({
    Liders: [],
    Lines: [],
    Models: [],
    Shifts: [],
    Dates: [],
  });
  //
  public SelectedReport = signal<{
      lider: Lider;
      line: Line;
      model: Model;
      shift: WorkShift;
      dateStart: Date;
      dateEnd: Date;
    } | null>(null);
  //
  public DescriptionPage = computed(() => {
    return `${this.SelectedReport()?.lider.liderName}  ${this.SelectedReport()?.shift.description.toUpperCase()} - ${this._datePipe.transform(this.SelectedReport()?.dateStart, "dd/MM/yyyy HH:mm:ss a")}`
  });
  //
  constructor() {}
  //
}
