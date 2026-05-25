import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Vente } from '../models/vente.model';

@Injectable({ providedIn: 'root' })
export class VenteService {
  private readonly apiUrl = `${environment.apiUrl}/ventes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.apiUrl);
  }

  getById(id: number | string): Observable<Vente> {
    return this.http.get<Vente>(`${this.apiUrl}/${id}`);
  }

  create(vente: Vente): Observable<Vente> {
    return this.http.post<Vente>(this.apiUrl, vente);
  }

  update(id: number | string, vente: Vente): Observable<Vente> {
    return this.http.put<Vente>(`${this.apiUrl}/${id}`, vente);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
