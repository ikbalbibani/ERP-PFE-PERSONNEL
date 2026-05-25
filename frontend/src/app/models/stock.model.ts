import { PointVente } from './point-vente.model';
import { Produit } from './produit.model';

export interface Stock {
  id?: number;
  produitId?: number;
  pointVenteId?: number;
  produit?: Produit;
  pointDeVente?: PointVente;
  quantite?: number;
  seuilAlerte?: number;
}
