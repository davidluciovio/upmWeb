import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardAlertInterface } from '../../../component-alert/components/card-alert/card-alert';

@Component({
  selector: 'table-alerts-history',
  imports: [],
  templateUrl: './table-alerts-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableAlertsHistory {
  cols : any[] = [
    { field: 'creationDate', header: 'Fecha Creación' },
    { field: 'title', header: 'Título' },
    { field: 'description', header: 'Descripción' },
    { field: 'component', header: 'Componente' },
    { field: 'location', header: 'Ubicación' },
    { field: 'snp', header: 'SNP' },
    { field: 'status', header: 'Estado' },
    { field: 'partNumber', header: 'Número de Parte' },
    { field: 'line', header: 'Línea' },
    { field: 'model', header: 'Modelo' },
    { field: 'area', header: 'Área' },
  ];
  
  products = input<CardAlertInterface[]>();
  
 }
