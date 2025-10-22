import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Button } from "primeng/button";

@Component({
  selector: 'nav-bar',
  imports: [Button],
  templateUrl: './nav-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar {

  onHiddenSideBar = output<boolean>();
  isHiddenSideBar: boolean = false;

  toogleSideBar(): void {
    this.isHiddenSideBar = !this.isHiddenSideBar;
    this.onHiddenSideBar.emit(this.isHiddenSideBar);
  }
 }
