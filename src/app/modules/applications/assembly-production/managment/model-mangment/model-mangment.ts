import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ColumnConfig, TableCrud } from '../../../../../shared/components/table-crud/table-crud';
import { CreateModelInterface, ModelInterface, ModelManagerService } from '../../services/model-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-model-mangment',
  standalone: true,
  imports: [TableCrud, FormsModule, CommonModule],
  templateUrl: './model-mangment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class ModelMangment implements OnInit {
  private readonly modelService = inject(ModelManagerService);
  private readonly datePipe = inject(DatePipe);

  readonly model$ = rxResource({
    stream: () => this.modelService.getModels().pipe(
      map(models => {
        for (const model of models) {
          model.createDate = this.datePipe.transform(model.createDate, 'dd/MM/yyyy HH:mm:ss a') || '';
        }
        return models;
      }),
    ),
  })

  models: ModelInterface[] = [];
  columns: ColumnConfig[] = [];

  newModel: CreateModelInterface = { createBy: '', modelDescription: '' };

  ngOnInit(): void {
    
    this.columns = [
      { key: 'id', label: 'ID' },
      { key: 'active', label: 'Activo' },
      { key: 'createDate', label: 'Fecha de Creación' },
      { key: 'createBy', label: 'Creado Por' },
      { key: 'modelDescription', label: 'Nombre del Modelo' },
    ];
  }

  constructor() {}

  deleteModel($event: Event) {
    console.log(Event);
  }
  editModel($event: Event) {
    console.log(Event);
  }
  
  createModel() {
    console.log('create');
    
  }

}
