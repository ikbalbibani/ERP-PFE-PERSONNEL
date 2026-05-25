import { Role, UserRole } from './role.model';
import { Entreprise } from './entreprise.model';

export interface Utilisateur {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  roles?: Array<Role | UserRole | string>;
  roleIds?: number[];
  entrepriseId?: number;
  entrepriseNom?: string;
  entreprise?: Entreprise;
  cin?: string;
  age?: number;
  genre?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  imageUrl?: string;
  actif?: boolean;
}
