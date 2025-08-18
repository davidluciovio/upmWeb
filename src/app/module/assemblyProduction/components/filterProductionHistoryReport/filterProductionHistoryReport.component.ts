import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
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
import { WorkShiftService } from '../../services/workShift.service';
import { WorkShift } from '../../interfaces/workShift.interface';
import { ModelService } from '../../services/model.service';
import { Model } from '../../interfaces/model.interface';

@Component({
  selector: 'filter-production-history-report',
  imports: [MultiSelectModule, DatePicker, FormsModule, Button],
  templateUrl: './filterProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterProductionHistoryReportComponent {
  private _liderService = inject(LiderService);
  private _lineService = inject(LineService);
  private _modelService = inject(ModelService);
  private _workShiftService = inject(WorkShiftService);
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
  public Shifts$ = rxResource({
    stream: () => this._workShiftService.GetAll() ?? of([])
  });
  //
  public Models$ = rxResource({
    params: () => this.SelectedLines(),
    stream: (rx) =>{
      if(rx.params.length <= 0) return of([])
      return this._modelService.GetByLines(rx.params.map(line => line.lineId)) ?? of([])
    }
  });
  //
  public SelectedLiders = signal<Lider[]>([])
  public SelectedLines = signal<Line[]>([])
  public SelectedModels = signal<Model[]>([])
  public SelectedShifts = signal<WorkShift[]>([])
  public SelectedDates = signal<Date[]>([])
  //
  // 
  public onFilters = output<{
    Liders: Lider[];
    Lines: Line[];
    Models: Model[];
    Shifts: WorkShift[];
    Dates: Date[];
  }>();
  // 
  // 
  constructor() {}
  //
  //
  clickSearchButton() {
    const startDate = this.SelectedDates()[0]??new Date;
    const endDate = this.SelectedDates()[1]??this.SelectedDates()[0];
    const currentDate = new Date(startDate);
    let newDates = [];
    while (currentDate <= endDate) {
      const date = new Date(currentDate)
      date.setHours(0, 0, 0, 0);  
      newDates.push(date);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.onFilters.emit({
      Liders: this.SelectedLiders(),
      Lines: this.SelectedLines(),
      Models: this.SelectedModels(),
      Shifts: this.SelectedShifts(),
      Dates: newDates,
    });
    
  }
 }
