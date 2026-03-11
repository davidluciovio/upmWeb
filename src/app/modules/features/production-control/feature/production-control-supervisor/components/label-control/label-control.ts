import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import * as XLSX from 'xlsx';

// Services
import { LabelControlManager, LabelControlRequestDto, LabelControlResponseDto } from '../../services/label-control-manager';
import { ProductionStationManager } from '../../../../../../Admin/services/production-station-manager';
import { Authentication } from '../../../../../../auth/services/authentication';

// Components & Config
import { ColumnConfig, TableCrud } from '../../../../../../../shared/components/table-crud/table-crud';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-label-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCrud,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    Select,
    DatePicker,
    InputNumberModule,
    ToastModule,
    TableModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4 flex flex-col gap-4 animate-fade-in h-full">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex flex-col gap-1 text-center md:text-left">
          <h1 class="text-3xl font-extrabold text-surface-900 dark:text-surface-0 tracking-tight">Control de Etiquetas</h1>
          <p class="text-surface-500 dark:text-surface-400 font-medium">Gestión y monitoreo de folios de producción en tiempo real.</p>
        </div>
        <div class="glass-effect flex items-center p-2 bg-surface-100 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
          <input 
            type="file" 
            #excelUpload 
            class="hidden" 
            accept=".xlsx, .xls" 
            (change)="onFileChange($event)"
          />
          <p-button 
            label="Descargar Formato" 
            icon="pi pi-download" 
            [text]="true"
            severity="secondary" 
            size="small"
            styleClass="rounded-xl px-4"
            (onClick)="downloadTemplate()"
          ></p-button>

          <div class="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1"></div>

          <p-button 
            label="Importar Excel" 
            icon="pi pi-file-excel" 
            [text]="true"
            severity="success" 
            size="small"
            styleClass="rounded-xl px-4"
            (onClick)="excelUpload.click()"
          ></p-button>
        </div>
      </div>

      @if (!labels$.isLoading()) {
        <table-crud
          [data]="labels$.value() || []"
          [columns]="columns"
          (create)="onCreate()"
          (edit)="onEdit($event)"
        ></table-crud>
      } @else {
        <div class="flex flex-col items-center justify-center p-20 min-h-[400px]">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <span class="mt-4 text-lg font-semibold text-surface-600">Cargando etiquetas...</span>
        </div>
      }

      <!-- Modal creación/edición -->
      <p-dialog
        [(visible)]="dialogVisible"
        [header]="isEditMode ? 'Editar Etiqueta' : 'Nueva Etiqueta'"
        [modal]="true"
        [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
        [style]="{ width: '450px' }"
        [draggable]="false"
        [resizable]="false"
        styleClass="p-fluid"
      >
        <ng-template pTemplate="content">
          <form [formGroup]="form" class="flex flex-col gap-5 pt-4">
            <div class="flex flex-col gap-1.5">
              <label for="order" class="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">Orden de Producción</label>
              <input pInputText id="order" formControlName="order" placeholder="Ej: ORD-2024-001" class="w-full" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="ran" class="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">RAN (Número de Almacén)</label>
              <input pInputText id="ran" formControlName="ran" placeholder="Ej: RAN-X99" class="w-full" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="quantity" class="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">Cantidad por Etiqueta</label>
              <p-inputNumber id="quantity" formControlName="quantity" [min]="0" mode="decimal" [showButtons]="true" styleClass="w-full"></p-inputNumber>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="productionStationId" class="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">Estación de Destino</label>
              <p-select
                id="productionStationId"
                [options]="stations$.value() || []"
                formControlName="productionStationId"
                optionLabel="partNumber"
                optionValue="id"
                placeholder="Seleccione la estación"
                [filter]="true"
                filterBy="partNumber,line,model"
                appendTo="body"
                styleClass="w-full"
              >
                <ng-template let-station pTemplate="item">
                  <div class="flex flex-col py-1">
                    <span class="font-bold text-surface-900 dark:text-surface-0">{{ station.partNumber }}</span>
                    <small class="text-surface-500 font-medium">{{ station.line }} / {{ station.model }}</small>
                  </div>
                </ng-template>
              </p-select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="productionDatetime" class="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">Fecha de Producción</label>
              <p-datepicker id="productionDatetime" formControlName="productionDatetime" [showTime]="true" [showIcon]="true" appendTo="body" hourFormat="24" styleClass="w-full"></p-datepicker>
            </div>

            <div class="bg-surface-100 dark:bg-surface-800/50 p-4 rounded-xl border border-dashed border-surface-200 dark:border-surface-700 flex flex-col gap-4 mt-2">
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="font-bold text-surface-900 dark:text-surface-0">Habilitar Etiqueta</span>
                  <small class="text-surface-500">¿Sigue vigente en el sistema?</small>
                </div>
                <p-toggleSwitch formControlName="active"></p-toggleSwitch>
              </div>
              <div class="flex items-center justify-between border-t border-surface-200 dark:border-surface-700 pt-3">
                <div class="flex flex-col">
                  <span class="font-bold text-surface-900 dark:text-surface-0">Marcar como Usada</span>
                  <small class="text-surface-500">¿Ya se consumió el material?</small>
                </div>
                <p-toggleSwitch formControlName="used"></p-toggleSwitch>
              </div>
            </div>
          </form>
        </ng-template>

        <ng-template pTemplate="footer">
          <div class="flex gap-3 justify-end pt-2">
            <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="closeDialog()"></p-button>
            <p-button label="Guardar Registro" icon="pi pi-save" [loading]="isSaving" (onClick)="save()" [disabled]="form.invalid" severity="primary" raised></p-button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Modal Previsualización Excel -->
      <p-dialog
        [(visible)]="excelDialogVisible"
        header="Previsualización de Importación"
        [modal]="true"
        [style]="{ width: '90vw', maxWidth: '1000px' }"
        [draggable]="false"
        [resizable]="false"
      >
        <div class="flex flex-col gap-4">
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-500">info</span>
            <div class="text-sm text-blue-700 dark:text-blue-300">
              Se han detectado <strong>{{ excelData().length }}</strong> registros en el archivo. Verifique la información antes de procesar la carga masiva.
            </div>
          </div>

          <div class="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden shadow-sm">
            <p-table [value]="excelData()" [rows]="5" [paginator]="true" size="small" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr class="bg-surface-50 dark:bg-surface-800">
                  <th class="text-xs font-bold uppercase py-3">Orden</th>
                  <th class="text-xs font-bold uppercase py-3">RAN</th>
                  <th class="text-xs font-bold uppercase py-3">Cantidad</th>
                  <th class="text-xs font-bold uppercase py-3">Estación (ID)</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr class="text-sm">
                  <td class="py-2">{{ row.order }}</td>
                  <td class="py-2">{{ row.ran }}</td>
                  <td class="py-2">{{ row.quantity }}</td>
                  <td class="py-2">
                    <span class="font-mono text-xs opacity-60">{{ row.productionStationId }}</span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex gap-3 justify-end pt-2">
            <p-button label="Descartar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="excelDialogVisible = false"></p-button>
            <p-button label="Procesar Carga Masiva" icon="pi pi-upload" [loading]="isSaving" (onClick)="processMassiveImport()" severity="success" raised></p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelControl {
  private readonly labelService = inject(LabelControlManager);
  private readonly stationService = inject(ProductionStationManager);
  private readonly authService = inject(Authentication);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly labels$ = rxResource({
    stream: () => this.labelService.getPaginatedLabelControls(1, 1000).pipe(
      map(res => res.data)
    )
  });

  readonly stations$ = rxResource({
    stream: () => this.stationService.getProductionStations()
  });

  columns: ColumnConfig[] = [
    { key: 'order', label: 'Orden', sortable: true },
    { key: 'ran', label: 'RAN', sortable: true },
    { key: 'quantity', label: 'Cantidad', dataType: 'number', sortable: true },
    { key: 'productionStation', label: 'Estación' },
    { key: 'productionDatetime', label: 'Fecha Prod.', dataType: 'date', sortable: true },
    { key: 'used', label: 'Usada', dataType: 'boolean', sortable: true },
    { key: 'active', label: 'Activa', dataType: 'boolean', sortable: true }
  ];

  form: FormGroup = this.fb.group({
    id: [null],
    active: [true, Validators.required],
    used: [false, Validators.required],
    order: ['', Validators.required],
    ran: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    productionStationId: [null, Validators.required],
    productionDatetime: [new Date(), Validators.required],
    createBy: [''],
    updateBy: ['']
  });

  dialogVisible = false;
  isEditMode = false;
  isSaving = false;

  // Excel logic
  excelDialogVisible = false;
  excelData = signal<LabelControlRequestDto[]>([]);

  onCreate() {
    this.isEditMode = false;
    this.form.reset({
      active: true,
      used: false,
      quantity: 0,
      productionDatetime: new Date(),
      createBy: this.authService.user()?.email || 'System',
      updateBy: this.authService.user()?.email || 'System'
    });
    this.dialogVisible = true;
  }

  onEdit(label: LabelControlResponseDto) {
    this.isEditMode = true;
    this.labelService.getLabelControlById(label.id).subscribe({
      next: (fullLabel) => {
        this.form.patchValue({
          ...fullLabel,
          productionDatetime: new Date(fullLabel.productionDatetime)
        });
        this.dialogVisible = true;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información' })
    });
  }

  save() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const userEmail = this.authService.user()?.email || 'System';
    const payload: LabelControlRequestDto = {
      ...this.form.value,
      productionDatetime: this.form.value.productionDatetime.toISOString(),
      createBy: this.isEditMode ? this.form.value.createBy : userEmail,
      updateBy: userEmail
    };

    const request = this.isEditMode 
      ? this.labelService.updateLabelControl(this.form.value.id, payload)
      : this.labelService.createLabelControl(payload);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Etiqueta ${this.isEditMode ? 'actualizada' : 'creada'} correctamente` });
        this.labels$.reload();
        this.closeDialog();
        this.isSaving = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al guardar' });
        this.isSaving = false;
      }
    });
  }

  closeDialog() {
    this.dialogVisible = false;
    this.isSaving = false;
  }

  downloadTemplate() {
    const templateData = [
      {
        ORDER: 'ORD-001',
        RAN: 'RAN-X01',
        Quantity: 10,
        PartNumber: 'PN-EJEMPLO-01',
        ProductionDatetime: new Date().toISOString()
      },
      {
        ORDER: 'ORD-002',
        RAN: 'RAN-X02',
        Quantity: 25,
        PartNumber: 'PN-EJEMPLO-02',
        ProductionDatetime: new Date().toISOString()
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formato Etiquetas');
    
    // Generar archivo y descargar
    XLSX.writeFile(wb, 'Formato_Carga_Etiquetas.xlsx');
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const stations = this.stations$.value() || [];
        const mappedData: LabelControlRequestDto[] = data.map((item: any) => {
          // Resolve part number from various possible column names
          const excelPartNumber = item.PartNumber || item.partNumber || item.PART_NUMBER || item.PN || '';
          
          // Find matching station by partNumber
          const station = stations.find(s => s.partNumber.trim().toLowerCase() === excelPartNumber.toString().trim().toLowerCase());

          return {
            active: true,
            used: false,
            createBy: this.authService.user()?.email || 'System',
            updateBy: this.authService.user()?.email || 'System',
            order: item.ORDER || item.order || '',
            ran: item.RAN || item.ran || '',
            productionDatetime: item.ProductionDatetime || item.productionDatetime || new Date().toISOString(),
            quantity: item.Quantity || item.quantity || 0,
            productionStationId: station ? station.id : ''
          };
        });

        // Filter out records where station couldn't be resolved (optional, but safer)
        const validData = mappedData.filter(d => d.productionStationId !== '');
        const invalidCount = mappedData.length - validData.length;

        if (invalidCount > 0) {
          this.messageService.add({ 
            severity: 'warn', 
            summary: 'Atención', 
            detail: `Se omitieron ${invalidCount} registros por Número de Parte no reconocido.` 
          });
        }

        this.excelData.set(validData);
        this.excelDialogVisible = true;
        event.target.value = ''; // Reset input
      };
      reader.readAsBinaryString(file);
    }
  }

  processMassiveImport() {
    if (this.excelData().length === 0) return;

    this.isSaving = true;
    this.labelService.createMassiveLabelControl(this.excelData()).subscribe({
      next: (res) => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Carga Exitosa', 
          detail: res.message 
        });
        this.labels$.reload();
        this.excelDialogVisible = false;
        this.isSaving = false;
      },
      error: (err) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error en Carga', 
          detail: 'No se pudieron procesar los registros. Verifique el formato.' 
        });
        this.isSaving = false;
      }
    });
  }
}
