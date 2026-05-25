import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';
import { UserRole } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly emailKey = 'userEmail';
  private readonly rolesKey = 'roles';
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      map((response) => this.storeSession(response, credentials.email))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.rolesKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getUserEmail(): string {
    return localStorage.getItem(this.emailKey) || 'User';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRoles(): UserRole[] {
    const storedRoles = localStorage.getItem(this.rolesKey);

    if (storedRoles) {
      const roles = JSON.parse(storedRoles) as UserRole[];
      if (roles.length > 0) {
        return roles;
      }
    }

    const token = this.getToken();
    const roles = token ? this.decodeToken(token).roles : [];

    if (roles.length > 0) {
      localStorage.setItem(this.rolesKey, JSON.stringify(roles));
    }

    return roles;
  }

  hasAnyRole(allowedRoles: UserRole[]): boolean {
    if (allowedRoles.length === 0) {
      return true;
    }

    const userRoles = this.getRoles();
    return allowedRoles.some((role) => userRoles.includes(role));
  }

  private storeSession(response: LoginResponse, fallbackEmail: string): AuthUser {
    const token = response.token || response.accessToken || response.jwt;

    if (!token) {
      throw new Error('Token JWT manquant dans la reponse backend.');
    }

    const decoded = this.decodeToken(token);
    const responseRoles = this.normalizeRoles(response.roles || response.authorities || []);
    const singleRole = response.role ? this.normalizeRoles(response.role) : [];
    const roles = responseRoles.length > 0
      ? responseRoles
      : singleRole.length > 0
        ? singleRole
        : decoded.roles;
    const email = response.email || response.username || decoded.email || fallbackEmail;

    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.emailKey, email);
    localStorage.setItem(this.rolesKey, JSON.stringify(roles));

    return { email, roles, token };
  }

  private decodeToken(token: string): { email: string; roles: UserRole[]; exp?: number } {
    try {
      const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1]));
      const rawRoles = payload.roles || payload.authorities || payload.role || payload.scope || payload.scp || [];

      return {
        email: payload.sub || payload.email || '',
        roles: this.normalizeRoles(rawRoles),
        exp: payload.exp
      };
    } catch {
      return { email: '', roles: [] };
    }
  }

  private normalizeRoles(rawRoles: unknown): UserRole[] {
    const allowedRoles: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN_ENTREPRISE',
      'MANAGER',
      'CAISSIER',
      'STOCK_MANAGER',
      'COMPTABLE'
    ];

    const values = this.extractRoleValues(rawRoles)
      .flatMap((role) => role.split(/[,\s]+/))
      .map((role) => role.trim().replace(/^ROLE_/i, '').toUpperCase())
      .map((role) => role === 'GESTIONNAIRE_STOCK' ? 'STOCK_MANAGER' : role)
      .filter((role): role is UserRole => allowedRoles.includes(role as UserRole));

    return Array.from(new Set(values));
  }

  private extractRoleValues(rawRoles: unknown): string[] {
    if (!rawRoles) {
      return [];
    }

    if (Array.isArray(rawRoles)) {
      return rawRoles.flatMap((role) => this.extractRoleValues(role));
    }

    if (typeof rawRoles === 'string') {
      return [rawRoles];
    }

    if (typeof rawRoles === 'object') {
      const roleObject = rawRoles as Record<string, unknown>;
      return [
        roleObject['authority'],
        roleObject['nom'],
        roleObject['name'],
        roleObject['role'],
        roleObject['libelle']
      ].flatMap((value) => this.extractRoleValues(value));
    }

    return [];
  }

  private decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    return atob(base64 + padding);
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);

    if (!decoded.exp) {
      return false;
    }

    return decoded.exp * 1000 <= Date.now();
  }
}
