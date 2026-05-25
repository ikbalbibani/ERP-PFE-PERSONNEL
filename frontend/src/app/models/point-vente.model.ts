export type TypePointVente = 'MAGASIN' | 'DEPOT' | 'SHOWROOM' | 'BOUTIQUE';

export interface PointVente {
  id?: number;
  nom: string;
  code?: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  actif?: boolean;
  type?: TypePointVente | string;
  entrepriseId?: number;
  entrepriseNom?: string;
  responsableId?: number;
  responsableNom?: string;
  responsable?: { id?: number; nom?: string; prenom?: string; email?: string };
}

export interface PointVenteRequest {
  nom: string;
  code: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  actif?: boolean;
  type?: TypePointVente | '';
  entrepriseId: number;
  responsableId?: number;
}
