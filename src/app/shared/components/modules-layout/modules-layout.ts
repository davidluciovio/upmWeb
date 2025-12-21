import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface ModuleItem {
  label: string;
  icon: string;
  route: string;
  subLabel?: string;
}

@Component({
  selector: 'modules-layout',
  imports: [RouterLink],
  templateUrl: './modules-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-2 hover:px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 hover:gap-12 transition-all duration-300 ease-in-out '}
})
export class ModulesLayout {
  public modules = input.required<ModuleItem[]>();

 }
