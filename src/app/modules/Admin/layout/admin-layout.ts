import { Component, OnInit } from '@angular/core';
import {
  ModuleItem,
  ModulesLayout,
} from '../../../shared/components/modules-layout/modules-layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'selector-name',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ul class="dmenu bg-base-200 border border-base-300 rounded-lg w-48 h-fit flex flex-col gap-1">
      @for (item of itemsMenu; track item.label) {
        <li class="menu-item font-semibold">
          <a [routerLink]="item.route" [routerLinkActive]="'dmenu-active'">{{ item.label }}</a>
        </li>
      }
    </ul>
    <section class="w-full">
      <router-outlet></router-outlet>
    </section>
  `,
})
export class AdminLayout implements OnInit {
  protected itemsMenu: ModuleItem[] = [
    { label: 'Modelos', icon: 'settings_applications', route: 'model' },
    { label: 'Números de Parte', icon: 'settings_applications', route: 'part_number' },
  ];

  constructor() {}

  ngOnInit() {}
}
