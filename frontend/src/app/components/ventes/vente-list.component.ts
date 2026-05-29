import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Produit } from '../../models/produit.model';
import { Vente } from '../../models/vente.model';
import { NotificationService } from '../../services/notification.service';
import { ProduitService } from '../../services/produit.service';
import { VenteService } from '../../services/vente.service';

interface CartItem {
  produit: Produit;
  quantity: number;
}

@Component({
  selector: 'app-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="pos-shell">
      <main class="pos-catalog">
        <div class="category-strip">
          <button type="button" class="category-chip" [class.active]="selectedCategory === 'ALL'" (click)="selectCategory('ALL')">All Items</button>
          <button type="button" class="category-chip" *ngFor="let category of categories" [class.active]="selectedCategory === category" (click)="selectCategory(category)">{{ category }}</button>
        </div>

        <div *ngIf="error" class="pos-alert">{{ error }}</div>

        <div class="catalog-head">
          <div>
            <span class="eyebrow">Point of Sale</span>
            <h1>Open Register</h1>
          </div>
          <input class="catalog-search" type="search" name="venteSearch" [(ngModel)]="searchTerm" placeholder="Search products, SKUs, or barcodes...">
        </div>

        <div *ngIf="loading" class="state-panel">Chargement des produits...</div>

        <div class="product-grid" *ngIf="!loading">
          <button type="button" class="product-tile" *ngFor="let produit of filteredProduits" (click)="addToCart(produit)">
            <span class="product-image">
              <img *ngIf="produit.imageUrl; else productInitial" [src]="produit.imageUrl" [alt]="getProduitName(produit)">
              <ng-template #productInitial>{{ getProduitInitial(produit) }}</ng-template>
              <small *ngIf="produit.quantite !== undefined">{{ produit.quantite }} in stock</small>
            </span>
            <strong>{{ getProduitName(produit) }}</strong>
            <span>{{ formatMoney(produit.prix || 0) }}</span>
          </button>

          <div *ngIf="filteredProduits.length === 0" class="empty-catalog">Aucun produit disponible pour cette recherche.</div>
        </div>
      </main>

      <aside class="active-cart">
        <div class="cart-head">
          <div><span class="cart-icon" aria-hidden="true">Cart</span><h2>Active Cart</h2></div>
          <button type="button" class="cart-clear" (click)="clearCart()" [disabled]="cart.length === 0">Clear</button>
        </div>

        <button type="button" class="customer-button"><span aria-hidden="true">+</span>Assign Customer...</button>

        <div class="cart-items" *ngIf="cart.length > 0; else emptyCart">
          <article class="cart-row" *ngFor="let item of cart">
            <div><strong>{{ getProduitName(item.produit) }}</strong><span>{{ formatMoney(item.produit.prix || 0) }}</span></div>
            <div class="qty-control">
              <button type="button" (click)="decrement(item)">-</button>
              <b>{{ item.quantity }}</b>
              <button type="button" (click)="increment(item)">+</button>
            </div>
          </article>
        </div>

        <ng-template #emptyCart>
          <div class="cart-empty"><span aria-hidden="true">[]</span><p>Cart is empty.</p><small>Start adding products!</small></div>
        </ng-template>

        <div class="cart-summary">
          <div><span>Subtotal</span><strong>{{ formatMoney(subtotal) }}</strong></div>
          <div><span>Tax (VAT 16%)</span><strong>{{ formatMoney(tax) }}</strong></div>
          <div class="total-row"><span>Total</span><strong>{{ formatMoney(total) }}</strong></div>
        </div>

        <div class="cart-actions"><button type="button">Discount</button><button type="button">Note</button></div>

        <button type="button" class="pay-button" (click)="payNow()" [disabled]="cart.length === 0 || saving">
          {{ saving ? 'Saving...' : 'Pay Now' }} <span aria-hidden="true">&gt;</span>
        </button>
      </aside>
    </section>
  `,
  styles: [`
    .pos-shell { min-height: calc(100vh - 58px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 30vw); overflow: hidden; background: var(--app-surface-soft); border-top: 1px solid var(--app-border); }
    .pos-catalog { min-width: 0; display: flex; flex-direction: column; background: var(--app-surface-soft); }
    .category-strip { display: flex; gap: 0.55rem; padding: 0.8rem 1rem; overflow-x: auto; border-bottom: 1px solid rgba(189, 202, 185, 0.45); }
    .category-chip { min-height: 36px; padding: 0 1.25rem; border: 0; border-radius: 999px; background: var(--app-surface-container, #ebe7e7); color: var(--app-text); font-weight: 750; white-space: nowrap; }
    .category-chip.active { background: #1c1b1b; color: #fff; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18); }
    .catalog-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem 0; }
    .eyebrow { color: var(--app-primary); font-size: 0.74rem; font-weight: 850; }
    .catalog-head h1 { margin: 0.05rem 0 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.15rem; font-weight: 850; }
    .catalog-search { width: min(360px, 45%); min-height: 36px; border: 0; border-radius: 999px; padding: 0 0.95rem; background: var(--app-surface); color: var(--app-text); box-shadow: inset 0 0 0 1px rgba(110, 123, 108, 0.16); }
    .catalog-search:focus { outline: 0; box-shadow: 0 0 0 4px var(--app-primary-soft), inset 0 0 0 1px rgba(31, 168, 74, 0.52); }
    .product-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); align-content: start; gap: 1rem; padding: 1rem; overflow-y: auto; }
    .product-tile { display: grid; gap: 0.65rem; min-height: 242px; padding: 0.75rem; border: 0; border-radius: 1.5rem; background: var(--app-surface); color: var(--app-text); text-align: left; box-shadow: var(--app-shadow); cursor: pointer; transition: transform 0.16s ease, box-shadow 0.16s ease; }
    .product-tile:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(0, 92, 186, 0.14); }
    .product-image { position: relative; aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; border-radius: 1rem; background: radial-gradient(circle at 30% 20%, rgba(31, 168, 74, 0.16), transparent 35%), linear-gradient(135deg, #e8f5e9, #e0edff); color: var(--app-primary); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 900; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-image small { position: absolute; top: 0.55rem; right: 0.55rem; padding: 0.28rem 0.48rem; border-radius: 999px; background: var(--app-primary); color: #fff; font-size: 0.66rem; font-weight: 850; }
    .product-tile strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.92rem; }
    .product-tile > span:last-child { color: var(--app-primary); font-size: 1rem; font-weight: 850; }
    .active-cart { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; background: var(--app-surface); border-left: 1px solid var(--app-border); }
    .cart-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .cart-head > div { display: flex; align-items: center; gap: 0.65rem; }
    .cart-head h2 { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.18rem; font-weight: 850; }
    .cart-icon { color: var(--app-primary); font-size: 0.78rem; font-weight: 900; text-transform: uppercase; }
    .cart-clear, .customer-button, .cart-actions button { border: 0; border-radius: 1rem; background: var(--app-surface-soft); color: var(--app-text); font-weight: 750; }
    .cart-clear { padding: 0.35rem 0.6rem; background: transparent; }
    .customer-button { min-height: 48px; display: flex; align-items: center; gap: 0.6rem; padding: 0 1rem; text-align: left; }
    .cart-items { display: grid; gap: 0.65rem; overflow-y: auto; }
    .cart-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem; border: 1px solid rgba(189, 202, 185, 0.42); border-radius: 1rem; background: var(--app-surface-soft); }
    .cart-row strong, .cart-row span { display: block; }
    .cart-row strong { font-size: 0.86rem; }
    .cart-row span { margin-top: 0.2rem; color: var(--app-primary); font-weight: 800; }
    .qty-control { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.25rem; border-radius: 999px; background: var(--app-surface); }
    .qty-control button { width: 1.6rem; height: 1.6rem; border: 0; border-radius: 50%; background: var(--app-surface-container, #ebe7e7); color: var(--app-text); font-weight: 900; }
    .cart-empty { flex: 1; min-height: 220px; display: grid; place-content: center; text-align: center; color: var(--app-muted); }
    .cart-empty span { font-size: 1.8rem; opacity: 0.65; }
    .cart-empty p { margin: 0.35rem 0 0; font-size: 1rem; }
    .cart-summary { margin-top: auto; display: grid; gap: 0.65rem; padding-top: 1rem; border-top: 1px solid rgba(189, 202, 185, 0.5); }
    .cart-summary > div { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .cart-summary strong { font-weight: 750; }
    .total-row span, .total-row strong { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.28rem; font-weight: 900; }
    .total-row strong { color: var(--app-primary); }
    .cart-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; }
    .cart-actions button { min-height: 64px; }
    .pay-button { min-height: 58px; display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; border: 0; border-radius: 1.25rem; background: var(--app-gradient); color: #fff; font-size: 1rem; font-weight: 850; box-shadow: 0 18px 35px rgba(0, 92, 186, 0.22); }
    .pay-button:disabled { opacity: 0.55; cursor: not-allowed; }
    .pos-alert, .state-panel, .empty-catalog { margin: 1rem; padding: 0.9rem 1rem; border-radius: 1rem; background: var(--app-surface); color: var(--app-muted); box-shadow: var(--app-shadow); }
    @media (max-width: 1180px) { .pos-shell { grid-template-columns: 1fr; } .active-cart { display: none; } }
    @media (max-width: 760px) { .catalog-head { align-items: stretch; flex-direction: column; } .catalog-search { width: 100%; } }
  `]
})
export class VenteListComponent implements OnInit {
  produits: Produit[] = [];
  cart: CartItem[] = [];
  selectedCategory = 'ALL';
  searchTerm = '';
  loading = false;
  saving = false;
  error = '';

  constructor(
    private produitService: ProduitService,
    private venteService: VenteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.error = '';

    this.produitService.getAll().subscribe({
      next: (produits) => {
        this.produits = produits.filter((produit) => produit.actif !== false);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les produits.';
        this.loading = false;
      }
    });
  }

  get categories(): string[] {
    return Array.from(new Set(this.produits.map((produit) => produit.categorieNom).filter(Boolean) as string[])).slice(0, 8);
  }

  get filteredProduits(): Produit[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.produits.filter((produit) => {
      const categoryMatch = this.selectedCategory === 'ALL' || produit.categorieNom === this.selectedCategory;
      const searchMatch = !query || [produit.nom, produit.code, produit.barcode || '', produit.categorieNom || ''].some((value) => value.toLowerCase().includes(query));
      return categoryMatch && searchMatch;
    });
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.produit.prix || 0) * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0.16;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  addToCart(produit: Produit): void {
    const item = this.cart.find((cartItem) => cartItem.produit.id === produit.id);
    if (item) {
      item.quantity += 1;
      return;
    }
    this.cart = [...this.cart, { produit, quantity: 1 }];
  }

  increment(item: CartItem): void {
    item.quantity += 1;
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) {
      this.cart = this.cart.filter((cartItem) => cartItem !== item);
      return;
    }
    item.quantity -= 1;
  }

  clearCart(): void {
    this.cart = [];
  }

  payNow(): void {
    if (this.cart.length === 0 || this.saving) {
      return;
    }

    const vente: Vente = {
      dateVente: new Date().toISOString().slice(0, 10),
      montantTotal: this.total,
      statut: 'PAYEE'
    };

    this.saving = true;
    this.venteService.create(vente).subscribe({
      next: () => {
        this.notificationService.success('Vente enregistree.');
        this.cart = [];
        this.saving = false;
      },
      error: () => {
        this.notificationService.error('Paiement impossible.');
        this.saving = false;
      }
    });
  }

  getProduitName(produit: Produit): string {
    return produit.nom || produit.code || `Produit #${produit.id}`;
  }

  getProduitInitial(produit: Produit): string {
    return this.getProduitName(produit).charAt(0).toUpperCase();
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value || 0);
  }
}
