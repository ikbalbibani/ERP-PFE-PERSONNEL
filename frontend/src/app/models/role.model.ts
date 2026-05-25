export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_ENTREPRISE'
  | 'MANAGER'
  | 'CAISSIER'
  | 'STOCK_MANAGER'
  | 'COMPTABLE';

export interface Role {
  id?: number;
  nom: UserRole | string;
}
