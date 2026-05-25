import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CategorieService } from '../../services/categorie.service';
import { EntrepriseService } from '../../services/entreprise.service';
import { PaiementService } from '../../services/paiement.service';
import { ProduitService } from '../../services/produit.service';
import { StockService } from '../../services/stock.service';
import { TaxeService } from '../../services/taxe.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { VenteService } from '../../services/vente.service';
import { Paiement } from '../../models/paiement.model';
import { Produit } from '../../models/produit.model';
import { Stock } from '../../models/stock.model';
import { Vente } from '../../models/vente.model';

type ThemeColor = 'blue' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
type TransactionStatus = 'success' | 'warning' | 'pending';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  hint: string;
  color: ThemeColor;
  icon: string;
  trend: 'up' | 'down';
}

interface RevenuePoint {
  month: string;
  value: number;
  height: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down';
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  background: string;
}

interface StockAlert {
  product: string;
  pointVente: string;
  quantity: number;
  threshold: number;
  severity: 'critical' | 'warning';
}

interface TransactionRow {
  id: string;
  date: string;
  channel: string;
  amount: number;
  status: TransactionStatus;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;
  error = '';

  kpis: KpiCard[] = [];
  revenuePoints: RevenuePoint[] = [];
  revenueLinePath = '';
  revenueAreaPath = '';
  revenueAxisLabels: number[] = [];
  salesBars: Array<{ label: string; value: number; height: number }> = [];
  salesAxisLabels: number[] = [];
  paymentMix: DonutSlice[] = [];
  salesMix: DonutSlice[] = [];
  stockAlerts: StockAlert[] = [];
  topProducts: TopProduct[] = [];
  latestTransactions: TransactionRow[] = [];
  currentDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  chartMonths = this.getLastMonths(6);

