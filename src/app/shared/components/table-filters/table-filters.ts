import { ChangeDetectionStrategy, Component, computed, input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';

export interface ColumnTableFiltersInterface {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
  selector: 'table-filters',
  imports: [TableModule],
  templateUrl: './table-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableFilters implements OnInit{
  public cols = input.required<ColumnTableFiltersInterface[]>();
  public products = input<any[]>();
  public globalFilterFields = computed(() => this.cols().map((col) => col.field));

  constructor() {}

  ngOnInit() {}
}
 