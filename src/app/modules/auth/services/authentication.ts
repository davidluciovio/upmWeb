import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { environment } from '../../../../environments/environment.development';

const baseUrl = environment.baseUrl;

export interface loginRequest {
	codeUser: string;
	password: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

interface User {
	sub: string;
	email: string;
	name: string;
	'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string[];
	exp: number;
	iss: string;
	aud: string;
}

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({
	providedIn: 'root',
})
export class Authentication {
	readonly TOKEN_KEY = 'token';

	public authStatus = signal<AuthStatus>('checking');
	public token = signal<string | null>(localStorage.getItem('token'));
	public user = signal<User | null>(null);

	protected http = inject(HttpClient);
	protected router = inject(Router);
	protected messageService = inject(MessageService);

	constructor() {
		this.checkAuthStatus();
	}

	public login(request: loginRequest) {
		return this.http.post<{ token: string }>(`${baseUrl}/auth/login-ldap`, request).subscribe({
			next: (response) => {
				localStorage.setItem(this.TOKEN_KEY, response.token);
				this.checkAuthStatus();
				this.router.navigate(['/']);
			},
			error: (error) => {
				console.log(error);
				this.messageService.add({
					severity: 'error',
					summary: 'Error de autenticación',
					detail: 'Usuario o contraseña incorrectos',
				});
			},
		});
	}

	public changePassword(request: ChangePasswordRequest) {
		return this.http.post(`${baseUrl}/auth/change-password`, request);
	}

	private checkAuthStatus(): void {
		if (this.isLoggedIn()) {
			this.token.set(this.getToken());
			this.user.set(this.loadUserFromToken());
			this.authStatus.set('authenticated');
		} else {
			this.logout();
		}
	}

	public getToken(): string | null {
		const token = localStorage.getItem(this.TOKEN_KEY);
		if (!token) return null;
		return token;
	}

	private loadUserFromToken(): User | null {
		const token = this.getToken();
		if (!token) return null;

		try {
			const decodedToken = jwtDecode<User>(token);
			decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] =
				decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
			return decodedToken;
		} catch (e) {
			console.error('Error decoding token:', e);
			return null;
		}
	}

	public logout(): void {
		localStorage.removeItem(this.TOKEN_KEY);
		this.authStatus.set('not-authenticated');
		this.token.set(null);
		this.user.set(null);
		this.router.navigate(['/auth']);
	}

	public isLoggedIn(): boolean {
		const token = this.getToken();
		return !!token && !this.isTokenExpired(token);
	}

	private isTokenExpired(token?: string | null): boolean {
		const tokenToCheck = token ?? this.getToken();
		if (!tokenToCheck) return true;

		try {
			const decodedToken = jwtDecode<JwtPayload>(tokenToCheck);
			if (decodedToken.exp === undefined) return true;

			const currentTime = Math.floor(Date.now() / 1000);
			return decodedToken.exp < currentTime;
		} catch (error) {
			console.error('Error decoding token:', error);
			return true;
		}
	}

	public isSuperAdmin(): boolean {
		const user = this.user();
		if (!user) return false;
		return user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('SuperAdmin');
	}

	public isAdmin(): boolean {
		const user = this.user();
		if (!user) return false;
		return user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('Admin');
	}
}
