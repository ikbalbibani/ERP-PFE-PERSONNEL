import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Paiement } from '../../models/paiement.model';
import { PaiementService } from '../../services/paiement.service';

@Component({
  selector: 'app-paiement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="crud-page"><div class="page-head"><div><h1>Paiements</h1><p>Gestion des paiements</p></div></div>
      <div *ngIf="error" class="notification notification--error">{{ error }}</div>
      <div class="crud-grid"><form class="data-panel" (ngSubmit)="save()"><h2>{{ selectedId ? 'Modifier' : 'Ajouter' }}</h2>
        <label>Vente ID<input class="form-control" type="number" name="venteId" [(ngModel)]="form.venteId" required></label>
        <label>Montant<input class="form-control" type="number" name="montant" [(ngModel)]="form.montant" required></label>
        <label>Mode paiement<input class="form-control" name="modePaiement" [(ngModel)]="form.modePaiement"></label>
        <label>Date paiement<input class="form-control" type="date" name="datePaiement" [(ngModel)]="form.datePaiement"></label>
        <label>Statut<input class="form-control" name="statut" [(ngModel)]="form.statut"></label>
        <div class="actions"><button class="btn btn-outline-secondary" type="button" (click)="reset()">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <article class="data-panel"><div *ngIf="loading">Chargement...</div><table *ngIf="!loading" class="table align-middle"><thead><tr><th>Vente</th><th>Montant</th><th>Mode</th><th>Statut</th><th class="text-end">Actions</th></tr></thead><tbody><tr *ngFor="let item of paiements"><td>{{ item.venteId }}</td><td>{{ item.montant }}</td><td>{{ item.modePaiement }}</td><td>{{ item.statut }}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary" (click)="edit(item)">Modifier</button><button class="btn btn-sm btn-outline-danger ms-2" (click)="delete(item)">Supprimer</button></td></tr></tbody></table></article>
      </div></section>
  `,
  styleUrls: ['../../shared/components/admin-page/admin-page.component.scss']
})
export class PaiementListComponent implements OnInit {
  paiements: Paiement[] = [];
  form: Paiement = { venteId: 0, montant: 0, modePaiement: '', datePaiement: '', statut: 'PAYE' };
  selectedId?: number | string;
  loading = false;
  error = '';
  constructor(private paiementService: PaiementService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.paiementService.getAll().subscribe({ next: (data) => { this.paiements = data; this.loading = false; }, error: () => { this.error = 'Impossible de charger les paiements.'; this.loading = false; } }); }
  save(): void { const request$ = this.selectedId ? this.paiementService.update(this.selectedId, this.form) : this.paiementService.create(this.form); request$.subscribe({ next: () => { this.reset(); this.load(); }, error: () => this.error = 'Enregistrement impossible.' }); }
  edit(item: Paiement): void { this.selectedId = item.id; this.form = { ...item }; }
  delete(item: Paiement): void { if (!item.id || !confirm('Supprimer ce paiement ?')) return; this.paiementService.delete(item.id).subscribe({ next: () => this.load(), error: () => this.error = 'Suppression impossible.' }); }
  reset(): void { this.selectedId = undefined; this.form = { venteId: 0, montant: 0, modePaiement: '', datePaiement: '', statut: 'PAYE' }; }
}
