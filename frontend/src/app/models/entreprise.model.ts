import { TypeEntreprise } from './categorie.model';

export interface Entreprise {
  id?: number;
  nom: string;
  code?: string;
  description?: string;
  typeEntreprise?: TypeEntreprise;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  devise?: string;
  langue?: string;
  matriculeFiscal?: string;
  registreCommerce?: string;
  logoUrl?: string;
  actif?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

export interface EntrepriseForm {
  nom: string;
  code?: string;
  description?: string;
  typeEntreprise: TypeEntreprise;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  devise?: string;
  langue?: string;
  matriculeFiscal?: string;
  registreCommerce?: string;
  logoUrl?: string;
  actif: boolean;
}
