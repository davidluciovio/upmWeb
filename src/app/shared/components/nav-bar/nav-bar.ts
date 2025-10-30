import { ChangeDetectionStrategy, Component, Output, EventEmitter, output, inject, computed } from '@angular/core';
import { Button } from 'primeng/button';
import {  SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { updatePrimaryPalette } from '@primeuix/themes';
import { Router } from '@angular/router';
import { Authentication } from '../../../modules/auth/services/authentication';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { TieredMenu } from "primeng/tieredmenu";
@Component({
  selector: 'nav-bar',
  imports: [Button, SelectModule, FormsModule, SplitButtonModule, TieredMenu],
  templateUrl: './nav-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'w-full bg-gray-200 w-full rounded-lg flex flex-row dark:bg-gray-900 p-1' }
})
export class NavBar {
  private router = inject(Router);
  private authentication = inject(Authentication);

  public isLoggedIn = computed(() => this.authentication.authStatus() === 'authenticated');
  public userData = computed(() => this.authentication.user());
  
  onHiddenSideBar = output<boolean>();
  isHiddenSideBar: boolean = false;

  itemsButtonLogout: MenuItem[] = [
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      command: () => {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }
    }
  ];

  constructor() {}

  toogleSideBar(): void {
    this.isHiddenSideBar = !this.isHiddenSideBar;
    this.onHiddenSideBar.emit(this.isHiddenSideBar);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  

}
