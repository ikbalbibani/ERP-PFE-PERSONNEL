import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { PointVente, PointVenteRequest, TypePointVente } from '../models/point-vente.model';
import { AuthService } from './auth.service';
import { EntrepriseService } from './entreprise.service';

@Injectable({ providedIn: 'root' })
export class PointVenteService {
  private readonly apiUrl = `${environment.apiUrl}/points-vente`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private entrepriseService: EntrepriseService
  ) {}

  getAll(): Observable<PointVente[]> {
    return this.http.get<PointVente[]>(this.apiUrl);
  }

  getVisibleForCurrentUser(): Observable<PointVente[]> {
    if (this.authService.hasAnyRole(['SUPER_ADMIN'])) {
      return this.getAll();
    }

    return this.entrepriseService.getCurrentUserEntrepriseId().pipe(
      switchMap((entrepriseId) => entrepriseId ? this.getByEntreprise(entrepriseId) : of([]))
    );
  }

  getById(id: number | string): Observable<PointVente> {
    return this.getAll().pipe(
      map((pointsVente) => {
        const pointVente = pointsVente.find((item) => String(item.id) === String(id));
        if (!pointVente) {
          throw new Error('Point de vente introuvable');
        }
        return pointVente;
      })
    );
  }

  getByEntreprise(entrepriseId: number | string): Observable<PointVente[]> {
    return this.http.get<PointVente[]>(`${this.apiUrl}/entreprise/${entrepriseId}`);
  }

  create(pointVente: PointVenteRequest): Observable<PointVente> {
    return this.http.post<PointVente>(this.apiUrl, this.toPayload(pointVente));
  }

  update(id: number | string, pointVente: PointVenteRequest): Observable<PointVente> {
    return this.http.put<PointVente>(`${this.apiUrl}/${id}`, this.toPayload(pointVente));
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toPayload(pointVente: PointVenteRequest): PointVenteRequest {
    return {
      ...pointVente,
      type: this.toTypePointVente(pointVente.type),
      responsableId: pointVente.responsableId || undefined
    };
  }

  private toTypePointVente(type?: string): TypePointVente | undefined {
    const types: TypePointVente[] = ['MAGASIN', 'DEPOT', 'SHOWROOM', 'BOUTIQUE'];
    const trimmedType = type?.trim() as TypePointVente | undefined;

    return trimmedType && types.includes(trimmedType) ? trimmedType : undefined;
  }
}
