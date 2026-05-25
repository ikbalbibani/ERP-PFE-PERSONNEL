import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PointVente } from '../../models/point-vente.model';
import { PointVenteService } from '../../services/point-vente.service';

@Component({
  selector: 'app-point-vente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './point-vente-detail.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class PointVenteDetailComponent implements OnInit {
  pointVente = signal<PointVente | undefined>(undefined);
  loading = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private pointVenteService: PointVenteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
console.log('ID du point de vente à charger :', id);
    if (!id) {
      this.error.set('Point de vente introuvable.');
      return;
    }

    this.loading.set(true);
    this.pointVenteService.getById(id).subscribe({
      next: (pointVente) => {
        console
          .log('Point de vente chargé :', pointVente,"id entrp",pointVente.entrepriseId);
        this.pointVente.set(pointVente);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger ce point de vente.');
        this.loading.set(false);
      }
    });
  }
}
