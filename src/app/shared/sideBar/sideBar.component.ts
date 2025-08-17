import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { routes } from '../../app.routes';
import { ModuleServiceService } from '../../core/services/moduleService.service';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './sideBar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  private _moduleService = inject(ModuleServiceService);
  private _themeService = inject(ThemeService);
  //
  //
  public Modules = computed(() => this._moduleService.getModules());
  //
  public toggleTheme: boolean = false;
  //
  //
  constructor() {}
  //
  //
  clicToggleThemeButton() {
    this._themeService.toggleTheme();
    this.toggleTheme = !this.toggleTheme;
  }
}
