import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { ModuleItem } from "../../../shared/components/modules-layout/modules-layout";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-security-layout',
	standalone: true,
    imports: [RouterOutlet, CommonModule, RouterModule],
    template: `
    <ul
			class="dmenu dmenu-horizontal dmenu-md lg:h-auto lg:dmenu-vertical bg-base-200 border border-base-300 rounded-lg w-full lg:w-72 gap-1 animate-fade-in-up"
		>
			@for (item of itemsMenu; track item.label) {
				@if (item.label === 'separador') {
					<hr class="text-base-300 hidden lg:block" />
				} @else {
					<li class="menu-item font-semibold">
						<a [routerLink]="item.route" [routerLinkActive]="'dmenu-active'">{{ item.label }}</a>
					</li>
				}
			}
		</ul>
		<section class="w-full">
			<router-outlet></router-outlet>
		</section>
    `,
	host: {
		class: 'flex flex-col lg:flex-row w-full h-full gap-4',
	},
})
export class SecurityLayout {
    protected itemsMenu: ModuleItem[] = [
            { label: 'Usuarios', icon: 'settings_applications', route: 'users' },
            { label: 'Roles', icon: 'settings_applications', route: 'roles' },
			{ label: 'Modulos', icon: 'settings_applications', route: 'modules' },
			{ label: 'Submodulos', icon: 'settings_applications', route: 'submodules' },
            { label: 'Permisos', icon: 'settings_applications', route: 'permissions' },
        ];
    constructor() { }
}