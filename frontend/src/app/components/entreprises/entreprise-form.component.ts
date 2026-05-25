import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EntrepriseForm } from '../../models/entreprise.model';
import { TypeEntreprise } from '../../models/categorie.model';
import { EntrepriseService } from '../../services/entreprise.service';

@Component({
  selector: 'app-entreprise-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './entreprise-form.component.html',
  styleUrls: ['../produits/produit-list.component.scss']
})
export class EntrepriseFormComponent implements OnInit {
  types: TypeEntreprise[] = ['PHARMACIE', 'BOUTIQUE', 'RESTAURANT'];
  form: EntrepriseForm = this.getEmptyForm();
  loading = false;
  saving = false;
  error = '';
  private entrepriseId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.entrepriseId = this.route.snapshot.paramMap.get('id') || undefined;

    if (this.entrepriseId) {
      this.loadEntreprise(this.entrepriseId);
    }
  }

  get isEditMode(): boolean {
    return Boolean(this.entrepriseId);
  }

  save(): void {
    this.saving = true;
    this.error = '';

    const request$ = this.entrepriseId
      ? this.entrepriseService.update(this.entrepriseId, this.form)
      : this.entrepriseService.create(this.form);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/entreprises']);
      },
      error: () => {
        this.error = 'Enregistrement de l entreprise impossible.';
        this.saving = false;
      }
    });
  }

  private loadEntreprise(id: string): void {
    this.loading = true;
    this.entrepriseService.getById(id).subscribe({
      next: (entreprise) => {
        this.form = {
          nom: entreprise.nom,
          code: entreprise.code || '',
          description: entreprise.description || '',
          typeEntreprise: entreprise.typeEntreprise || 'BOUTIQUE',
          email: entreprise.email || '',
          telephone: entreprise.telephone || '',
          siteWeb: entreprise.siteWeb || '',
          adresse: entreprise.adresse || '',
          ville: entreprise.ville || '',
          pays: entreprise.pays || '',
          devise: entreprise.devise || 'TND',
          langue: entreprise.langue || 'fr',
          matriculeFiscal: entreprise.matriculeFiscal || '',
          registreCommerce: entreprise.registreCommerce || '',
          logoUrl: entreprise.logoUrl || '',
          actif: entreprise.actif !== false
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette entreprise.';
        this.loading = false;
      }
    });
  }

  private getEmptyForm(): EntrepriseForm {
    return {
      nom: '',
      code: '',
      description: '',
      typeEntreprise: 'BOUTIQUE',
      email: '',
      telephone: '',
      siteWeb: '',
      adresse: '',
      ville: '',
      pays: 'Tunisie',
      devise: 'TND',
      langue: 'fr',
      matriculeFiscal: '',
      registreCommerce: '',
      logoUrl: '',
      actif: true
    };
  }
}
