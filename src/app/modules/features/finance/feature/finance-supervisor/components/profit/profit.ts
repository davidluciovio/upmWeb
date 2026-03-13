import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { ProfitResponseDto, ProfitRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-profit',
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
  templateUrl: './profit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profit {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly profits$ = this.financeService.profits$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    profitDescription: ['', Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'profitDescription', label: 'Descripción' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true });
    this.dialogVisible = true;
  }

  openEditModal(profit: ProfitResponseDto) {
    this.isEditMode = true;
    this.form.patchValue(profit);
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(profit: ProfitResponseDto) {
    // Assuming soft delete via update active=false or a delete endpoint if it existed
    // Since the service only has put/post, I'll update it to active=false
    const request: ProfitRequestDto = {
      active: false,
      profitDescription: profit.profitDescription,
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System' // This logic depends on backend
    };
    
    this.financeService.putProfit(profit.id, request).subscribe(() => {
      this.profits$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: ProfitRequestDto = {
      active: formValue.active,
      profitDescription: formValue.profitDescription,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putProfit(formValue.id, request).subscribe(() => {
        this.profits$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postProfit(request).subscribe(() => {
        this.profits$.reload();
        this.closeModal();
      });
    }
  }
}
