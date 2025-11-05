import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';
import { DarkThemeService } from '../../../core/services/dark-theme';

interface SideBarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Button],
  templateUrl: './side-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-fit' }
})
export class SideBar {
  protected items: SideBarItem[] = [
    { label: 'Inicio', icon: 'home', route: '/' },
    { label: 'Perfil', icon: 'person', route: '/df' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin' },
    { label: 'CP', icon: 'forklift', route: '/production_control' },
  ];

  isDarkMode: boolean = false;

  private themeService = inject(DarkThemeService);

  constructor() {
    this.isDarkMode = document.body.classList.contains('dark-theme') ? true : false;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.tooggleDarkTheme(this.isDarkMode);
  }
}
