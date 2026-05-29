import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface SearchResult {
  label: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['../layout.component.scss']
})
export class NavbarComponent {
  @Input() userEmail = 'User';
  @Input() userMenuOpen = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  searchQuery = '';
  searchFocused = false;

  private readonly searchResults: SearchResult[] = [
    { label: 'Dashboard', description: 'Vue globale et indicateurs', route: '/dashboard' },
    { label: 'Produits', description: 'Liste, prix, stock minimum', route: '/produits' },
    { label: 'Ajouter produit', description: 'Creation produit', route: '/produits/new' },
    { label: 'Stock', description: 'Quantites et alertes', route: '/stocks' },
    { label: 'Ajouter stock', description: 'Mouvement de stock', route: '/stocks/new' },
    { label: 'Ventes', description: 'Commandes et caisse', route: '/ventes' },
    { label: 'Paiements', description: 'Modes et statuts', route: '/paiements' },
    { label: 'Categories', description: 'Organisation produits', route: '/categories' },
    { label: 'Taxes', description: 'TVA et taux', route: '/taxes' },
    { label: 'Utilisateurs', description: 'Comptes et roles', route: '/utilisateurs' },
    { label: 'Points de vente', description: 'Magasins et caisses', route: '/points-vente' },
    { label: 'Entreprises', description: 'Societes clientes', route: '/entreprises' }
  ];

  constructor(private router: Router) {}

  get filteredSearchResults(): SearchResult[] {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.searchResults.slice(0, 6);
    }

    return this.searchResults
      .filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(query))
      .slice(0, 6);
  }

  get showSearchPanel(): boolean {
    return this.searchFocused && this.filteredSearchResults.length > 0;
  }

  openSearch(): void {
    this.searchFocused = true;
  }

  closeSearch(): void {
    window.setTimeout(() => {
      this.searchFocused = false;
    }, 120);
  }

  runSearch(): void {
    const result = this.filteredSearchResults[0];

    if (result) {
      this.goToResult(result.route);
    }
  }

  goToResult(route: string): void {
    this.searchQuery = '';
    this.searchFocused = false;
    this.router.navigateByUrl(route);
  }
}
