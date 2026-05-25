import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Taxe } from '../../models/taxe.model';
import { NotificationService } from '../../services/notification.service';
import { TaxeService } from '../../services/taxe.service';

@Component({
  selector: 'app-taxe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './taxe-list.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class TaxeListComponent implements OnInit {
  taxes: Taxe[] = [];
  searchTerm = '';
  selectedStatus = '';
  loading = false;
  error = '';
  selectedTaxe?: Taxe;
  deleting = false;

  constructor(
    private taxeService: TaxeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredTaxes(): Taxe[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.taxes.filter((taxe) => {
      const matchSearch = !search || taxe.nom.toLowerCase().includes(search);
      const matchStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && taxe.actif !== false) ||
        (this.selectedStatus === 'inactive' && taxe.actif === false);

      return matchSearch && matchStatus;
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.taxeService.getAll().subscribe({
      next: (data) => {
        this.taxes = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les taxes.';
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
  }

  openDeleteModal(item: Taxe): void {
    this.selectedTaxe = item;
    this.error = '';
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.selectedTaxe = undefined;
  }

  confirmDelete(): void {
    const item = this.selectedTaxe;

    if (!item || !item.id) {
      return;
    }

    const itemId = item.id;
    this.deleting = true;
    this.error = '';

    this.taxeService.deleteTaxe(itemId).subscribe({
      next: () => {
        this.notificationService.deleted('Taxe supprimee.');
        this.taxes = this.taxes.filter((taxe) => taxe.id !== item.id);
        this.selectedTaxe = undefined;
        this.deleting = false;
      },
      error: () => {
        this.notificationService.error('Suppression de la taxe impossible.');
        this.deleting = false;
      }
    });
  }
}
