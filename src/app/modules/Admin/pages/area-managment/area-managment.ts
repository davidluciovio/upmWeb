import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';
import { AreaInterface, AreaManagerService } from '../../services/area-manager';
import { Authentication } from '../../../auth/services/authentication';

@Component({
  selector: 'app-area-managment',
  standalone: true,
  imports: [TableCrud, CommonModule, ReactiveFormsModule],
  templateUrl: './area-managment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaManagment {
  private readonly areaService = inject(AreaManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly area$ = rxResource({
    stream: () =>
      this.areaService.getAreas().pipe(
        map((areas) => {
          return areas;
        }),
      ),
  });

  form: FormGroup = this.fb.group({
    id: [0],
    active: ['false', Validators.required],
    createDate: [''],
    createBy: ['Leonardo', Validators.required],
    areaDescription: ['', Validators.required],
  });

  isEditMode = false;
  selectedAreaId: number | null = null;

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
    { key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
    { key: 'createBy', label: 'Creado Por' },
    { key: 'areaDescription', label: 'Nombre del Area' },
  ];

  openModal() {
    const modal = document.getElementById('area_modal') as HTMLDialogElement;
    modal.showModal();
  }

  closeModal() {
    const modal = document.getElementById('area_modal') as HTMLDialogElement;
    modal.close();
  }

  deleteArea(event: AreaInterface) {
    this.areaService.deleteArea(event.id).subscribe(() => {
      this.area$.reload();
    });
  }

  editArea(event: AreaInterface) {
    this.isEditMode = true;
    this.selectedAreaId = event.id;
    this.form.patchValue(event);
    this.openModal();
  }

  createArea() {
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
      const areaData: AreaInterface = this.form.value;
      areaData.createBy = this.authService.user()?.email || 'Leonardo';

      if (this.isEditMode && this.selectedAreaId) {
        this.areaService.updateArea(areaData).subscribe(() => {
          this.area$.reload();
          this.closeModal();
        });
      } else {
        this.areaService.createArea(areaData).subscribe(() => {
          this.area$.reload();
          this.closeModal();
        });
      }
    }
  }
}
