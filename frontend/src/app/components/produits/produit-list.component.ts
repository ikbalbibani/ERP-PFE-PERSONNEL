import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PermissionService } from '../../core/services/permission.service';
import { Produit } from '../../models/produit.model';
import { NotificationService } from '../../services/notification.service';
import { ProduitService } from '../../services/produit.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.scss']
})
export class ProduitListComponent implements OnInit {
  produits = signal<Produit[]>([]);
  loading = signal(false);
  error = signal('');
  searchTerm = '';
  selectedProduit?: Produit;
  deleting = false;

  constructor(
    private produitService: ProduitService,
    private notificationService: NotificationService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading.set(true);
    this.error.set('');

    this.produitService.getAll().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les produits depuis le backend.');
        this.loading.set(false);
      }
    });
  }

  get filteredProduits(): Produit[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.produits();
    }

    return this.produits().filter((produit) =>
      [
        produit.nom,
        produit.code,
        produit.barcode || '',
        produit.categorieNom || '',
        produit.taxeNom || '',
        produit.entrepriseNom || ''
      ].some((value) => value.toLowerCase().includes(search))
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
  }

  get canModifyProduits(): boolean {
    return this.permissionService.canModifySync('produits');
  }

  openDeleteModal(produit: Produit): void {
    if (!this.canModifyProduits) {
      return;
    }

    this.selectedProduit = produit;
    this.error.set('');
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.selectedProduit = undefined;
  }

  confirmDelete(): void {
    const produit = this.selectedProduit;

    if (!produit?.id) {
      return;
    }

    this.deleting = true;
    this.produitService.deleteProduit(produit.id).subscribe({
      next: () => {
        this.produits.update((produits) => produits.filter((item) => item.id !== produit.id));
        this.notificationService.deleted('Produit supprime.');
        this.selectedProduit = undefined;
        this.deleting = false;
      },
      error: () => {
        this.notificationService.error('La suppression du produit a echoue.');
        this.deleting = false;
      }
    });
  }

  getProduitName(produit: Produit): string {
    return produit.nom || produit.code || `Produit #${produit.id}`;
  }
}
