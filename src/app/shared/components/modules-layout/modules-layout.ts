import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface ModuleItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'modules-layout',
  imports: [RouterLink],
  templateUrl: './modules-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'}
})
export class ModulesLayout {
  public modules = input.required<ModuleItem[]>();

 }
