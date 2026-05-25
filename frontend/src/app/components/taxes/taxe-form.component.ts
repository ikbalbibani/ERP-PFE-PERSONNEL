import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Entreprise } from '../../models/entreprise.model';
import { TaxeForm } from '../../models/taxe.model';
import { AuthService } from '../../services/auth.service';
import { EntrepriseService } from '../../services/entreprise.service';
import { NotificationService } from '../../services/notification.service';
import { TaxeService } from '../../services/taxe.service';

@Component({
  selector: 'app-taxe-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './taxe-form.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class TaxeFormComponent implements OnInit {
  form: TaxeForm = { nom: '', taux: 0, actif: true };
  loading = false;
  saving = false;
  error = '';
  entreprises: Entreprise[] = [];
  entrepriseNom = '';
  private taxeId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxeService: TaxeService,
    private entrepriseService: EntrepriseService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.taxeId = this.route.snapshot.paramMap.get('id') || undefined;
    this.loadEntreprises();
  }

  get isEditMode(): boolean {
    return Boolean(this.taxeId);
  }

  save(): void {
    if (this.authService.hasAnyRole(['SUPER_ADMIN']) && !this.form.entrepriseId) {
      this.error = 'Selection entreprise obligatoire pour ajouter une taxe.';
      this.notificationService.error(this.error);
      return;
    }

    this.saving = true;
    this.error = '';

    const request$ = this.taxeId
      ? this.taxeService.updateTaxe(this.taxeId, this.form)
      : this.taxeService.addTaxe(this.form);

    request$.subscribe({
      next: () => {
        if (this.taxeId) {
          this.notificationService.updated('Taxe modifiee avec succes.');
        } else {
          this.notificationService.created('Taxe ajoutee avec succes.');
        }
        this.saving = false;
        this.router.navigate(['/taxes']);
      },
      error: () => {
        this.error = 'Enregistrement de la taxe impossible.';
        this.notificationService.error(this.error);
        this.saving = false;
      }
    });
  }

  private loadTaxe(id: string): void {
    this.loading = true;
    this.taxeService.getById(id).subscribe({
      next: (taxe) => {
        const entrepriseId = taxe.entreprise?.id ? Number(taxe.entreprise.id) : undefined;
        this.form = {
          nom: taxe.nom,
          taux: taxe.taux,
          actif: taxe.actif !== false,
          entrepriseId
        };
        this.entrepriseNom = taxe.entreprise?.nom || this.findEntrepriseName(entrepriseId);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette taxe.';
        this.loading = false;
      }
    });
  }

  private loadEntreprises(): void {
    this.loading = true;
    this.entrepriseService.getVisibleForCurrentUser().subscribe({
      next: (entreprises) => {
        this.entreprises = entreprises;
        if (!this.taxeId) {
          const entreprise = entreprises[0];
          this.form.entrepriseId = entreprise?.id;
          this.entrepriseNom = entreprise?.nom || '';
          this.loading = false;
          return;
        }

        this.loadTaxe(this.taxeId);
      },
      error: () => {
        this.error = 'Impossible de charger l entreprise.';
        this.loading = false;
      }
    });
  }

  private findEntrepriseName(id?: number): string {
    return this.entreprises.find((entreprise) => entreprise.id === id)?.nom || '';
  }
}
