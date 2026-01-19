import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class DarkThemeService {
	readonly THEME_KEY = 'dark-theme';
	isDarkMode = signal(false);

	// Inyección de dependencias moderna
	private document = inject(DOCUMENT);
	private platformId = inject(PLATFORM_ID);

	// 1. Creamos un Signal para el estado. Default: 'light'
	themeSignal = signal<string>('nord');

	constructor() {
		// Inicialización correcta
		if (isPlatformBrowser(this.platformId)) {
			const savedIsDark = localStorage.getItem(this.THEME_KEY) === 'true';
			this.isDarkMode.set(savedIsDark);
			// this.themeSignal.set(savedIsDark ? 'dark' : 'nord');
		}

		// 2. Usamos un EFFECT.
		// Cada vez que los signals cambien, este código se ejecuta automáticamente.
		effect(() => {
			const currentTheme = this.themeSignal();
			const isDark = this.isDarkMode();

			// Actualizamos el atributo HTML para que DaisyUI 5 reaccione
			this.document.documentElement.setAttribute('data-theme', currentTheme);

			// Actualizamos la clase para PrimeNG
			if (isDark) {
				this.document.documentElement.classList.add('dark-mode');
			} else {
				this.document.documentElement.classList.remove('dark-mode');
			}

			// Guardamos persistencia
			if (isPlatformBrowser(this.platformId)) {
				localStorage.setItem('user-theme', currentTheme);
				localStorage.setItem(this.THEME_KEY, String(isDark));
			}
		});
	}

	toggleDarkTheme(): void {
		this.isDarkMode.update((v) => !v);
		// this.themeSignal.update((current) => (current === 'nord' ? 'dark' : 'nord'));
	}
}
