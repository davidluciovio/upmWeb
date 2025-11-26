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
        @if (item.label === 'separador') {
          <hr class="text-base-300"/>
        } @else {
          <li class="menu-item font-semibold">
            <a [routerLink]="item.route" [routerLinkActive]="'dmenu-active'">{{ item.label }}</a>
          </li>
        }
      }
    </ul>
    <section class="w-full">
      <router-outlet></router-outlet>
    </section>
  `,
  host: {
    class: 'flex flex-row w-full h-full gap-6',
  },
})
export class AdminLayout implements OnInit {
  protected itemsMenu: ModuleItem[] = [
    { label: 'Modelos', icon: 'settings_applications', route: 'model' },
    { label: 'Areas', icon: '', route: 'area' },
    { label: 'Ubicaciones', icon: '', route: 'location' },
    { label: 'separador', icon: '', route: '' },
    { label: 'Números de Parte', icon: 'settings_applications', route: 'part-number' },
    { label: 'separador', icon: '', route: '' },
    { label: 'Números de Parte - Area', icon: 'settings_applications', route: 'part-number-area' },
  ];

  constructor() {}

  ngOnInit() {}
}
