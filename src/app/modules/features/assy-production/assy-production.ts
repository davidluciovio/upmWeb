import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
  selector: 'app-assy-production',
  imports: [ModulesLayout],
  template: `<modules-layout [modules]="items"></modules-layout>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssyProduction {
  protected items: ModuleItem[] = [
      { label: 'CAPTURA DE TIEMPOS DE PARO', subLabel: 'CAPTURA DE TIEMPOS DE PARO', icon: 'dashboard', route: 'downtime-capture' },
    ];
 }
