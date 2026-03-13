import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceSupervisorLoadData } from '../../services/finance-supervisor-load-data';
import { Authentication } from '../../../../../../auth/services/authentication';
import { ProductResponseDto, ProductRequestDto } from '../../interfaces/finance-supervisor.interfaces';
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-product',
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
  templateUrl: './product.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product {
  private readonly financeService = inject(FinanceSupervisorLoadData);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly products$ = this.financeService.products$;
  readonly categories$ = this.financeService.productCategories$;
  readonly costTypes$ = this.financeService.costTypes$;

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    productDescription: ['', Validators.required],
    productCategoryId: [null, Validators.required],
    costTypeId: [null, Validators.required],
  });

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'productDescription', label: 'Descripción' },
    { key: 'productCategory', label: 'Categoría' },
    { key: 'costType', label: 'Tipo de Costo' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
  ];

  dialogVisible = false;
  isEditMode = false;

  openCreateModal() {
    this.isEditMode = false;
    this.form.reset({ active: true });
    this.dialogVisible = true;
  }

  openEditModal(item: ProductResponseDto) {
    this.isEditMode = true;
    
    const category = this.categories$.value()?.find(c => c.productCategoryDescription === item.productCategory);
    const costType = this.costTypes$.value()?.find(c => c.costTypeDescription === item.costType);
    
    this.form.patchValue({
      ...item,
      productCategoryId: category?.id,
      costTypeId: costType?.id
    });
    this.dialogVisible = true;
  }

  closeModal() {
    this.dialogVisible = false;
  }

  onDelete(item: ProductResponseDto) {
    const category = this.categories$.value()?.find(c => c.productCategoryDescription === item.productCategory);
    const costType = this.costTypes$.value()?.find(c => c.costTypeDescription === item.costType);
    
    const request: ProductRequestDto = {
      active: false,
      productDescription: item.productDescription,
      productCategoryId: category?.id || '',
      costTypeId: costType?.id || '',
      updateBy: this.authService.user()?.email || 'System',
      createBy: 'System'
    };
    
    this.financeService.putProduct(item.id, request).subscribe(() => {
      this.products$.reload();
    });
  }

  save() {
    if (this.form.invalid) return;

    const user = this.authService.user()?.email || 'System';
    const formValue = this.form.value;
    
    const request: ProductRequestDto = {
      active: formValue.active,
      productDescription: formValue.productDescription,
      productCategoryId: formValue.productCategoryId,
      costTypeId: formValue.costTypeId,
      createBy: user,
      updateBy: user,
    };

    if (this.isEditMode) {
      this.financeService.putProduct(formValue.id, request).subscribe(() => {
        this.products$.reload();
        this.closeModal();
      });
    } else {
      this.financeService.postProduct(request).subscribe(() => {
        this.products$.reload();
        this.closeModal();
      });
    }
  }
}
