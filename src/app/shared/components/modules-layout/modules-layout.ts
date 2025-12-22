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
  host: { class: 'px-2 flex flex-wrap gap-4 hover:gap-8 transition-all duration-300 ease-in-out '}
})
export class ModulesLayout {
  public modules = input.required<ModuleItem[]>();

 }
