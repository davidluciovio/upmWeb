import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModuleItem } from '../../../../shared/components/modules-layout/modules-layout';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-managment-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-row w-full h-full gap-2',
  },
})
export class ManagmentPage {
  itemsMenu: ModuleItem[] = [
    { label: 'Modelos', icon: 'settings_applications', route: 'model' },
    { label: 'Números de Parte', icon: 'settings_applications', route: 'part_number' },
  ];
}
