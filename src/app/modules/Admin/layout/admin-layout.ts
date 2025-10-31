import { Component, OnInit } from '@angular/core';
import { ModuleItem, ModulesLayout } from '../../../shared/components/modules-layout/modules-layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'selector-name',
  imports: [ModulesLayout, RouterOutlet],
  template: `<modules-layout [modules]="items"></modules-layout> <router-outlet></router-outlet>`,
})
export class AdminLayout implements OnInit {
  protected items: ModuleItem[] = [
    { label: 'Gestion de modelos', icon: 'category', route: 'model-manager' },

  ];
  constructor() {}

  ngOnInit() {}
}
