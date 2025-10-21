import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkThemeService {
  readonly THEME_KEY = 'dark-theme';
  isDarkMode = signal(false);

  constructor() { 
    this.isDarkMode.set(localStorage.getItem(this.THEME_KEY) === 'true' ? true : false);
    this.tooggleDarkTheme(this.isDarkMode());
  }

  tooggleDarkTheme(isDarkMode: boolean): void {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    localStorage.setItem(this.THEME_KEY, isDarkMode.toString());
  }

}
