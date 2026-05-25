import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import { PermissionService } from '../core/services/permission.service';
import { Entreprise } from '../models/entreprise.model';
import { Utilisateur } from '../models/utilisateur.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {
  private readonly apiUrl = `${environment.apiUrl}/entreprises`;
  private readonly usersUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  getAll(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(this.apiUrl);
  }

  getVisibleForCurrentUser(): Observable<Entreprise[]> {
    if (!this.permissionService.canAccessSync('entreprises')) {
      return of([]);
    }

    if (!this.permissionService.shouldFilterByEntreprise()) {
      return this.getAll();
    }

    return this.getCurrentUserEntrepriseId().pipe(
      switchMap((entrepriseId) => this.getAll().pipe(
        map((entreprises) => entreprises.filter((entreprise) => entreprise.id === entrepriseId))
      ))
    );
  }

  getCurrentUserEntrepriseId(): Observable<number | undefined> {
    const currentEmail = this.authService.getUserEmail().toLowerCase();

    return this.http.get<Utilisateur[]>(this.usersUrl).pipe(
      map((users) => {
        const currentUser = users.find((user) => user.email?.toLowerCase() === currentEmail);
        return currentUser?.entrepriseId ?? currentUser?.entreprise?.id;
      })
    );
  }

  getById(id: number | string): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/${id}`);
  }

  create(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  update(id: number | string, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
