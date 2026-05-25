import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'produits',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/produits/produit-list.component').then((m) => m.ProduitListComponent)
      },
      {
        path: 'produits/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/produits/produit-form.component').then((m) => m.ProduitFormComponent)
      },
      {
        path: 'produits/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/produits/produit-detail.component').then((m) => m.ProduitDetailComponent)
      },
      {
        path: 'produits/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/produits/produit-form.component').then((m) => m.ProduitFormComponent)
      },
      {
        path: 'entreprises',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/entreprises/entreprise-list.component').then((m) => m.EntrepriseListComponent)
      },
      {
        path: 'entreprises/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/entreprises/entreprise-form.component').then((m) => m.EntrepriseFormComponent)
      },
      {
        path: 'entreprises/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/entreprises/entreprise-detail.component').then((m) => m.EntrepriseDetailComponent)
      },
      {
        path: 'entreprises/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/entreprises/entreprise-form.component').then((m) => m.EntrepriseFormComponent)
      },
      {
        path: 'utilisateurs',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/utilisateurs/list/utilisateur-list.component').then((m) => m.UtilisateurListComponent)
      },
      {
        path: 'utilisateurs/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/utilisateurs/form/utilisateur-form.component').then((m) => m.UtilisateurFormComponent)
      },
      {
        path: 'utilisateurs/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/utilisateurs/form/utilisateur-form.component').then((m) => m.UtilisateurFormComponent)
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/categories/categorie-list.component').then((m) => m.CategorieListComponent)
      },
      {
        path: 'categories/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/categories/categorie-form.component').then((m) => m.CategorieFormComponent)
      },
      {
        path: 'categories/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/categories/categorie-form.component').then((m) => m.CategorieFormComponent)
      },
      {
        path: 'categories/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/categories/categorie-detail.component').then((m) => m.CategorieDetailComponent)
      },
      {
        path: 'taxes',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/taxes/taxe-list.component').then((m) => m.TaxeListComponent)
      },
      {
        path: 'taxes/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/taxes/taxe-form.component').then((m) => m.TaxeFormComponent)
      },
      {
        path: 'taxes/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/taxes/taxe-detail.component').then((m) => m.TaxeDetailComponent)
      },
      {
        path: 'taxes/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/taxes/taxe-form.component').then((m) => m.TaxeFormComponent)
      },
      {
        path: 'points-vente',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/points-vente/point-vente-list.component').then((m) => m.PointVenteListComponent)
      },
      {
        path: 'points-vente/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/points-vente/point-vente-form.component').then((m) => m.PointVenteFormComponent)
      },
      {
        path: 'points-vente/:id',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/points-vente/point-vente-detail.component').then((m) => m.PointVenteDetailComponent)
      },
      {
        path: 'points-vente/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/points-vente/point-vente-form.component').then((m) => m.PointVenteFormComponent)
      },
      {
        path: 'stocks',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/stocks').then((m) => m.StockListComponent)
      },
      {
        path: 'stocks/new',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/stocks').then((m) => m.StockFormComponent)
      },
      {
        path: 'stocks/:id/edit',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/stocks').then((m) => m.StockFormComponent)
      },
      { path: 'stock', redirectTo: 'stocks' },
      {
        path: 'ventes',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/ventes/vente-list.component').then((m) => m.VenteListComponent)
      },
      {
        path: 'paiements',
        canActivate: [roleGuard],
        loadComponent: () => import('./components/paiements/paiement-list.component').then((m) => m.PaiementListComponent)
      },
      { path: 'settings', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
