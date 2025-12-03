import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DarkThemeService } from '../../../core/services/dark-theme';

interface SideBarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fixed z-20 top-2 left-2 w-20 h-[calc(100vh-16px)] bg-base-200 border border-base-300 rounded-lg flex flex-col items-center justify-between' }
})
export class SideBar {
  protected items: SideBarItem[] = [
    { label: 'Inicio', icon: 'home', route: '/' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin' },
    { label: 'Seguridad', icon: 'lock', route: '/security' },
    { label: 'CP', icon: 'forklift', route: '/production_control' },
    { label: 'Captura', icon: 'avg_time', route: '/capture-production' },
    { label: 'Producción Ensamble', icon: 'inventory', route: '/assembly_production' },
  ];

  protected themeService = inject(DarkThemeService);

  toggleDarkMode(): void {
    this.themeService.isDarkMode.update(value => !value);
    this.themeService.tooggleDarkTheme();
  }
}
