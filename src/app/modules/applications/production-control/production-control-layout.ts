import { Component, OnInit } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';

@Component({
  selector: 'selector-name',
  imports: [ModulesLayout],
  template: `<modules-layout [modules]="items"></modules-layout>`,
  host: { class: 'p-0 m-0' },
})
export class productionControlLayout implements OnInit {
  protected items: ModuleItem[] = [
    { label: 'Alertas de Material', icon: 'e911_emergency', route: 'component-alert' },
    { label: 'Supervisor', icon: 'folder_supervised', route: 'supervisor-alert' },

  ];
  constructor() {}

  ngOnInit() {}
}
