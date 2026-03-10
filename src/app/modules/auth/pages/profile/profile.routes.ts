import { Routes } from '@angular/router';
import { Profile } from './profile';

export const PROFILE_ROUTES: Routes = [
	{
		path: '',
		title: 'Mi Perfil',
		component: Profile,
	},
];

export default PROFILE_ROUTES;
