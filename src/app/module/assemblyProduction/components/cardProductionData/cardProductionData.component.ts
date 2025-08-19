import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { ProductionReportService } from '../../services/productionReport.service';

@Component({
  selector: 'card-production-data',
  imports: [],
  templateUrl: './cardProductionData.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProductionDataComponent { 
  private _container = viewChild.required<HTMLElement>('kpi');
  public value = input.required<string>() 
  public icon = input.required<string>() 
  public color = input.required<string>() 

  constructor() {
    this._container().classList.add(this.color())
  }

}
