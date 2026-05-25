import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Stock } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly apiUrl = `${environment.apiUrl}/stocks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  getById(id: number | string): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`);
  }

  create(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, this.toPayload(stock));
  }

  update(id: number | string, stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/${id}`, this.toPayload(stock));
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toPayload(stock: Stock): Stock {
    return {
      id: stock.id,
      quantite: stock.quantite ?? 0,
      produit: stock.produitId ? { id: stock.produitId, nom: '', code: '', prix: 0 } : stock.produit,
      pointDeVente: stock.pointVenteId ? { id: stock.pointVenteId, nom: '' } : stock.pointDeVente
    };
  }
}
