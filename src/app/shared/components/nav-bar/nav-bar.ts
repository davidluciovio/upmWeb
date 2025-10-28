import { ChangeDetectionStrategy, Component, Output, EventEmitter, output, inject } from '@angular/core';
import { Button } from 'primeng/button';
import {  SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { updatePrimaryPalette } from '@primeuix/themes';
import { Router } from '@angular/router';
@Component({
  selector: 'nav-bar',
  imports: [Button, SelectModule, FormsModule],
  templateUrl: './nav-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {
  private router = inject(Router);
  
  onHiddenSideBar = output<boolean>();
  isHiddenSideBar: boolean = false;

  // Nuevas propiedades para controlar las paletas
  public colorNames: string[] = [
    'indigo',
    'blue',
    'teal',
    'green',
    'purple',
    'pink',
    'orange',
    'amber',
    'cyan',
    'lime',
  ];
  // opciones compatibles con p-select
  public colorOptions = this.colorNames.map(c => ({ label: c, value: c }));
  public selectedColor: string | null = null;

  private shades: number[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  private currentPaletteIndex: number = 0;

  constructor() {}

  toogleSideBar(): void {
    this.isHiddenSideBar = !this.isHiddenSideBar;
    this.onHiddenSideBar.emit(this.isHiddenSideBar);
  }

  // Método auxiliar que genera el objeto de paleta para updatePrimaryPalette
  private buildPalette(name: string): Record<string, string> {
    return this.shades.reduce((acc, s) => {
      acc[String(s)] = `{${name}.${s}}`;
      return acc;
    }, {} as Record<string, string>);
  }

  // Método para alternar entre todas las paletas definidas.
  // Si se pasa un nombre lo aplicará directamente; si no, avanza a la siguiente paleta.
  public changePrimaryColor(nextName?: string | null): void {
    const name = nextName ?? this.colorNames[this.currentPaletteIndex];
    if (!name) return; // protege contra null/undefined
    updatePrimaryPalette(this.buildPalette(name) as any);
    this.selectedColor = name;
    if (!nextName) {
      this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.colorNames.length;
    } else {
      const idx = this.colorNames.indexOf(nextName);
      if (idx >= 0) this.currentPaletteIndex = (idx + 1) % this.colorNames.length;
    }
  }
}
