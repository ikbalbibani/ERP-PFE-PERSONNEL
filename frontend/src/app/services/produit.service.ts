import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Produit, ProduitRequest } from '../models/produit.model';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly api = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  getProduits(entrepriseId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/entreprise/${entrepriseId}`);
  }

  getProduitById(id: number | string): Observable<Produit> {
    return this.http.get<Produit>(`${this.api}/${id}`);
  }

  addProduit(produit: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.api, produit);
  }

  updateProduit(id: number | string, produit: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.api}/${id}`, produit);
  }

  deleteProduit(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.api);
  }

  getById(id: number | string): Observable<Produit> {
    return this.getProduitById(id);
  }

  create(produit: ProduitRequest): Observable<Produit> {
    return this.addProduit(produit);
  }

  update(id: number | string, produit: ProduitRequest): Observable<Produit> {
    return this.updateProduit(id, produit);
  }

  delete(id: number | string): Observable<void> {
    return this.deleteProduit(id);
  }

  getCurrentEntrepriseId(): number {
    return Number(localStorage.getItem('entrepriseId') || 1);
  }
}
