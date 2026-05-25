import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Produit } from '../../models/produit.model';
import { ProduitService } from '../../services/produit.service';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './produit-detail.component.html',
  styleUrls: ['./produit-list.component.scss']
})
export class ProduitDetailComponent implements OnInit {
  produit = signal<Produit | undefined>(undefined);
  loading = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Produit introuvable.');
      return;
    }

    this.loading.set(true);
    this.produitService.getById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger ce produit.');
        this.loading.set(false);
      }
    });
  }
}
