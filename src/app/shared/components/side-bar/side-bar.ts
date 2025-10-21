import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from "primeng/button";

interface SideBarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Button],
  templateUrl: './side-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class SideBar {
  protected items: SideBarItem[] = [
    { label: 'Inicio', icon: 'home', route: '/home' },
    { label: 'Perfil', icon: 'person', route: '/profile' },
  ];

  constructor() {}
}
