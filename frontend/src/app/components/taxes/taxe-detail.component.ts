import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Taxe } from '../../models/taxe.model';
import { TaxeService } from '../../services/taxe.service';

@Component({
  selector: 'app-taxe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './taxe-detail.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class TaxeDetailComponent implements OnInit {
  taxe?: Taxe;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private taxeService: TaxeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Taxe introuvable.';
      return;
    }

    this.loading = true;
    this.taxeService.getById(id).subscribe({
      next: (taxe) => {
        this.taxe = taxe;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette taxe.';
        this.loading = false;
      }
    });
  }
}
