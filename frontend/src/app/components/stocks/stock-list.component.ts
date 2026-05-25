import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PermissionService } from '../../core/services/permission.service';
import { PointVente } from '../../models/point-vente.model';
import { Produit } from '../../models/produit.model';
import { Stock } from '../../models/stock.model';
import { NotificationService } from '../../services/notification.service';
import { PointVenteService } from '../../services/point-vente.service';
import { ProduitService } from '../../services/produit.service';
import { StockService } from '../../services/stock.service';

type StockStatus = 'healthy' | 'low' | 'out';
type MovementType = 'INPUT' | 'OUTPUT';

interface StockMovementFields {
  dateMouvement?: string;
  dateCreation?: string;
  dateModification?: string;
  createdAt?: string;
  updatedAt?: string;
  typeMouvement?: string;
  typeMovement?: string;
  mouvementType?: string;
  sens?: string;
}

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './stock-list.component.html',
  styleUrls: ['../produits/produit-list.component.scss', './stock-list.component.scss']
})
export class StockListComponent implements OnInit {
  stocks = signal<Stock[]>([]);
  produits = signal<Produit[]>([]);
  pointsVente = signal<PointVente[]>([]);
  loading = signal(false);
  error = signal('');
  searchTerm = '';
  selectedStock?: Stock;
  deleting = false;

  constructor(
    private stockService: StockService,
    private produitService: ProduitService,
    private pointVenteService: PointVenteService,
    private notificationService: NotificationService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      stocks: this.stockService.getAll(),
      produits: this.produitService.getAll(),
      pointsVente: this.pointVenteService.getVisibleForCurrentUser()
    }).subscribe({
      next: ({ stocks, produits, pointsVente }) => {
        this.stocks.set(stocks);
        this.produits.set(produits);
        this.pointsVente.set(pointsVente);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le stock depuis le backend.');
        this.loading.set(false);
      }
    });
  }

  get filteredStocks(): Stock[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.stocks();
    }

    return this.stocks().filter((stock) =>
      [
        this.getProduitName(stock),
        this.getProduitCode(stock),
        this.getPointVenteName(stock),
        this.getEntrepriseName(stock)
      ].some((value) => value.toLowerCase().includes(search))
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
  }

  get canModifyStocks(): boolean {
    return this.permissionService.canModifySync('stocks');
  }

  get totalItems(): number {
    return this.stocks().reduce((total, stock) => total + (stock.quantite ?? 0), 0);
  }

  get lowStockItems(): number {
    return this.stocks().filter((stock) => this.getStockStatus(stock) === 'low').length;
  }

  get outOfStockItems(): number {
    return this.stocks().filter((stock) => this.getStockStatus(stock) === 'out').length;
  }

  get stockValue(): number {
    return this.stocks().reduce((total, stock) => {
      const produit = this.getProduit(stock);
      return total + ((stock.quantite ?? 0) * (produit?.prix ?? 0));
    }, 0);
  }

  get recentStockMovements(): Stock[] {
    return [...this.stocks()]
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 5);
  }

  openDeleteModal(stock: Stock): void {
    if (!this.canModifyStocks) {
      return;
    }

    this.selectedStock = stock;
    this.error.set('');
  }

  closeDeleteModal(): void {
    if (this.deleting) {
      return;
    }

    this.selectedStock = undefined;
  }

  confirmDelete(): void {
    const stock = this.selectedStock;

    if (!stock?.id) {
      return;
    }

    this.deleting = true;
    this.stockService.delete(stock.id).subscribe({
      next: () => {
        this.stocks.update((stocks) => stocks.filter((item) => item.id !== stock.id));
        this.notificationService.deleted('Ligne de stock supprimee.');
        this.selectedStock = undefined;
        this.deleting = false;
      },
      error: () => {
        this.notificationService.error('La suppression du stock a echoue.');
        this.deleting = false;
      }
    });
  }

  getProduitName(stock: Stock): string {
    const produit = this.getProduit(stock);
    return produit?.nom || 'Produit inconnu';
  }

  getProduitCode(stock: Stock): string {
    const produit = this.getProduit(stock);
    return produit?.code || '-';
  }

  getPointVenteName(stock: Stock): string {
    const point = this.getPointVente(stock);
    return point?.nom || 'Point de vente inconnu';
  }

  getEntrepriseName(stock: Stock): string {
    const produit = this.getProduit(stock);
    return produit?.entrepriseNom || 'Entreprise non definie';
  }

  getStockMinimum(stock: Stock): number {
    const produit = this.getProduit(stock);
    return stock.seuilAlerte ?? produit?.stockMinimum ?? 0;
  }

  getStockStatus(stock: Stock): StockStatus {
    const quantity = stock.quantite ?? 0;
    const minimum = this.getStockMinimum(stock);

    if (quantity <= 0) {
      return 'out';
    }

    if (minimum > 0 && quantity <= minimum) {
      return 'low';
    }

    return 'healthy';
  }

  getStockStatusLabel(stock: Stock): string {
    const status = this.getStockStatus(stock);

    if (status === 'out') {
      return 'Rupture';
    }

    if (status === 'low') {
      return 'Stock faible';
    }

    return 'Correct';
  }

  getStockProgress(stock: Stock): number {
    const quantity = stock.quantite ?? 0;
    const minimum = this.getStockMinimum(stock);
    const reference = Math.max(quantity, minimum * 3, 1);

    return Math.min(100, Math.round((quantity / reference) * 100));
  }

  getStockValue(stock: Stock): number {
    const produit = this.getProduit(stock);
    return (stock.quantite ?? 0) * (produit?.prix ?? 0);
  }

  getMovementDate(stock: Stock): string {
    const movement = stock as Stock & StockMovementFields;
    const value = movement.dateMouvement
      || movement.dateModification
      || movement.dateCreation
      || movement.updatedAt
      || movement.createdAt;

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  getMovementType(stock: Stock): MovementType {
    const movement = stock as Stock & StockMovementFields;
    const value = (
      movement.typeMouvement
      || movement.typeMovement
      || movement.mouvementType
      || movement.sens
      || ''
    ).toUpperCase();

    if (value.includes('OUT') || value.includes('SORTIE') || value.includes('OUTPUT')) {
      return 'OUTPUT';
    }

    return 'INPUT';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      maximumFractionDigits: 3
    }).format(value);
  }

  private getProduit(stock: Stock): Produit | undefined {
    const produitId = stock.produitId ?? stock.produit?.id;
    return this.produits().find((produit) => produit.id === produitId) || stock.produit;
  }

  private getPointVente(stock: Stock): PointVente | undefined {
    const pointVenteId = stock.pointVenteId ?? stock.pointDeVente?.id;
    return this.pointsVente().find((point) => point.id === pointVenteId) || stock.pointDeVente;
  }
}
