import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

export interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
  selector: 'table-simple-crud',
  standalone: true,
  imports: [TableModule, InputTextModule, FormsModule, ButtonModule],
  templateUrl: './table-simple-crud.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSimpleCrud {
  public cols = input.required<Column[]>();
  public products = input<any[]>();
  public globalFilterFields = computed(() => this.cols().map(col => col.field));

    constructor() {}

    ngOnInit() {

    }
}
