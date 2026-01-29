import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideBar } from '../../../shared/components/side-bar/side-bar';
import { NavBar } from '../../../shared/components/nav-bar/nav-bar';

@Component({
	selector: 'app-main',
	imports: [SideBar, NavBar, RouterOutlet, CommonModule],
	templateUrl: './main.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {
	HiddenSideBar = signal<boolean>(false);

	constructor() {}

	toggleSideBar(value: boolean) {
		this.HiddenSideBar.set(value);
	}
}
