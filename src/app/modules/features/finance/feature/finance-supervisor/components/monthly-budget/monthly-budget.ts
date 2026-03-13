import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { MonthlyBudgetResponseDto, MonthlyBudgetRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-monthly-budget',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableCrud,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    Select
  ],
  templateUrl: './monthly-budget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyBudget {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly monthlyBudgets$ = this.financeService.monthlyBudgets$;
  readonly annualBudgets$ = this.financeService.annualBudgets$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    annualBudgetId: [null, Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'month', label: 'Mes' },
    { key: 'annualYear', label: 'Año Presupuestado' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true, month: new Date().getMonth() + 1 });
    this.dialogVisible = true;
  }

  openEditModal(item: MonthlyBudgetResponseDto) {
    this.isEditMode = true;
    this.form.patchValue(item);
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: MonthlyBudgetResponseDto) {
    const request: MonthlyBudgetRequestDto = {
      active: false,
      month: item.month,
      annualBudgetId: item.annualBudgetId,
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putMonthlyBudget(item.id, request).subscribe(() => {
      this.monthlyBudgets$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: MonthlyBudgetRequestDto = {
      active: formValue.active,
      month: formValue.month,
      annualBudgetId: formValue.annualBudgetId,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putMonthlyBudget(formValue.id, request).subscribe(() => {
        this.monthlyBudgets$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postMonthlyBudget(request).subscribe(() => {
        this.monthlyBudgets$.reload();
        this.closeModal();
      });
    }
  }
}
