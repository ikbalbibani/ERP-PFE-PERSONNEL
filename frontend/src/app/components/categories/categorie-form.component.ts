import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';

import { Categorie, CategorieForm } from '../../models/categorie.model';
import { Entreprise } from '../../models/entreprise.model';
import { CategorieService } from '../../services/categorie.service';
import { EntrepriseService } from '../../services/entreprise.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorie-form.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class CategorieFormComponent implements OnInit {
  categories: Categorie[] = [];
  entreprises: Entreprise[] = [];
  form: CategorieForm = { nom: '' };
  loading = false;
  saving = false;
  error = '';
  private categorieId?: string;

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService,
    private entrepriseService: EntrepriseService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParents();
    this.categorieId = this.route.snapshot.paramMap.get('id') || undefined;

    if (this.categorieId) {
      this.loadCategorie(this.categorieId);
    }
  }

  get isEditMode(): boolean {
    return Boolean(this.categorieId);
  }

  save(): void {
    if (!this.form.nom.trim()) {
      this.error = 'Le nom de la categorie est obligatoire.';
      return;
    }

    this.saving = true;
    this.error = '';

    const request$ = this.categorieId
      ? this.categorieService.updateCategorie(this.categorieId, this.form)
      : this.categorieService.addCategorie(this.form);

    request$.subscribe({
      next: () => {
        if (this.categorieId) {
          this.notificationService.updated('Categorie modifiee avec succes.');
        } else {
          this.notificationService.created('Categorie ajoutee avec succes.');
        }
        this.saving = false;
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.error = this.categorieId
          ? 'Modification de categorie impossible.'
          : 'Ajout de categorie impossible.';
        this.notificationService.error(this.error);
        this.saving = false;
      }
    });
  }

  private loadParents(): void {
    this.loading = true;
    forkJoin({
      categories: this.categorieService.getAll(),
      entreprises: this.entrepriseService.getVisibleForCurrentUser()
    }).subscribe({
      next: (data) => {
        this.categories = data.categories.filter((categorie) => String(categorie.id) !== String(this.categorieId));
        this.entreprises = data.entreprises;
        this.form.entrepriseId = this.form.entrepriseId || data.entreprises[0]?.id;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les categories parentes.';
        this.loading = false;
      }
    });
  }

  private loadCategorie(id: string): void {
    this.loading = true;
    this.categorieService.getCategorieById(id).subscribe({
      next: (categorie) => {
        this.form = {
          nom: categorie.nom,
          parentId: categorie.parent?.id,
          entrepriseId: categorie.entreprise?.id || this.form.entrepriseId
        };
        this.categories = this.categories.filter((item) => String(item.id) !== String(id));
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette categorie.';
        this.loading = false;
      }
    });
  }

  getCategorieType(categorie: Categorie): string {
    return categorie.entreprise?.typeEntreprise || '-';
  }
}
