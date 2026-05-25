export interface Paiement {
  id?: number;
  venteId?: number;
  montant?: number;
  modePaiement?: string;
  datePaiement?: string;
  statut?: string;
}
