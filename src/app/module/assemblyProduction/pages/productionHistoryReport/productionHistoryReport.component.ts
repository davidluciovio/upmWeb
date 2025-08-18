import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FilterProductionHistoryReportComponent } from "../../components/filterProductionHistoryReport/filterProductionHistoryReport.component";

@Component({
  selector: 'app-production-history-report',
  imports: [FilterProductionHistoryReportComponent],
  templateUrl: './productionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductionHistoryReportComponent {

  constructor() {}
  //
}
