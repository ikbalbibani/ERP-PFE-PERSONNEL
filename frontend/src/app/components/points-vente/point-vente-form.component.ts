import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Entreprise } from '../../models/entreprise.model';
import { PointVente, PointVenteRequest, TypePointVente } from '../../models/point-vente.model';
import { Utilisateur } from '../../models/utilisateur.model';
import { EntrepriseService } from '../../services/entreprise.service';
import { PointVenteService } from '../../services/point-vente.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-point-vente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './point-vente-form.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class PointVenteFormComponent implements OnInit {
  form: PointVenteRequest = this.getEmptyForm();
  entreprises: Entreprise[] = [];
  utilisateurs: Utilisateur[] = [];
  types: TypePointVente[] = ['MAGASIN', 'DEPOT', 'SHOWROOM', 'BOUTIQUE'];
  loading = false;
  loadingEntreprises = false;
  loadingUtilisateurs = false;
  saving = false;
  error = '';
  private pointVenteId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrepriseService: EntrepriseService,
    private pointVenteService: PointVenteService,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.pointVenteId = this.route.snapshot.paramMap.get('id') || undefined;
    this.loadInitialData();
  }

  get isEditMode(): boolean {
    return Boolean(this.pointVenteId);
  }

  save(): void {
    if (!this.form.nom.trim()) {
      this.error = 'Le nom du point de vente est obligatoire.';
      return;
    }

    if (!this.form.code.trim()) {
      this.error = 'Le code du point de vente est obligatoire.';
      return;
    }

    if (!this.form.entrepriseId) {
      this.error = 'Entreprise obligatoire.';
      return;
    }

    this.saving = true;
    this.error = '';

    const request$ = this.pointVenteId
      ? this.pointVenteService.update(this.pointVenteId, this.form)
      : this.pointVenteService.create(this.form);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/points-vente']);
      },
      error: () => {
        this.error = 'Enregistrement du point de vente impossible.';
        this.saving = false;
      }
    });
  }

  getUtilisateurLabel(utilisateur: Utilisateur): string {
    return [utilisateur.nom, utilisateur.prenom].filter(Boolean).join(' ') || utilisateur.email || `Utilisateur #${utilisateur.id}`;
  }

  private loadInitialData(): void {
    this.loading = true;
    this.loadingEntreprises = true;
    this.loadingUtilisateurs = true;
    this.error = '';

    const pointVente$ = this.pointVenteId
      ? this.pointVenteService.getById(this.pointVenteId)
      : undefined;

    forkJoin({
      entreprises: this.entrepriseService.getVisibleForCurrentUser(),
      utilisateurs: this.utilisateurService.getVisibleForCurrentUser(),
      ...(pointVente$ ? { pointVente: pointVente$ } : {})
    }).subscribe({
      next: (data) => {
        this.entreprises = data.entreprises.filter((entreprise) => entreprise.id);
        this.utilisateurs = data.utilisateurs.filter((utilisateur) => utilisateur.id);

        if (data.pointVente) {
          this.patchPointVente(data.pointVente);
        } else {
          this.form.entrepriseId = this.getDefaultEntrepriseId();
        }

        this.loading = false;
        this.loadingEntreprises = false;
        this.loadingUtilisateurs = false;
      },
      error: () => {
        this.error = 'Impossible de charger les donnees du point de vente.';
        this.loading = false;
        this.loadingEntreprises = false;
        this.loadingUtilisateurs = false;
      }
    });
  }

  private getEmptyForm(): PointVenteRequest {
    return {
      nom: '',
      code: '',
      adresse: '',
      ville: '',
      telephone: '',
      actif: true,
      type: '',
      entrepriseId: 0,
      responsableId: undefined
    };
  }

  private toTypePointVente(type?: string): TypePointVente | '' {
    return this.types.includes(type as TypePointVente) ? type as TypePointVente : '';
  }

  private patchPointVente(pointVente: PointVente): void {
    this.form = {
      nom: pointVente.nom,
      code: pointVente.code || '',
      adresse: pointVente.adresse || '',
      ville: pointVente.ville || '',
      telephone: pointVente.telephone || '',
      actif: pointVente.actif !== false,
      type: this.toTypePointVente(pointVente.type),
      entrepriseId: pointVente.entrepriseId || this.getDefaultEntrepriseId(),
      responsableId: pointVente.responsableId || pointVente.responsable?.id
    };
  }

  private getDefaultEntrepriseId(): number {
    return this.entreprises[0]?.id || 0;
  }
}
