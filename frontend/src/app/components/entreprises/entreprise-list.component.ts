import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Entreprise } from '../../models/entreprise.model';
import { EntrepriseService } from '../../services/entreprise.service';

@Component({
  selector: 'app-entreprise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entreprise-list.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class EntrepriseListComponent implements OnInit {
  entreprises = signal<Entreprise[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(private entrepriseService: EntrepriseService) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises(): void {
    this.loading.set(true);
    this.error.set('');

    this.entrepriseService.getVisibleForCurrentUser().subscribe({
      next: (data) => {
        this.entreprises.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les entreprises.');
        this.loading.set(false);
      }
    });
  }

  deleteEntreprise(entreprise: Entreprise): void {
    if (!entreprise.id || !confirm('Supprimer cette entreprise ?')) {
      return;
    }

    this.entrepriseService.delete(entreprise.id).subscribe({
      next: () => this.loadEntreprises(),
      error: () => this.error.set('Suppression de l entreprise impossible.')
    });
  }
}
