import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserRole } from '../../models/role.model';
import { AuthService } from '../../services/auth.service';

export interface PermissionResponse {
  canAccess: boolean;
  canModify: boolean;
  allowedActions: string[];
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  // Matrice des permissions basée sur les rôles JWT
  private readonly PERMISSIONS = {
    entreprises: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE'],
    produits: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'CAISSIER', 'STOCK_MANAGER'],
    utilisateurs: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE'],
    categories: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'CAISSIER', 'STOCK_MANAGER', 'COMPTABLE'],
    taxes: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'CAISSIER', 'STOCK_MANAGER', 'COMPTABLE'],
    'points-vente': ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER'],
    stocks: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'STOCK_MANAGER'],
    ventes: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'CAISSIER'],
    paiements: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'COMPTABLE', 'CAISSIER']
  } as const;

  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Vérifier l'accès à un module (hybride : API + fallback JWT)
  canAccess(module: string): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    // Essayer l'API backend d'abord
    return this.http.get<PermissionResponse>(`${this.permissionsUrl}/check`, {
      params: { module, action: 'read' }
    }).pipe(
      map(response => response.canAccess),
      catchError(() => {
        // Fallback : utiliser les rôles JWT
        return of(this.canAccessSync(module));
      })
    );
  }

  // Vérifier si l'utilisateur peut modifier (hybride : API + fallback JWT)
  canModify(module: string): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    // Essayer l'API backend d'abord
    return this.http.get<PermissionResponse>(`${this.permissionsUrl}/check`, {
      params: { module, action: 'create' }
    }).pipe(
      map(response => response.canModify),
      catchError(() => {
        // Fallback : logique basée sur les rôles JWT
        return of(this.canModifySync(module));
      })
    );
  }

  // VERSION SYNCHRONE pour les guards (utilise seulement JWT)
  canAccessSync(module: string): boolean {
    const userRoles = this.authService.getRoles();
    const allowedRoles = this.PERMISSIONS[module as keyof typeof this.PERMISSIONS];
    return allowedRoles ? allowedRoles.some(role => userRoles.includes(role)) : false;
  }

  // VERSION SYNCHRONE pour modification (utilise seulement JWT)
  canModifySync(module: string): boolean {
    const userRoles = this.authService.getRoles();

    // SUPER_ADMIN et ADMIN_ENTREPRISE peuvent tout modifier
    if (userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN_ENTREPRISE')) {
      return true;
    }

    // Règles spécifiques par module
    switch (module) {
      case 'ventes':
      case 'paiements':
        return userRoles.includes('CAISSIER');
      case 'stocks':
        return userRoles.includes('STOCK_MANAGER');
      case 'points-vente':
        return userRoles.includes('MANAGER');
      case 'categories':
      case 'taxes':
        return userRoles.includes('MANAGER');
      default:
        return false;
    }
  }

  // Obtenir toutes les permissions de l'utilisateur (hybride)
  getUserPermissions(): Observable<Record<string, PermissionResponse>> {
    return this.http.get<Record<string, PermissionResponse>>(`${this.permissionsUrl}/user`).pipe(
      catchError(() => {
        // Fallback : calculer depuis les rôles JWT
        return of(this.getUserPermissionsSync());
      })
    );
  }

  // VERSION SYNCHRONE des permissions utilisateur
  getUserPermissionsSync(): Record<string, PermissionResponse> {
    const result: Record<string, PermissionResponse> = {};

    for (const module of Object.keys(this.PERMISSIONS)) {
      const canRead = this.canAccessSync(module);
      const canModify = this.canModifySync(module);
      const allowedActions = this.getAllowedActionsSync(module);

      result[module] = {
        canAccess: canRead,
        canModify: canModify,
        allowedActions: allowedActions
      };
    }

    return result;
  }

  // Actions autorisées pour un module (synchrone)
  private getAllowedActionsSync(module: string): string[] {
    const userRoles = this.authService.getRoles();
    const modulePermissions = this.PERMISSIONS[module as keyof typeof this.PERMISSIONS];

    if (!modulePermissions) return [];

    const actions = ['read'];
    if (this.canModifySync(module)) {
      actions.push('create', 'update', 'delete');
    }

    return actions;
  }

  // Filtrer les données selon l'entreprise (pour non-SUPER_ADMIN)
  shouldFilterByEntreprise(): boolean {
    return !this.authService.hasAnyRole(['SUPER_ADMIN']);
  }
}
