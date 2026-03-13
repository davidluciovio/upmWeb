import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { ProductCategoryResponseDto, ProductCategoryRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-product-category',
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
  templateUrl: './product-category.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCategory {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly productCategories$ = this.financeService.productCategories$;
  readonly profits$ = this.financeService.profits$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    productCategoryDescription: ['', Validators.required],
    acount: ['', Validators.required],
    profitId: [null, Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'productCategoryDescription', label: 'Descripción' },
    { key: 'acount', label: 'Cuenta' },
    { key: 'profit', label: 'Profit' },
    { key: 'type', label: 'Tipo' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true });
    this.dialogVisible = true;
  }

  openEditModal(item: ProductCategoryResponseDto) {
    this.isEditMode = true;
    
    // Need to find the profitId from the description if not provided in response, 
    // but the backend dto for Put usually expects the ID.
    // Let's assume we need to handle the conversion if needed, 
    // but typically we should have the ID in the response too.
    // Given the response DTO I created: it has 'profit' string.
    // I might need to look up the ID in profits$ or the response needs to be updated.
    // Assuming the response from GetAll might have more info than the DTO shows or I'll look it up.
    
    const profit = this.profits$.value()?.find(p => p.profitDescription === item.profit);
    
    this.form.patchValue({
      ...item,
      profitId: profit?.id
    });
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: ProductCategoryResponseDto) {
    const profit = this.profits$.value()?.find(p => p.profitDescription === item.profit);
    const request: ProductCategoryRequestDto = {
      active: false,
      productCategoryDescription: item.productCategoryDescription,
      acount: item.acount,
      type: item.type,
      profitId: profit?.id || '',
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putProductCategory(item.id, request).subscribe(() => {
      this.productCategories$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: ProductCategoryRequestDto = {
      active: formValue.active,
      productCategoryDescription: formValue.productCategoryDescription,
      acount: formValue.acount,
      type: formValue.type,
      profitId: formValue.profitId,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putProductCategory(formValue.id, request).subscribe(() => {
        this.productCategories$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postProductCategory(request).subscribe(() => {
        this.productCategories$.reload();
        this.closeModal();
      });
    }
  }
}

// Touched
