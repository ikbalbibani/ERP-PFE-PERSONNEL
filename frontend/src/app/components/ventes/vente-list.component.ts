import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Vente } from '../../models/vente.model';
import { VenteService } from '../../services/vente.service';

@Component({
  selector: 'app-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="crud-page"><div class="page-head"><div><h1>Ventes</h1><p>Gestion des ventes</p></div></div>
      <div *ngIf="error" class="notification notification--error">{{ error }}</div>
      <div class="crud-grid"><form class="data-panel" (ngSubmit)="save()"><h2>{{ selectedId ? 'Modifier' : 'Ajouter' }}</h2>
        <label>Date<input class="form-control" type="date" name="dateVente" [(ngModel)]="form.dateVente"></label>
        <label>Montant total<input class="form-control" type="number" name="montantTotal" [(ngModel)]="form.montantTotal" required></label>
        <label>Client ID<input class="form-control" type="number" name="clientId" [(ngModel)]="form.clientId"></label>
        <label>Point de vente ID<input class="form-control" type="number" name="pointVenteId" [(ngModel)]="form.pointVenteId"></label>
        <label>Statut<input class="form-control" name="statut" [(ngModel)]="form.statut"></label>
        <div class="actions"><button class="btn btn-outline-secondary" type="button" (click)="reset()">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <article class="data-panel"><div *ngIf="loading">Chargement...</div><table *ngIf="!loading" class="table align-middle"><thead><tr><th>Date</th><th>Montant</th><th>Statut</th><th class="text-end">Actions</th></tr></thead><tbody><tr *ngFor="let item of ventes"><td>{{ item.dateVente }}</td><td>{{ item.montantTotal }}</td><td>{{ item.statut }}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary" (click)="edit(item)">Modifier</button><button class="btn btn-sm btn-outline-danger ms-2" (click)="delete(item)">Supprimer</button></td></tr></tbody></table></article>
      </div></section>
  `,
  styleUrls: ['../../shared/components/admin-page/admin-page.component.scss']
})
export class VenteListComponent implements OnInit {
  ventes: Vente[] = [];
  form: Vente = { dateVente: '', montantTotal: 0, clientId: 0, pointVenteId: 0, statut: 'EN_COURS' };
  selectedId?: number | string;
  loading = false;
  error = '';
  constructor(private venteService: VenteService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.venteService.getAll().subscribe({ next: (data) => { this.ventes = data; this.loading = false; }, error: () => { this.error = 'Impossible de charger les ventes.'; this.loading = false; } }); }
  save(): void { const request$ = this.selectedId ? this.venteService.update(this.selectedId, this.form) : this.venteService.create(this.form); request$.subscribe({ next: () => { this.reset(); this.load(); }, error: () => this.error = 'Enregistrement impossible.' }); }
  edit(item: Vente): void { this.selectedId = item.id; this.form = { ...item }; }
  delete(item: Vente): void { if (!item.id || !confirm('Supprimer cette vente ?')) return; this.venteService.delete(item.id).subscribe({ next: () => this.load(), error: () => this.error = 'Suppression impossible.' }); }
  reset(): void { this.selectedId = undefined; this.form = { dateVente: '', montantTotal: 0, clientId: 0, pointVenteId: 0, statut: 'EN_COURS' }; }
}