  constructor(
    private produitService: ProduitService,
    private entrepriseService: EntrepriseService,
    private utilisateurService: UtilisateurService,
    private categorieService: CategorieService,
    private taxeService: TaxeService,
    private stockService: StockService,
    private venteService: VenteService,
    private paiementService: PaiementService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  getStatusClass(status: TransactionStatus): string {
    return `status-${status}`;
  }

  getThemeClass(color: ThemeColor): string {
    return `theme-${color}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      produits: this.safeList(this.produitService.getAll()),
      entreprises: this.safeList(this.entrepriseService.getVisibleForCurrentUser()),
      utilisateurs: this.safeList(this.utilisateurService.getVisibleForCurrentUser()),
      categories: this.safeList(this.categorieService.getAll()),
      taxes: this.safeList(this.taxeService.getAll()),
      stocks: this.safeList(this.stockService.getAll()),
      ventes: this.safeList(this.venteService.getAll()),
      paiements: this.safeList(this.paiementService.getAll())
    }).subscribe({
      next: (data) => {
        const totalRevenue = this.sumValues(data.ventes, 'montantTotal');
        const paidRevenue = this.sumValues(data.paiements, 'montant');
        const stockUnits = this.sumValues(data.stocks, 'quantite');
        const lowStockCount = data.stocks.filter((stock) => this.isLowStock(stock)).length;
        const conversionRate = data.ventes.length ? Math.round((data.paiements.length / data.ventes.length) * 100) : 0;
        const revenueTrend = this.getMonthlyTrend(data.ventes, 'montantTotal');
        const salesTrend = this.getMonthlyTrend(data.ventes);

        this.kpis = [
          { label: 'Revenu total', value: this.formatCurrency(totalRevenue), change: revenueTrend, hint: 'vs mois precedent', color: 'emerald', icon: '$', trend: this.toTrend(revenueTrend) },
          { label: 'Ventes totales', value: String(data.ventes.length), change: salesTrend, hint: 'vs mois precedent', color: 'blue', icon: 'V', trend: this.toTrend(salesTrend) },
          { label: 'Produits en stock', value: String(stockUnits), change: `${conversionRate}% paye`, hint: 'encaissements', color: 'indigo', icon: 'P', trend: 'down' },
          { label: 'Alertes stock faible', value: String(lowStockCount), change: `+${lowStockCount}`, hint: 'vs seuils', color: 'amber', icon: '!', trend: lowStockCount ? 'down' : 'up' }
        ];

        this.revenuePoints = this.buildRevenuePoints(data.ventes);
        this.revenueAxisLabels = this.buildAxisLabels(this.revenuePoints.map((point) => point.value));
        this.revenueLinePath = this.buildLinePath(this.revenuePoints);
        this.revenueAreaPath = this.revenueLinePath ? `${this.revenueLinePath} L960 300 L0 300 Z` : '';
        this.salesBars = this.buildSalesBars(data.ventes);
        this.salesAxisLabels = this.buildAxisLabels(this.salesBars.map((item) => item.value));
        this.paymentMix = this.buildPaymentMix(data.paiements);
        this.salesMix = this.buildSalesMix(data.ventes);
        this.stockAlerts = this.buildStockAlerts(data.stocks, data.produits);
        this.topProducts = this.buildTopProducts(data.produits, data.stocks);
        this.latestTransactions = this.buildTransactions(data.ventes, data.paiements);

        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le dashboard depuis le backend.';
        this.loading = false;
      }
    });
  }

  private safeList<T>(request$: Observable<T[]>): Observable<T[]> {
    return request$.pipe(catchError(() => of([])));
  }

  private sumValues<T>(items: T[], key: keyof T): number {
    return items.reduce((total, item) => {
      const value = item[key];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  private buildRevenuePoints(ventes: Vente[]): RevenuePoint[] {
    const totals = new Array<number>(this.chartMonths.length).fill(0);
    const currentMonthIndex = this.chartMonths.length - 1;

    ventes.forEach((vente) => {
      const date = vente.dateVente ? new Date(vente.dateVente) : undefined;
      const index = date && !Number.isNaN(date.getTime())
        ? this.chartMonths.findIndex((month) => month.month === date.getMonth() && month.year === date.getFullYear())
        : currentMonthIndex;
      if (index >= 0 && index < totals.length) {
        totals[index] += vente.montantTotal ?? 0;
      }
    });

    const max = Math.max(...totals, 1);

    return totals.map((value, index) => ({
      month: this.chartMonths[index].label,
      value,
      height: Math.round((value / max) * 100)
    }));
  }

  private buildSalesBars(ventes: Vente[]): Array<{ label: string; value: number; height: number }> {
    const currentMonthIndex = this.chartMonths.length - 1;
    const values = this.chartMonths.map((month) => ({ label: month.label, value: 0 }));

    ventes.forEach((vente) => {
      const date = vente.dateVente ? new Date(vente.dateVente) : undefined;
      const index = date && !Number.isNaN(date.getTime())
        ? this.chartMonths.findIndex((month) => month.month === date.getMonth() && month.year === date.getFullYear())
        : currentMonthIndex;

      if (index >= 0 && index < values.length) {
        values[index].value += 1;
      }
    });

    const max = Math.max(...values.map((item) => item.value), 1);

    return values.map((item) => ({
      ...item,
      height: Math.round((item.value / max) * 100)
    }));
  }

  private buildPaymentMix(paiements: Paiement[]): DonutSlice[] {
    const counts = paiements.reduce<Record<string, number>>((acc, paiement) => {
      const mode = paiement.modePaiement || 'Autre';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

    return this.toDonutSlices(counts, ['#1d4ed8', '#0891b2', '#22c55e', '#f59e0b']);
  }

  private buildSalesMix(ventes: Vente[]): DonutSlice[] {
    const counts = ventes.reduce<Record<string, number>>((acc, vente) => {
      const status = vente.statut || 'Validee';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return this.toDonutSlices(counts, ['#2563eb', '#06b6d4', '#ef4444', '#64748b']);
  }

  private toDonutSlices(source: Record<string, number>, colors: string[]): DonutSlice[] {
    if (!Object.keys(source).length) {
      return [];
    }

    const total = Object.values(source).reduce((sum, value) => sum + value, 0) || 1;
    let start = 0;

    return Object.entries(source).map(([label, value], index) => {
      const percent = Math.round((value / total) * 100);
      const end = start + percent;
      const color = colors[index % colors.length];
      const background = `conic-gradient(${color} ${start}% ${end}%, #e5eefb ${end}% 100%)`;
      start = end;

      return { label, value: percent, color, background };
    });
  }

  private buildStockAlerts(stocks: Stock[], produits: Produit[]): StockAlert[] {
    const productNames = new Map(produits.map((produit) => [produit.id, produit.nom]));
    const alerts = stocks.filter((stock) => this.isLowStock(stock)).map((stock) => ({
      product: productNames.get(stock.produitId) || `Produit #${stock.produitId ?? '-'}`,
      pointVente: `Point vente #${stock.pointVenteId ?? '-'}`,
      quantity: stock.quantite ?? 0,
      threshold: stock.seuilAlerte ?? 0,
      severity: (stock.quantite ?? 0) <= Math.max(1, Math.round((stock.seuilAlerte ?? 0) / 2)) ? 'critical' as const : 'warning' as const
    }));

    return alerts.slice(0, 5);
  }

