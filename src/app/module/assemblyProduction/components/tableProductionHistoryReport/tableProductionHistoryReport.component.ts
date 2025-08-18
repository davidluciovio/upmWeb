import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Lider } from '../../interfaces/lider.interface';
import { Line } from '../../interfaces/line.interface';
import { WorkShift } from '../../interfaces/workShift.interface';
import { Button } from 'primeng/button';

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
    Shifts: WorkShift[];
    Dates: Date[];
  }>();
  //
  public tableData = computed(() => {
    if (!this.reportData() || this.reportData().Dates.length == 0) return [];
    const { Liders, Lines, Shifts, Dates } = this.reportData();

    let tableRows: {
      lider: Lider;
      line: Line;
      shift: WorkShift;
      date: Date;
    }[] = [];

    Dates.forEach((date) => {
      Shifts.forEach((shift) => {
        Lines.forEach((line) => {
          Liders.forEach((lider) => {
            // --- FIX IS HERE ---
            const startTimeAsDate = new Date(shift.startTime); // Create Date object from string

            // Use the new Date object for all date methods
            const shiftHour = startTimeAsDate.getHours();
            const shiftMinute = startTimeAsDate.getMinutes();
            const shiftSecond = startTimeAsDate.getSeconds();

            // Create a new date object to avoid mutating the original
            const newDate = new Date(date);
            newDate.setHours(shiftHour, shiftMinute, shiftSecond, 0);

            tableRows.push({
              lider,
              line,
              shift,
              date: newDate, // Push the new, modified date
            });
          });
        });
      });
    });
    console.log(tableRows);

    return tableRows;
  });
  //
  constructor() {}
  //
  //
}
