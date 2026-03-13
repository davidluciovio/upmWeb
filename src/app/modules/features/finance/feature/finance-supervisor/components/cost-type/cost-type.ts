import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { CostTypeResponseDto, CostTypeRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-cost-type',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableCrud,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule
  ],
  templateUrl: './cost-type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostType {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly costTypes$ = this.financeService.costTypes$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    costTypeDescription: ['', Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'costTypeDescription', label: 'Descripción' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true });
    this.dialogVisible = true;
  }

  openEditModal(item: CostTypeResponseDto) {
    this.isEditMode = true;
    this.form.patchValue(item);
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: CostTypeResponseDto) {
    const request: CostTypeRequestDto = {
      active: false,
      costTypeDescription: item.costTypeDescription,
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putCostType(item.id, request).subscribe(() => {
      this.costTypes$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: CostTypeRequestDto = {
      active: formValue.active,
      costTypeDescription: formValue.costTypeDescription,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putCostType(formValue.id, request).subscribe(() => {
        this.costTypes$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postCostType(request).subscribe(() => {
        this.costTypes$.reload();
        this.closeModal();
      });
    }
  }
}
