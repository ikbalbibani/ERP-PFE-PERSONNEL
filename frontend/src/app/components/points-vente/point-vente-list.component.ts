import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PointVente } from '../../models/point-vente.model';
import { PointVenteService } from '../../services/point-vente.service';

@Component({
  selector: 'app-point-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './point-vente-list.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class PointVenteListComponent implements OnInit {
  pointsVente = signal<PointVente[]>([]);
  loading = signal(false);
  error = signal('');
  searchTerm = '';

  constructor(private pointVenteService: PointVenteService) {}

  ngOnInit(): void {
    this.loadPointsVente();
  }

  get filteredPointsVente(): PointVente[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.pointsVente();
    }

    return this.pointsVente().filter((pointVente) =>
      [
        pointVente.nom,
        pointVente.code,
        pointVente.type,
        pointVente.adresse,
        pointVente.ville,
        pointVente.telephone,
        pointVente.entrepriseNom,
        pointVente.actif === false ? 'Inactif' : 'Actif'
      ].some((value) => (value || '').toLowerCase().includes(search))
    );
  }

  loadPointsVente(): void {
    this.loading.set(true);
    this.error.set('');

    this.pointVenteService.getVisibleForCurrentUser().subscribe({
      next: (data) => {
        this.pointsVente.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les points de vente.');
        this.loading.set(false);
      }
    });
  }

  deletePointVente(pointVente: PointVente): void {
    if (!pointVente.id || !confirm('Supprimer ce point de vente ?')) {
      return;
    }

    this.pointVenteService.delete(pointVente.id).subscribe({
      next: () => this.loadPointsVente(),
      error: () => this.error.set('Suppression du point de vente impossible.')
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
  }
}
