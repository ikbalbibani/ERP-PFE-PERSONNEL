import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Entreprise } from '../../models/entreprise.model';
import { EntrepriseService } from '../../services/entreprise.service';

@Component({
  selector: 'app-entreprise-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entreprise-detail.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class EntrepriseDetailComponent implements OnInit {
  entreprise = signal<Entreprise | undefined>(undefined);
  loading = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Entreprise introuvable.');
      return;
    }

    this.loading.set(true);
    this.entrepriseService.getById(id).subscribe({
      next: (entreprise) => {
        this.entreprise.set(entreprise);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger cette entreprise.');
        this.loading.set(false);
      }
    });
  }
}
