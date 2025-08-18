import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ModuleServiceService } from '../../core/services/moduleService.service';
import { routes } from '../../app.routes';
import { RouterLink, Routes } from '@angular/router';

@Component({
  selector: 'upm-modules',
  imports: [RouterLink],
  templateUrl: './modules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulesComponent {
  public Routes = input.required<Routes>()
  private _moduleService = inject(ModuleServiceService);
  //
  //
  public Modules = computed(() => this._moduleService.getSystemModules(this.Routes()));
  //
  //
 }
