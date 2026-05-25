import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Categorie } from '../../models/categorie.model';
import { Entreprise } from '../../models/entreprise.model';
import { ProduitRequest } from '../../models/produit.model';
import { Taxe } from '../../models/taxe.model';
import { CategorieService } from '../../services/categorie.service';
import { EntrepriseService } from '../../services/entreprise.service';
import { NotificationService } from '../../services/notification.service';
import { ProduitService } from '../../services/produit.service';
import { TaxeService } from '../../services/taxe.service';

interface ProduitFormValue {
  nom: string;
  code: string;
  prix: number;
  barcode: string;
  imageUrl: string;
  stockMinimum: number;
  actif: boolean;
  entrepriseId: number;
  categorieId: number;
  taxeId: number;
}

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-list.component.scss']
})
export class ProduitFormComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  entreprises = signal<Entreprise[]>([]);
  categories = signal<Categorie[]>([]);
  taxes = signal<Taxe[]>([]);
  private produitId?: string;

  produitForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    code: ['', Validators.required],
    prix: [0, [Validators.required, Validators.min(0)]],
    barcode: [''],
    imageUrl: [''],
    stockMinimum: [0, [Validators.min(0)]],
    actif: [true],
    entrepriseId: [this.produitService.getCurrentEntrepriseId(), [Validators.required, Validators.min(1)]],
    categorieId: [0],
    taxeId: [0]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private entrepriseService: EntrepriseService,
    private categorieService: CategorieService,
    private taxeService: TaxeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.produitId = this.route.snapshot.paramMap.get('id') || undefined;
    this.loadReferences();
  }

  onTaxeChange(): void {
    const taxeId = this.produitForm.controls.taxeId.value;
    const taxe = this.taxes().find((item) => item.id === Number(taxeId));

    if (!taxe) {
      return;
    }
  }

  get isEditMode(): boolean {
    return Boolean(this.produitId);
  }

  get filteredCategories(): Categorie[] {
    const entrepriseId = this.produitForm.controls.entrepriseId.value;
    const hasEntrepriseList = this.entreprises().length > 0;

    return this.categories().filter((categorie) =>
      !hasEntrepriseList || !entrepriseId || categorie.entreprise?.id === entrepriseId
    );
  }

  saveProduit(): void {
    if (this.produitForm.invalid) {
      this.produitForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const produit = this.cleanPayload(this.produitForm.getRawValue());

    const request$ = this.produitId
      ? this.produitService.updateProduit(this.produitId, produit)
      : this.produitService.addProduit(produit);

    request$.subscribe({
      next: () => {
        if (this.produitId) {
          this.notificationService.updated('Produit modifie avec succes.');
        } else {
          this.notificationService.created('Produit ajoute avec succes.');
        }
        this.saving.set(false);
        this.router.navigate(['/produits']);
      },
      error: () => {
        this.error.set('Impossible d enregistrer le produit.');
        this.notificationService.error('Impossible d enregistrer le produit.');
        this.saving.set(false);
      }
    });
  }

  private loadReferences(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      entreprises: this.entrepriseService.getVisibleForCurrentUser(),
      categories: this.categorieService.getAll(),
      taxes: this.taxeService.getAll()
    }).subscribe({
      next: (data) => {
        this.entreprises.set(data.entreprises);
        this.categories.set(data.categories);
        this.taxes.set(data.taxes);
        if (!this.produitId) {
          this.produitForm.patchValue({
            entrepriseId: data.entreprises[0]?.id || data.categories[0]?.entreprise?.id || this.produitService.getCurrentEntrepriseId()
          });
        }

        if (this.produitId) {
          this.loadProduit(this.produitId);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger les listes entreprise, categorie et taxe.');
        this.loading.set(false);
      }
    });
  }

  private loadProduit(id: string): void {
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        this.produitForm.patchValue({
          nom: produit.nom,
          code: produit.code,
          prix: produit.prix,
          barcode: produit.barcode || '',
          imageUrl: produit.imageUrl || '',
          stockMinimum: produit.stockMinimum || 0,
          actif: produit.actif !== false,
          entrepriseId: produit.entrepriseId || this.findEntrepriseId(produit.entrepriseNom) || this.produitService.getCurrentEntrepriseId(),
          categorieId: produit.categorieId || this.findCategorieId(produit.categorieNom) || 0,
          taxeId: produit.taxeId || this.findTaxeId(produit.taxeNom) || 0
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger ce produit.');
        this.loading.set(false);
      }
    });
  }

  private cleanPayload(value: ProduitFormValue): ProduitRequest {
    return {
      nom: value.nom,
      code: value.code,
      prix: value.prix,
      barcode: value.barcode || undefined,
      imageUrl: value.imageUrl || undefined,
      stockMinimum: value.stockMinimum || 0,
      actif: value.actif,
      entrepriseId: value.entrepriseId,
      categorieId: value.categorieId || undefined,
      taxeId: value.taxeId || undefined
    };
  }

  private findEntrepriseId(name?: string): number | undefined {
    return this.entreprises().find((entreprise) => entreprise.nom === name)?.id;
  }

  private findCategorieId(name?: string): number | undefined {
    return this.categories().find((categorie) => categorie.nom === name)?.id;
  }

  private findTaxeId(name?: string): number | undefined {
    return this.taxes().find((taxe) => taxe.nom === name)?.id;
  }
}
