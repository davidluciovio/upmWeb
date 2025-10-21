import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SideBar } from "./shared/components/side-bar/side-bar";

@Component({
  selector: 'app-root',
  imports: [ButtonModule, RouterOutlet, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('unipresSystemWeb_SGAAC');
  
}
