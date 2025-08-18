import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Input,
  output,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Lider } from '../../interfaces/lider.interface';
import { Line } from '../../interfaces/line.interface';
import { WorkShift } from '../../interfaces/workShift.interface';
import { Button } from 'primeng/button';
import { Model } from '../../interfaces/model.interface';

@Component({
  selector: 'table-production-history-report',
  imports: [CommonModule, TableModule, DatePipe, Button],
  templateUrl: './tableProductionHistoryReport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableProductionHistoryReportComponent {
  public reportData = input.required<{
    Liders: Lider[];
    Lines: Line[];
    Models: Model[];
    Shifts: WorkShift[];
    Dates: Date[];
  }>();
  //
  public tableData = computed(() => {
    if (!this.reportData() || this.reportData().Dates.length == 0) return [];
    const { Liders, Lines, Models, Shifts, Dates } = this.reportData();

    let tableRows: {
      lider: Lider;
      line: Line;
      model: Model;
      shift: WorkShift;
      dateStart: Date;
      dateEnd: Date;
    }[] = [];

    Dates.forEach((date) => {
      Shifts.forEach((shift) => {
        Lines.forEach((line) => {
          Models.forEach((model) => {
            Liders.forEach((lider) => {
              // --- FIX IS HERE ---
              let startTimeAsDate = new Date(shift.startTime); // Create Date object from string
              let endTimeAsDate = new Date(shift.endTime); // Create Date object from string

              // Use the new Date object for all date methods
              const shiftHour = startTimeAsDate.getHours();
              const shiftMinute = startTimeAsDate.getMinutes();
              const shiftSecond = startTimeAsDate.getSeconds();

              // Create a new date object to avoid mutating the original
              const newDate = new Date(date);
              newDate.setHours(shiftHour, shiftMinute, shiftSecond, 0);
              const newEndDate = new Date(newDate.getTime() + shift.secondsQuantity * 1000);

              tableRows.push({
                lider,
                line,
                model,
                shift,
                dateStart: newDate,
                dateEnd: new Date(newEndDate), 
              });
            });
          });
        });
      });
    });

    return tableRows;
  });
  //
  // 
  public onSelectedReport = output<{
      lider: Lider;
      line: Line;
      model: Model;
      shift: WorkShift;
      dateStart: Date;
      dateEnd: Date;
    }>();
  //
  constructor() {}
  //
  //
  clicOpenReport(data: {
      lider: Lider;
      line: Line;
      model: Model;
      shift: WorkShift;
      dateStart: Date;
      dateEnd: Date;
    }) {
    this.onSelectedReport.emit(data);
  }
}
