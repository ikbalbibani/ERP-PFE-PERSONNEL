import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Utilisateur } from '../../../models/utilisateur.model';
import { NotificationService } from '../../../services/notification.service';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './utilisateur-list.component.html',
  styleUrls: ['../../produits/produit-list.component.scss']
})
export class UtilisateurListComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  selectedUtilisateur?: Utilisateur;
  deleting = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredUtilisateurs(): Utilisateur[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.utilisateurs;
    }

    return this.utilisateurs.filter((utilisateur) =>
      [
        utilisateur.nom || '',
        utilisateur.prenom || '',
        utilisateur.email || '',
        utilisateur.telephone || '',
        utilisateur.entreprise?.nom || '',
        this.getRoleLabel(utilisateur)
      ].some((value) => value.toLowerCase().includes(search))
    );
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.utilisateurService.getVisibleForCurrentUser().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
  }

  openDeleteModal(utilisateur: Utilisateur): void {
    this.selectedUtilisateur = utilisateur;
    this.error = '';
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.selectedUtilisateur = undefined;
  }

  confirmDelete(): void {
    const utilisateur = this.selectedUtilisateur;

    if (!utilisateur?.id) {
      return;
    }

    this.deleting = true;
    this.utilisateurService.delete(utilisateur.id).subscribe({
      next: () => {
        this.notificationService.deleted('Utilisateur supprime.');
        this.utilisateurs = this.utilisateurs.filter((item) => item.id !== utilisateur.id);
        this.selectedUtilisateur = undefined;
        this.deleting = false;
      },
      error: () => {
        this.notificationService.error('Suppression de l utilisateur impossible.');
        this.deleting = false;
      }
    });
  }

  getFullName(utilisateur: Utilisateur): string {
    return [utilisateur.nom, utilisateur.prenom].filter(Boolean).join(' ') || `Utilisateur #${utilisateur.id}`;
  }

  getRoleLabel(utilisateur: Utilisateur): string {
    if (utilisateur.roles?.length) {
      return utilisateur.roles
        .map((role) => typeof role === 'string' ? role : role.nom)
        .filter(Boolean)
        .join(', ');
    }

    if (utilisateur.role) {
      return utilisateur.role;
    }

    return utilisateur.roleIds?.length ? utilisateur.roleIds.join(', ') : '-';
  }
}
