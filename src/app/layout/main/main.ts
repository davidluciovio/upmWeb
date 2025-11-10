import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SideBar } from "../../shared/components/side-bar/side-bar";
import { NavBar } from "../../shared/components/nav-bar/nav-bar";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [SideBar, NavBar, RouterOutlet, CommonModule],
  templateUrl: './main.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {
  HiddenSideBar = signal<boolean>(false);

  constructor() { }

  toggleSideBar() {
    this.HiddenSideBar.update(value => !value);
  }
 }
