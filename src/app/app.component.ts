import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./shared/navBar/navBar.component";
import { SideBarComponent } from "./shared/sideBar/sideBar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'unipresSystemWeb';
}
