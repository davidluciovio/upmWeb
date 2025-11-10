import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ModuleItem,
  ModulesLayout,
} from '../../../shared/components/modules-layout/modules-layout';

@Component({
  selector: 'app-assembly-production-layout',
  standalone: true,
  imports: [ModulesLayout],
  template: ` <modules-layout [modules]="items"></modules-layout> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssemblyProductionLayout {
  items: ModuleItem[] = [
    { label: 'Managment', icon: 'settings_applications', route: 'managment' },
    { label: 'Supervisor', icon: 'folder_supervised', route: 'supervisor-alert' },
  ];
}
