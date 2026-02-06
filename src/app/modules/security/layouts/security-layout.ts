import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

// PrimeNG Imports
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';

@Component({
	selector: 'app-security-layout',
	standalone: true,
	imports: [CommonModule, RouterOutlet, MenuModule, RouterModule, RippleModule],
	template: `
		<aside
			class="p-2 w-full lg:w-72 animate-fade-in-up bg-surface-200 dark:bg-surface-900 shadow-sm rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
		>
			<p-menu [model]="itemsMenu" styleClass="w-full border-none bg-transparent">
				<ng-template pTemplate="item" let-item>
					<a
						[routerLink]="item.routerLink"
						class="p-menuitem-link flex align-items-center gap-3 py-3 px-3 border-round-md 
							  transition-colors transition-duration-150 p-ripple no-underline cursor-pointer
							  text-color-secondary hover:text-color hover:bg-surface-100 dark:hover:bg-surface-800"
						[routerLinkActive]="'bg-primary-50 text-primary font-bold dark:bg-primary-500/20 dark:text-primary-400'"
						[routerLinkActiveOptions]="{ exact: false }"
					>
						<span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
						<span class="font-medium">{{ item.label }}</span>
						<span pRipple></span>
					</a>
				</ng-template>
			</p-menu>
		</aside>

		<section class="w-full min-w-0">
			<router-outlet></router-outlet>
		</section>
	`,
	host: {
		class: 'flex flex-col lg:flex-row w-full h-full gap-4',
	},
	encapsulation: ViewEncapsulation.None,
	styles: [
		`
			.p-menu .p-submenu-header {
				background: transparent !important;
				font-size: 0.75rem;
				font-weight: 700;
				color: var(--surface-500);
				padding: 1rem 0.5rem 0.5rem 1rem;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}
			.p-menu {
				padding: 0 !important;
			}
		`,
	],
})
export class SecurityLayout implements OnInit {
	itemsMenu: MenuItem[] = [
		{
			label: 'Gestión de Acceso',
			items: [
				{ label: 'Roles', icon: 'admin_panel_settings', routerLink: 'roles' },
				{ label: 'Usuarios', icon: 'person', routerLink: 'users' },
			],
		},
		{
			label: 'Sistema',
			items: [
				{ label: 'Módulos', icon: 'view_module', routerLink: 'modules' },
				{ label: 'Submódulos', icon: 'view_list', routerLink: 'submodules' },
				{ label: 'Permisos', icon: 'vpn_key', routerLink: 'permissions' },
			],
		},
		{
			label: 'Permisos por Rol',
			items: [{ label: 'Permisos por Rol', icon: 'vpn_key', routerLink: 'role-permissions' }],
		},
	];

	constructor() {}

	ngOnInit() {}
}
