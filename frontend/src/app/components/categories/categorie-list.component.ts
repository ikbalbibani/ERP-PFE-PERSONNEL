import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Categorie, TypeEntreprise } from '../../models/categorie.model';
import { CategorieService } from '../../services/categorie.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorie-list.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class CategorieListComponent implements OnInit {
  categories: Categorie[] = [];
  types: TypeEntreprise[] = ['PHARMACIE', 'BOUTIQUE', 'RESTAURANT'];
  searchTerm = '';
  selectedType = '';
  loading = false;
  error = '';
  selectedCategorie?: Categorie;
  deleting = false;

  constructor(
    private categorieService: CategorieService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void { this.load(); }

  get filteredCategories(): Categorie[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.categories.filter((categorie) => {
      const matchSearch = !search || categorie.nom.toLowerCase().includes(search);
      const matchType = !this.selectedType || categorie.entreprise?.typeEntreprise === this.selectedType;

      return matchSearch && matchType;
    });
  }

  getCategorieType(categorie: Categorie): string {
    return categorie.entreprise?.typeEntreprise || '-';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.categorieService.getAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => { this.error = 'Impossible de charger les categories.'; this.loading = false; }
    });
  }

  openDeleteModal(item: Categorie): void {
    this.selectedCategorie = item;
    this.error = '';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.selectedCategorie = undefined;
  }

  confirmDelete(): void {
    const item = this.selectedCategorie;

    if (!item || !item.id) {
      return;
    }

    const itemId = item.id;
    this.deleting = true;
    this.error = '';

    this.categorieService.deleteCategorie(itemId).subscribe({
      next: () => {
        this.notificationService.deleted('Categorie supprimee.');
        this.categories = this.categories.filter((categorie) => categorie.id !== item.id);
        this.selectedCategorie = undefined;
        this.deleting = false;
      },
      error: () => {
        this.notificationService.error('Suppression de la categorie impossible.');
        this.deleting = false;
      },
    });
  }
}
