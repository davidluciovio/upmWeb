import { ChangeDetectionStrategy, Component, output, inject, computed, input, OnInit, effect, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Authentication } from '../../../modules/auth/services/authentication';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs';
import { Button } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';

@Component({
	selector: 'nav-bar',
	imports: [CommonModule, Button, SplitButton],
	templateUrl: './nav-bar.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {},
})
export class NavBar implements OnInit {
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);
	private readonly authentication = inject(Authentication);

	public pageTitle = signal<string>('');
	public isLoggedIn = computed(() => this.authentication.authStatus() === 'authenticated');
	public userData = computed(() => this.authentication.user());

	isHiddenSideBar = input<boolean>(false);
	onToggleSideBar = output<boolean>();

	public userMenuItems = computed<MenuItem[]>(() => [
		{
			label: 'Cambiar Contraseña',
			icon: 'pi pi-lock',
			command: () => this.goToChangePassword(),
		},
		{
			separator: true,
		},
		{
			label: 'Cerrar Sesión',
			icon: 'pi pi-power-off',
			command: () => this.logout(),
		},
	]);

	constructor() {}

	ngOnInit(): void {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				map(() => {
					let child = this.route.firstChild;
					while (child?.firstChild) {
						child = child.firstChild;
					}
					return child?.snapshot.title || '';
				}),
			)
			.subscribe((title: string) => {
				this.pageTitle.set(title !== 'Dashboard' ? title : 'Bienvenido a ');
			});
	}

	toogleSideBar(): void {
		this.onToggleSideBar.emit(!this.isHiddenSideBar());
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
