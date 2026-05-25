import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Taxe, TaxeForm } from '../models/taxe.model';

@Injectable({ providedIn: 'root' })
export class TaxeService {
  private readonly api = `${environment.apiUrl}/taxes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Taxe[]> {
    return this.http.get<Taxe[]>(this.api);
  }

  getById(id: number | string): Observable<Taxe> {
    return this.http.get<Taxe>(`${this.api}/${id}`);
  }

  addTaxe(form: TaxeForm): Observable<Taxe> {
    return this.http.post<Taxe>(this.api, this.toTaxe(form));
  }

  updateTaxe(id: number | string, form: TaxeForm): Observable<Taxe> {
    return this.http.put<Taxe>(`${this.api}/${id}`, this.toTaxe(form));
  }

  deleteTaxe(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  private toTaxe(form: TaxeForm): Taxe {
    return {
      nom: form.nom,
      taux: form.taux,
      actif: form.actif,
      entreprise: form.entrepriseId ? { id: form.entrepriseId, nom: '' } : undefined
    };
  }
}
