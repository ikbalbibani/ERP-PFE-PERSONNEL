import { Entreprise } from './entreprise.model';

export interface Taxe {
  id?: number;
  nom: string;
  taux: number;
  actif?: boolean;
  entreprise?: Entreprise;
}

export interface TaxeForm {
  nom: string;
  taux: number;
  actif: boolean;
  entrepriseId?: number;
}
