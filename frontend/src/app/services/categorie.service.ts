import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Categorie, CategorieForm, CategoriePayload, TypeEntreprise } from '../models/categorie.model';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private readonly api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.api);
  }

  getByType(type: TypeEntreprise): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.api}/type/${type}`);
  }

  getByParent(parentId: number | string): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.api}/parent/${parentId}`);
  }

  getCategorieById(id: number | string): Observable<Categorie> {
    return this.getAll().pipe(
      map((categories) => {
        const categorie = categories.find((item) => String(item.id) === String(id));
        if (!categorie) {
          throw new Error('Categorie introuvable');
        }
        return categorie;
      })
    );
  }

  addCategorie(form: CategorieForm): Observable<Categorie> {
    return this.http.post<Categorie>(this.api, this.toPayload(form));
  }

  updateCategorie(id: number | string, form: CategorieForm): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.api}/${id}`, this.toPayload(form));
  }

  deleteCategorie(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  private toPayload(form: CategorieForm): CategoriePayload {
    const categorie: CategoriePayload = {
      nom: form.nom,
      parent: form.parentId ? { id: Number(form.parentId) } : undefined,
      entreprise: form.entrepriseId ? { id: Number(form.entrepriseId) } : undefined
    };

    return categorie;
  }
}
