import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DarkThemeService } from '../../../core/services/dark-theme';
import { Authentication } from '../../../modules/auth/services/authentication';

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
	host: {
		class:
			'glass-card fixed z-20 top-4 left-4 w-20 h-[calc(100vh-2.5rem)] rounded-2xl flex flex-col items-center justify-between py-3 transition-all duration-500 ease-in-out',
	},
})
export class SideBar {
	private readonly _authService = inject(Authentication);
	protected items: SideBarItem[] = [
		{ label: 'Admin', icon: 'admin_panel_settings', route: '/admin' },
		{ label: 'Seguridad', icon: 'lock', route: '/security' },
	];

	protected themeService = inject(DarkThemeService);

	toggleDarkMode(): void {
		this.themeService.toggleDarkTheme();
	}

	isSuperAdmin = computed(() => {
		return this._authService.isSuperAdmin();
	});
}
