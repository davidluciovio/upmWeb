import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import {MultiSelectModule} from 'primeng/multiselect';
import { DatePicker } from "primeng/datepicker";
import { SelectModule } from 'primeng/select';
import { Button } from "primeng/button";

import { LineService } from '../../services/line.service';
import { ModelService } from '../../services/model.service';
import { LiderService } from '../../services/lider.service';
import { WorkShiftService } from '../../services/workShift.service';

import { Lider } from '../../interfaces/lider.interface';
import { Model } from '../../interfaces/model.interface';
import { Line } from '../../interfaces/line.interface';
import { WorkShift } from '../../interfaces/workShift.interface';

@Component({
  selector: 'filter-production-history-report',
  imports: [MultiSelectModule, DatePicker, FormsModule, Button, SelectModule],
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
    params: () => { return {lineIds: this.SelectedLines(), liderIds: this.SelectedLiders()}},
    stream: (rx) =>{
      if(rx.params.lineIds.length <= 0 && rx.params.liderIds.length <= 0) return of([])
      return this._modelService.GetByLines(rx.params.lineIds.map(line => line.lineId), rx.params.liderIds.map(lider => lider.liderId)) ?? of([])
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
      date.setHours(8, 0, 0, 0);  
      newDates.push(date);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log({Liders: this.SelectedLiders(),
      Lines: this.SelectedLines(),
      Models: this.SelectedModels(),
      Shifts: this.SelectedShifts(),
      Dates: newDates,});
    
    
    this.onFilters.emit({
      Liders: this.SelectedLiders(),
      Lines: this.SelectedLines(),
      Models: this.SelectedModels(),
      Shifts: this.SelectedShifts(),
      Dates: newDates,
    });
    
  }
 }
