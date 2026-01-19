import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';

// Servicios
import { Authentication } from '../../../auth/services/authentication';
import { DowntimeManager, DowntimeRequestInterface, DowntimeResponseInterface } from '../../services/downtime-manager';

// Componentes Compartidos
import { ColumnConfig, TableCrud } from '../../../../shared/components/table-crud/table-crud';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // O ToggleSwitchModule en v18
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-downtime-managment',
    standalone: true, // Asumo que es standalone
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        TableCrud,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ToggleSwitchModule,
        ProgressSpinnerModule,
        RippleModule
    ],
    templateUrl: './downtime-managment.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeManagment {
    private readonly downtimeService = inject(DowntimeManager);
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(Authentication);

    // Control del Modal (Signal o variable simple)
    dialogVisible = false;

    readonly downtimes$ = rxResource({
        stream: () =>
            this.downtimeService.getDowntimes().pipe(
                map((downtimes) => {
                    return downtimes.sort((a, b) => a.downtimeDescription.localeCompare(b.downtimeDescription));
                }),
            ),
    });

    form: FormGroup = this.fb.group({
        id: [{ value: '', disabled: true }], // Deshabilitado desde la config del form
        active: [false],
        downtimeDescription: ['', Validators.required],
        inforCode: ['', Validators.required],
        plcCode: ['', Validators.required],
        isDirectDowntime: [false],
        programable: [false],
        createBy: [''],
    });

    isEditMode = false;
    selectedDowntimeId: string | null = null;

    columns: ColumnConfig[] = [
        { key: 'active', label: 'Activo', dataType: 'boolean', active: true },
        { key: 'downtimeDescription', label: 'Descripción', active: true },
        { key: 'inforCode', label: 'Código Infor', active: true },
        { key: 'plcCode', label: 'Código PLC', active: true },
        { key: 'isDirectDowntime', label: 'Directo', dataType: 'boolean', active: true },
        { key: 'programable', label: 'Programable', dataType: 'boolean', active: true },
    ];

    // --- Lógica del Modal ---

    openModal() {
        this.dialogVisible = true;
    }

    closeModal() {
        this.dialogVisible = false;
    }

    // --- CRUD ---

    deleteDowntime(event: DowntimeResponseInterface) {
        // Podrías agregar un ConfirmDialog aquí antes de borrar
        this.downtimeService.deleteDowntime(event.id).subscribe(() => {
            this.downtimes$.reload();
        });
    }

    editDowntime(event: DowntimeResponseInterface) {
        this.isEditMode = true;
        this.selectedDowntimeId = event.id;
        this.form.patchValue(event);
        this.openModal();
    }

    createDowntime() {
        this.isEditMode = false;
        this.selectedDowntimeId = null;
        this.form.reset();
        
        const user = this.authService.user();
        this.form.patchValue({
            createBy: user ? user.email : 'System',
            active: true,
            isDirectDowntime: false,
            programable: false,
        });
        
        this.openModal();
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched(); // Mostrar errores si hay
            return;
        }

        const formData = this.form.getRawValue();
        const userEmail = this.authService.user()?.email || 'System';

        if (this.isEditMode && this.selectedDowntimeId) {
            const updateData: DowntimeResponseInterface = {
                ...formData,
                id: this.selectedDowntimeId,
                createBy: userEmail,
            };
            this.downtimeService.updateDowntime(updateData).subscribe(() => {
                this.downtimes$.reload();
                this.closeModal();
            });
        } else {
            const createData: DowntimeRequestInterface = {
                downtimeDescription: formData.downtimeDescription,
                inforCode: formData.inforCode,
                plcCode: formData.plcCode,
                isDirectDowntime: formData.isDirectDowntime,
                programable: formData.programable,
                createBy: userEmail,
            };
            this.downtimeService.createDowntime(createData).subscribe(() => {
                this.downtimes$.reload();
                this.closeModal();
            });
        }
    }
}