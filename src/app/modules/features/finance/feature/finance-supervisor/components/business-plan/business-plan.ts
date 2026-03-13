import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { BusinessPlanResponseDto, BusinessPlanRequestDto, MonthlyBudgetResponseDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-business-plan',
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
  templateUrl: './business-plan.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessPlan {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly businessPlans$ = this.financeService.businessPlans$;
  readonly products$ = this.financeService.products$;
  readonly monthlyBudgets$ = this.financeService.monthlyBudgets$;

  // Added labeled version for the Select component optionLabel property
  readonly monthlyBudgetsLabeled = computed(() => {
    return (this.monthlyBudgets$.value() || []).map(mb => ({
      ...mb,
      label: `Mes ${mb.month} - ${mb.annualYear}`
    }));
  });

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    budget: [0, [Validators.required, Validators.min(0)]],
    productId: [null, Validators.required],
    monthlyBudgetId: [null, Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'budget', label: 'Presupuesto', dataType: 'number' },
    { key: 'product', label: 'Producto' },
    { key: 'monthlyBudget', label: 'Mes' },
    { key: 'annualBudget', label: 'Año' },
    { key: 'department', label: 'Depto' },
    { key: 'profit', label: 'Profit' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  getMonthlyBudgetLabel(mb: MonthlyBudgetResponseDto): string {
    return `Mes ${mb.month} - ${mb.annualYear}`;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true, budget: 0 });
    this.dialogVisible = true;
  }

  openEditModal(item: BusinessPlanResponseDto) {
    this.isEditMode = true;
    
    // Lookup IDs
    const product = this.products$.value()?.find(p => p.productDescription === item.product);
    // Monthly budget lookup is tricky as item response has string 'monthlyBudget' (which is month number usually) 
    // and 'annualBudget' (year string).
    const monthlyBudget = this.monthlyBudgets$.value()?.find(mb => 
      mb.month.toString() === item.monthlyBudget && mb.annualYear.toString() === item.annualBudget
    );

    this.form.patchValue({
      ...item,
      productId: product?.id,
      monthlyBudgetId: monthlyBudget?.id
    });
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: BusinessPlanResponseDto) {
    const product = this.products$.value()?.find(p => p.productDescription === item.product);
    const monthlyBudget = this.monthlyBudgets$.value()?.find(mb => 
      mb.month.toString() === item.monthlyBudget && mb.annualYear.toString() === item.annualBudget
    );

    const request: BusinessPlanRequestDto = {
      active: false,
      budget: item.budget,
      productId: product?.id || '',
      monthlyBudgetId: monthlyBudget?.id || '',
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putBusinessPlan(item.id, request).subscribe(() => {
      this.businessPlans$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: BusinessPlanRequestDto = {
      active: formValue.active,
      budget: formValue.budget,
      productId: formValue.productId,
      monthlyBudgetId: formValue.monthlyBudgetId,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putBusinessPlan(formValue.id, request).subscribe(() => {
        this.businessPlans$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postBusinessPlan(request).subscribe(() => {
        this.businessPlans$.reload();
        this.closeModal();
      });
    }
  }
}