  private buildTransactions(ventes: Vente[], paiements: Paiement[]): TransactionRow[] {
    const paymentsBySale = new Map(paiements.map((paiement) => [paiement.venteId, paiement]));

    return [...ventes]
      .sort((a, b) => this.toTimestamp(b.dateVente) - this.toTimestamp(a.dateVente))
      .slice(0, 6)
      .map((vente) => {
        const paiement = paymentsBySale.get(vente.id);
        return {
          id: `VENT-${vente.id ?? '000'}`,
          date: vente.dateVente || paiement?.datePaiement || '',
          channel: paiement?.modePaiement || 'Vente directe',
          amount: vente.montantTotal ?? paiement?.montant ?? 0,
          status: this.resolveStatus(vente.statut || paiement?.statut)
        };
      });
  }

  private isLowStock(stock: Stock): boolean {
    return (stock.quantite ?? 0) <= (stock.seuilAlerte ?? 0);
  }

  private resolveStatus(status?: string): TransactionStatus {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('annul') || normalized.includes('echec')) {
      return 'warning';
    }
    if (normalized.includes('attente') || normalized.includes('cours')) {
      return 'pending';
    }
    return 'success';
  }

  private toTimestamp(date?: string): number {
    const parsed = date ? new Date(date).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toTrend(value: string): 'up' | 'down' {
    return value.trim().startsWith('-') ? 'down' : 'up';
  }

  private buildLinePath(points: RevenuePoint[]): string {
    if (!points.length || points.every((point) => point.value === 0)) {
      return '';
    }

    const maxValue = Math.max(...points.map((point) => point.value), 1);
    const widthStep = points.length > 1 ? 960 / (points.length - 1) : 960;
    const coordinates = points.map((point, index) => {
      const x = Math.round(index * widthStep);
      const y = Math.round(280 - ((point.value / maxValue) * 230));
      return `${x} ${y}`;
    });

    return `M${coordinates.join(' L')}`;
  }

  private buildTopProducts(produits: Produit[], stocks: Stock[]): TopProduct[] {
    const stockByProduct = stocks.reduce<Record<number, number>>((acc, stock) => {
      if (stock.produitId) {
        acc[stock.produitId] = (acc[stock.produitId] || 0) + (stock.quantite ?? 0);
      }
      return acc;
    }, {});

    return [...produits]
      .sort((a, b) => ((b.prix || 0) * (stockByProduct[b.id || 0] || b.quantite || 0)) - ((a.prix || 0) * (stockByProduct[a.id || 0] || a.quantite || 0)))
      .slice(0, 5)
      .map((produit, index) => {
        const sales = stockByProduct[produit.id || 0] || produit.quantite || 0;
        return {
          name: produit.nom,
          sales,
          revenue: (produit.prix || 0) * sales,
          trend: index === 2 ? 'down' : 'up'
        };
      });
  }

  private getMonthlyTrend(ventes: Vente[], key?: keyof Vente): string {
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const current = this.getMonthValue(ventes, currentMonth, key);
    const previous = this.getMonthValue(ventes, previousMonth, key);

    if (!previous) {
      return current ? '+100%' : '0%';
    }

    const delta = Math.round(((current - previous) / previous) * 100);
    return `${delta >= 0 ? '+' : ''}${delta}%`;
  }

  private getMonthValue(ventes: Vente[], month: number, key?: keyof Vente): number {
    return ventes.reduce((total, vente) => {
      const date = vente.dateVente ? new Date(vente.dateVente) : undefined;
      if (!date || Number.isNaN(date.getTime()) || date.getMonth() !== month) {
        return total;
      }

      if (!key) {
        return total + 1;
      }

      const value = vente[key];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  private buildAxisLabels(values: number[]): number[] {
    const max = Math.max(...values, 0);
    if (!max) {
      return [0, 0, 0, 0, 0];
    }

    const step = Math.ceil(max / 4);
    return [step * 4, step * 3, step * 2, step, 0];
  }

  private getLastMonths(count: number): Array<{ label: string; month: number; year: number }> {
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const now = new Date();

    return Array.from({ length: count }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
      const label = formatter.format(date).replace('.', '');

      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        month: date.getMonth(),
        year: date.getFullYear()
      };
    });
  }
}
