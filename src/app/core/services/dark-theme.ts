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
	themeSignal = signal<string>('light');

	constructor() {
		this.isDarkMode.set(localStorage.getItem(this.THEME_KEY) === 'true' ? true : false);
		this.tooggleDarkTheme();

		// Solo ejecutamos lógica de localStorage en el navegador (Evita errores SSR)
		if (isPlatformBrowser(this.platformId)) {
			const savedTheme = localStorage.getItem('user-theme') || 'light';
			this.themeSignal.set(savedTheme);
		}

		// 2. Usamos un EFFECT.
		// Cada vez que themeSignal cambie, este código se ejecuta automáticamente.
		effect(() => {
			const currentTheme = this.themeSignal();

			// Actualizamos el atributo HTML para que DaisyUI 5 reaccione
			this.document.documentElement.setAttribute('data-theme', currentTheme);

			// Guardamos persistencia
			if (isPlatformBrowser(this.platformId)) {
				localStorage.setItem('user-theme', currentTheme);
			}
		});
	}

	tooggleDarkTheme(): void {
		if (this.isDarkMode()) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}

		localStorage.setItem(this.THEME_KEY, this.isDarkMode().toString());

		this.themeSignal.update(current => (current === 'nord' ? 'business' : 'nord'));
	}
}
