import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeModeService {

  private readonly THEME_KEY = 'appTheme';
  public IsDarkTheme = signal<boolean>(this.getTheme() === 'dark');
  constructor() {
    this._loadTheme();
  }

  toggleTheme(): void {
    document.documentElement.classList.toggle('dark');
    const theme = this.getTheme();
    if (theme === 'dark') {
      this.IsDarkTheme.set(true);
    } else {
      this.IsDarkTheme.set(false);
    }
    console.log(this.IsDarkTheme());

    this._saveTheme(theme);

  }

  setTheme(theme: string): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      this.IsDarkTheme.set(true);

    } else {
      document.documentElement.classList.remove('dark');
      this.IsDarkTheme.set(false);
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
