import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Column,
  TableSimpleCrud,
} from '../../../../shared/components/table-simple-crud/table-simple-crud';

export interface ProductionAreaInterface {
  id: string;
  active: boolean;
  createDate: string;
  areaDescription: string;
}

@Component({
  selector: 'app-manager-areas',
  imports: [TableSimpleCrud],
  templateUrl: './manager-areas.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerAreas {
  cols: Column[] = [
    { field: 'id', header: 'ID' },
    { field: 'active', header: 'Activo' },
    { field: 'createDate', header: 'Fecha Creación' },
    { field: 'areaDescription', header: 'Área' },
  ]; 
  
  data: ProductionAreaInterface[] | null = null;
}
