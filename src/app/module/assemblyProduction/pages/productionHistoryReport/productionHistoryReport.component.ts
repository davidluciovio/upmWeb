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
import { TableProductionHistoryReportComponent } from "../../components/tableProductionHistoryReport/tableProductionHistoryReport.component";
import { TitlePageComponent } from "../../../../shared/titlePage/titlePage.component";

@Component({
  selector: 'app-production-history-report',
  imports: [FilterProductionHistoryReportComponent, TableProductionHistoryReportComponent, TitlePageComponent],
  templateUrl: './productionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductionHistoryReportComponent {
  public Filters = signal<{
    Liders: Lider[];
    Lines: Line[];
    Shifts: WorkShift[];
    Dates: Date[];
  }>({
    Liders: [],
    Lines: [],
    Shifts: [],
    Dates: [],
  });
  //
  //
  constructor() {}
  //
}
