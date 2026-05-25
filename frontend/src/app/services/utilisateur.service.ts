import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Utilisateur } from '../models/utilisateur.model';
import { AuthService } from './auth.service';
import { EntrepriseService } from './entreprise.service';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private entrepriseService: EntrepriseService
  ) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  getVisibleForCurrentUser(): Observable<Utilisateur[]> {
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) {
      return this.getAll();
    }

    return this.entrepriseService.getCurrentUserEntrepriseId().pipe(
      switchMap((entrepriseId) => this.getAll().pipe(
        map((users) => users.filter((user) => (user.entrepriseId ?? user.entreprise?.id) === entrepriseId))
      ))
    );
  }

  getById(id: number | string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  create(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, utilisateur);
  }

  update(id: number | string, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadUserImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${environment.apiUrl}/upload/user-image`, formData, {
      responseType: 'text'
    });
  }
}
