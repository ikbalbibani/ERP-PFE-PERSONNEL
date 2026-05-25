export interface Produit {
  id?: number;
  nom: string;
  code: string;
  prix: number;
  quantite?: number;
  barcode?: string;
  imageUrl?: string;
  stockMinimum?: number;
  actif?: boolean;
  entrepriseId?: number;
  entrepriseNom?: string;
  categorieId?: number;
  categorieNom?: string;
  taxeId?: number;
  taxeNom?: string;
  taxeTaux?: number;
}

export interface ProduitRequest {
  nom: string;
  code: string;
  prix: number;
  barcode?: string;
  imageUrl?: string;
  stockMinimum?: number;
  actif?: boolean;
  entrepriseId: number;
  categorieId?: number;
  taxeId?: number;
  taxeNom?: string;
  taxeTaux?: number;
}
