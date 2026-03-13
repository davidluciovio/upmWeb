import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { BudgetTypeResponseDto, BudgetTypeRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-budget-type',
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
  templateUrl: './budget-type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetType {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly budgetTypes$ = this.financeService.budgetTypes$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    budgetTypeDescription: ['', Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'budgetTypeDescription', label: 'Descripción' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true });
    this.dialogVisible = true;
  }

  openEditModal(item: BudgetTypeResponseDto) {
    this.isEditMode = true;
    this.form.patchValue(item);
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: BudgetTypeResponseDto) {
    const request: BudgetTypeRequestDto = {
      active: false,
      budgetTypeDescription: item.budgetTypeDescription,
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putBudgetType(item.id, request).subscribe(() => {
      this.budgetTypes$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: BudgetTypeRequestDto = {
      active: formValue.active,
      budgetTypeDescription: formValue.budgetTypeDescription,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putBudgetType(formValue.id, request).subscribe(() => {
        this.budgetTypes$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postBudgetType(request).subscribe(() => {
        this.budgetTypes$.reload();
        this.closeModal();
      });
    }
  }
}
