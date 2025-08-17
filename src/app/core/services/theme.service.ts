import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_KEY = 'appTheme';

  constructor() {
    this._loadTheme();
  }

  toggleTheme(): void {
    document.documentElement.classList.toggle('dark');
    this._saveTheme(this.getTheme());
  }

  setTheme(theme: string): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this._saveTheme(theme);
  }

  getTheme(): string {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  private _saveTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private _loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Default to light theme if no theme is saved
      this.setTheme('light');
    }
  }
}
