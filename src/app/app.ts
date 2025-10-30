import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SideBar } from "./shared/components/side-bar/side-bar";
import { NavBar } from "./shared/components/nav-bar/nav-bar";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, RouterOutlet, SideBar, NavBar, CommonModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('unipresSystemWeb_SGAAC');
  
  HiddenSideBar = signal<boolean>(true);

  constructor() { }

  toggleSideBar() {
    this.HiddenSideBar.update(value => !value);
  }
}
