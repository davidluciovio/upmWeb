import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {MultiSelectModule} from 'primeng/multiselect';
import { DatePicker } from "primeng/datepicker";
import { LiderService } from '../../services/lider.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Lider } from '../../interfaces/lider.interface';
import { LineService } from '../../services/line.service';
import { Button } from "primeng/button";
import { Line } from '../../interfaces/line.interface';

@Component({
  selector: 'filter-production-history-report',
  imports: [MultiSelectModule, DatePicker, FormsModule, Button],
  templateUrl: './filterProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterProductionHistoryReportComponent {
  private _liderService = inject(LiderService);
  private _lineService = inject(LineService);
  //
  //
  public Liders$ = rxResource({
    stream: () => this._liderService.GetAll() ?? of([])
  });
  //
  public Lines$ = rxResource({
    params: () => this.SelectedLiders(),
    stream: (rx) =>{
      if(rx.params.length <= 0) return of([])
      return this._lineService.GetByLiders(rx.params.map(lider => lider.liderId)) ?? of([])
    }
  });
  //
  //
  public SelectedLiders = signal<Lider[]>([])
  public SelectedLines = signal<Line[]>([])
  // public SelectedShifts = signal<Lider[]>([])
  public SelectedDates = signal<Date[]>([])
  //
  //

 }
