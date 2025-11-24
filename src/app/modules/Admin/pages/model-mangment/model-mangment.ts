import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { Authentication } from '../../../auth/services/authentication';
import { ModelInterface, ModelManagerService } from '../../services/model-manager';

@Component({
  selector: 'app-model-mangment',
  standalone: true,
  imports: [TableCrud, CommonModule, ReactiveFormsModule],
  templateUrl: './model-mangment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelMangment {
  private readonly modelService = inject(ModelManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly model$ = rxResource({
    stream: () =>
      this.modelService.getModels().pipe(
        map((models) => {
          return models;
        }),
      ),
  });

  form: FormGroup = this.fb.group({
    id: [0],
    active: ['false', Validators.required],
    createDate: [''],
    createBy: ['Leonardo', Validators.required],
    modelDescription: ['', Validators.required],
  });

  isEditMode = false;
  selectedModelId: number | null = null;

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
    { key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
    { key: 'createBy', label: 'Creado Por' },
    { key: 'modelDescription', label: 'Nombre del Modelo' },
  ];

  openModal() {
    const modal = document.getElementById('model_modal') as HTMLDialogElement;
    modal.showModal();
  }

  closeModal() {
    const modal = document.getElementById('model_modal') as HTMLDialogElement;
    modal.close();
  }

  deleteModel(event: ModelInterface) {
    this.modelService.deleteModel(event.id).subscribe(() => {
      this.model$.reload();
    });
  }

  editModel(event: ModelInterface) {
    this.isEditMode = true;
    this.selectedModelId = event.id;
    this.form.patchValue(event);
    this.openModal();
  }

  createModel() {
    this.isEditMode = false;
    const user = this.authService.user();
    if (user) {
      this.form.patchValue({ createBy: user.email });
    } else {
      this.form.patchValue({ createBy: 'Leonardo' });
    }
    this.openModal();
  }

  save() {
    if (this.form.valid) {
      const modelData: ModelInterface = this.form.value;
      modelData.createBy = this.authService.user()?.email || 'Leonardo';

      if (this.isEditMode && this.selectedModelId) {
        this.modelService.updateModel(modelData).subscribe(() => {
          this.model$.reload();
          this.closeModal();
        });
      } else {
        this.modelService.createModel(modelData).subscribe(() => {
          this.model$.reload();
          this.closeModal();
        });
      }
    }
  }
}
