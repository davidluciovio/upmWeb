import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ColumnConfig, TableCrud } from '../../../../../shared/components/table-crud/table-crud';
import { LocationInterface, LocationManagerService } from '../services/location-manager';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authentication } from '../../../../auth/services/authentication';

@Component({
  selector: 'app-location-managment',
  standalone: true,
  imports: [TableCrud, CommonModule, ReactiveFormsModule],
  templateUrl: './location-managment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationManagment {
  private readonly locationService = inject(LocationManagerService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Authentication);

  readonly location$ = rxResource({
    stream: () =>
      this.locationService.getLocations().pipe(
        map((locations) => {
          return locations;
        }),
      ),
  });

  form: FormGroup = this.fb.group({
    id: [0],
    active: ['false', Validators.required],
    createDate: [''],
    createBy: ['Leonardo', Validators.required],
    locationDescription: ['', Validators.required],
  });

  isEditMode = false;
  selectedLocationId: number | null = null;

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'active', label: 'Activo', dataType: 'boolean' },
    { key: 'createDate', label: 'Fecha de Creación', dataType: 'date' },
    { key: 'createBy', label: 'Creado Por' },
    { key: 'locationDescription', label: 'Nombre de la Ubicación' },
  ];

  openModal() {
    const modal = document.getElementById('location_modal') as HTMLDialogElement;
    modal.showModal();
  }

  closeModal() {
    const modal = document.getElementById('location_modal') as HTMLDialogElement;
    modal.close();
  }

  deleteLocation(event: LocationInterface) {
    this.locationService.deleteLocation(event.id).subscribe(() => {
      this.location$.reload();
    });
  }

  editLocation(event: LocationInterface) {
    this.isEditMode = true;
    this.selectedLocationId = event.id;
    this.form.patchValue(event);
    this.openModal();
  }

  createLocation() {
    this.isEditMode = false;
    const user = this.authService.user();
    if (user) {
      this.form.patchValue({ createBy: user.email });
    } else {
      this.form.patchValue({ createBy: 'Leonardo' });
    }
    this.openModal();
  }

  save() {
    if (this.form.valid) {
      const locationData: LocationInterface = this.form.value;
      locationData.createBy = this.authService.user()?.email || 'Leonardo';

      if (this.isEditMode && this.selectedLocationId) {
        this.locationService.updateLocation(locationData).subscribe(() => {
          this.location$.reload();
          this.closeModal();
        });
      } else {
        this.locationService.createLocation(locationData).subscribe(() => {
          this.location$.reload();
          this.closeModal();
        });
      }
    }
  }
}
