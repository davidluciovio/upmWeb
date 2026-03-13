import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { AnnualBudgetResponseDto, AnnualBudgetRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-annual-budget',
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
  templateUrl: './annual-budget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnualBudget {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly annualBudgets$ = this.financeService.annualBudgets$;
  readonly budgetTypes$ = this.financeService.budgetTypes$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    departamentId: ['', Validators.required],
    budgetTypeId: [null, Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'year', label: 'Año' },
    { key: 'departamentId', label: 'Departamento' },
    { key: 'budgetType', label: 'Tipo de Presupuesto' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true, year: new Date().getFullYear() });
    this.dialogVisible = true;
  }

  openEditModal(item: AnnualBudgetResponseDto) {
    this.isEditMode = true;
    
    const budgetType = this.budgetTypes$.value()?.find(b => b.budgetTypeDescription === item.budgetType);
    
    this.form.patchValue({
      ...item,
      budgetTypeId: budgetType?.id
    });
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: AnnualBudgetResponseDto) {
    const budgetType = this.budgetTypes$.value()?.find(b => b.budgetTypeDescription === item.budgetType);
    
    const request: AnnualBudgetRequestDto = {
      active: false,
      year: item.year,
      departamentId: item.departamentId,
      budgetTypeId: budgetType?.id || '',
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putAnnualBudget(item.id, request).subscribe(() => {
      this.annualBudgets$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: AnnualBudgetRequestDto = {
      active: formValue.active,
      year: formValue.year,
      departamentId: formValue.departamentId,
      budgetTypeId: formValue.budgetTypeId,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putAnnualBudget(formValue.id, request).subscribe(() => {
        this.annualBudgets$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postAnnualBudget(request).subscribe(() => {
        this.annualBudgets$.reload();
        this.closeModal();
      });
    }
  }
}
