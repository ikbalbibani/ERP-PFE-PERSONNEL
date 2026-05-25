import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Categorie } from '../../models/categorie.model';
import { CategorieService } from '../../services/categorie.service';

@Component({
  selector: 'app-categorie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categorie-detail.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class CategorieDetailComponent implements OnInit {
  categorie?: Categorie;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Categorie introuvable.';
      return;
    }

    this.loading = true;
    this.categorieService.getCategorieById(id).subscribe({
      next: (categorie) => {
        this.categorie = categorie;
        this.loading = false;
      },
      error: () => {
        this.error = 'Categorie introuvable ou impossible a charger.';
        this.loading = false;
      }
    });
  }
}
