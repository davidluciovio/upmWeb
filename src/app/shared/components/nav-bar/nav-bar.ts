import { ChangeDetectionStrategy, Component, output, inject, computed } from '@angular/core';
import { Button } from 'primeng/button';
import {  SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
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
  host: { class: ' sticky z-10 top-0 w-full bg-base-200 border border-base-300 w-full rounded-lg flex flex-row p-2' }
})
export class NavBar {
  private readonly router = inject(Router);
  private readonly authentication = inject(Authentication);

  public isLoggedIn = computed(() => this.authentication.authStatus() === 'authenticated');
  public userData = computed(() => this.authentication.user());

  HiddenSideBar = output<boolean>();
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
    this.HiddenSideBar.emit(this.isHiddenSideBar);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }


}
