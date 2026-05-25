import { Entreprise } from './entreprise.model';

export type TypeEntreprise = 'PHARMACIE' | 'BOUTIQUE' | 'RESTAURANT';

export interface Categorie {
  id?: number;
  nom: string;
  parent?: Categorie;
  sousCategories?: Categorie[];
  entreprise?: Entreprise;
}

export interface CategorieForm {
  nom: string;
  parentId?: number;
  entrepriseId?: number;
}

export interface CategoriePayload {
  nom: string;
  parent?: {
    id: number;
  };
  entreprise?: {
    id: number;
  };
}
