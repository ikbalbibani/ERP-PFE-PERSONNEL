import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Entreprise } from '../../models/entreprise.model';
import { PointVente } from '../../models/point-vente.model';
import { Produit } from '../../models/produit.model';
import { Stock } from '../../models/stock.model';
import { EntrepriseService } from '../../services/entreprise.service';
import { NotificationService } from '../../services/notification.service';
import { PointVenteService } from '../../services/point-vente.service';
import { ProduitService } from '../../services/produit.service';
import { StockService } from '../../services/stock.service';

interface StockFormValue {
  entrepriseId: number;
  produitId: number;
  pointVenteId: number;
  quantite: number;
}

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './stock-form.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class StockFormComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  entreprises = signal<Entreprise[]>([]);
  produits = signal<Produit[]>([]);
  pointsVente = signal<PointVente[]>([]);
  private stockId?: string;

  stockForm = this.fb.nonNullable.group({
    entrepriseId: [0, [Validators.required, Validators.min(1)]],
    produitId: [0, [Validators.required, Validators.min(1)]],
    pointVenteId: [0, [Validators.required, Validators.min(1)]],
    quantite: [0, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private produitService: ProduitService,
    private pointVenteService: PointVenteService,
    private entrepriseService: EntrepriseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.stockId = this.route.snapshot.paramMap.get('id') || undefined;
    this.loadReferences();
  }

  get isEditMode(): boolean {
    return Boolean(this.stockId);
  }

  get filteredProduits(): Produit[] {
    const entrepriseId = this.stockForm.controls.entrepriseId.value;
    return this.produits().filter((produit) => !entrepriseId || produit.entrepriseId === entrepriseId);
  }

  get filteredPointsVente(): PointVente[] {
    const entrepriseId = this.stockForm.controls.entrepriseId.value;
    return this.pointsVente().filter((point) => !entrepriseId || point.entrepriseId === entrepriseId);
  }

  onEntrepriseChange(): void {
    this.stockForm.patchValue({
      produitId: 0,
      pointVenteId: 0
    });
  }

  saveStock(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const value = this.stockForm.getRawValue();
    if (!this.isSameEntreprise(value)) {
      this.error.set('Le produit et le point de vente doivent appartenir a la meme entreprise.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const stock = this.cleanPayload(value);
    const request$ = this.stockId
      ? this.stockService.update(this.stockId, stock)
      : this.stockService.create(stock);

    request$.subscribe({
      next: () => {
        this.notificationService.success(this.stockId ? 'Stock modifie avec succes.' : 'Stock ajoute avec succes.');
        this.saving.set(false);
        this.router.navigate(['/stocks']);
      },
      error: () => {
        this.error.set('Impossible d enregistrer le stock.');
        this.notificationService.error('Impossible d enregistrer le stock.');
        this.saving.set(false);
      }
    });
  }

  private loadReferences(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      entreprises: this.entrepriseService.getVisibleForCurrentUser(),
      produits: this.produitService.getAll(),
      pointsVente: this.pointVenteService.getVisibleForCurrentUser()
    }).subscribe({
      next: ({ entreprises, produits, pointsVente }) => {
        this.entreprises.set(this.buildEntreprises(entreprises, produits, pointsVente));
        this.produits.set(produits);
        this.pointsVente.set(pointsVente);

        if (this.stockId) {
          this.loadStock(this.stockId);
        } else {
          this.stockForm.patchValue({ entrepriseId: this.entreprises()[0]?.id || 0 });
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger les listes entreprise, produit et point de vente.');
        this.loading.set(false);
      }
    });
  }

  private loadStock(id: string): void {
    this.stockService.getById(id).subscribe({
      next: (stock) => {
        const produitId = stock.produitId ?? stock.produit?.id ?? 0;
        const pointVenteId = stock.pointVenteId ?? stock.pointDeVente?.id ?? 0;
        const produit = this.produits().find((item) => item.id === produitId) || stock.produit;

        this.stockForm.patchValue({
          entrepriseId: produit?.entrepriseId || 0,
          produitId,
          pointVenteId,
          quantite: stock.quantite ?? 0
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger ce stock.');
        this.loading.set(false);
      }
    });
  }

  private cleanPayload(value: StockFormValue): Stock {
    return {
      produitId: value.produitId,
      pointVenteId: value.pointVenteId,
      quantite: value.quantite
    };
  }

  private isSameEntreprise(value: StockFormValue): boolean {
    const produit = this.produits().find((item) => item.id === value.produitId);
    const point = this.pointsVente().find((item) => item.id === value.pointVenteId);

    return Boolean(
      produit &&
      point &&
      produit.entrepriseId === value.entrepriseId &&
      point.entrepriseId === value.entrepriseId
    );
  }

  private buildEntreprises(entreprises: Entreprise[], produits: Produit[], pointsVente: PointVente[]): Entreprise[] {
    const byId = new Map<number, Entreprise>();

    entreprises.forEach((entreprise) => {
      if (entreprise.id) {
        byId.set(entreprise.id, entreprise);
      }
    });

    produits.forEach((produit) => {
      if (produit.entrepriseId && !byId.has(produit.entrepriseId)) {
        byId.set(produit.entrepriseId, { id: produit.entrepriseId, nom: produit.entrepriseNom || `Entreprise #${produit.entrepriseId}` });
      }
    });

    pointsVente.forEach((point) => {
      if (point.entrepriseId && !byId.has(point.entrepriseId)) {
        byId.set(point.entrepriseId, { id: point.entrepriseId, nom: point.entrepriseNom || `Entreprise #${point.entrepriseId}` });
      }
    });

    return Array.from(byId.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }
}
