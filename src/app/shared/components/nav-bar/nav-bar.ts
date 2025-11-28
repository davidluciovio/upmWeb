import { ChangeDetectionStrategy, Component, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Authentication } from '../../../modules/auth/services/authentication';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'nav-bar',
	imports: [CommonModule],
	templateUrl: './nav-bar.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: ' sticky z-10 top-0 w-full bg-base-200 border border-base-300 w-full rounded-lg flex flex-row p-2' },
})
export class NavBar {
	private readonly router = inject(Router);
	private readonly authentication = inject(Authentication);

	public isLoggedIn = computed(() => this.authentication.authStatus() === 'authenticated');
	public userData = computed(() => this.authentication.user());

	HiddenSideBar = output<boolean>();
	isHiddenSideBar: boolean = false;

	constructor() {}

	toogleSideBar(): void {
		this.isHiddenSideBar = !this.isHiddenSideBar;
		this.HiddenSideBar.emit(this.isHiddenSideBar);
	}

	goToLogin(): void {
		this.router.navigate(['/login']);
	}

	logout(): void {
		this.authentication.logout();
		this.router.navigate(['/login']);
	}

	goToChangePassword(): void {
		this.router.navigate(['/change-password']);
	}
}
