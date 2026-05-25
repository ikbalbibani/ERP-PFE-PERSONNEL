import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Entreprise } from '../../../models/entreprise.model';
import { Role } from '../../../models/role.model';
import { Utilisateur } from '../../../models/utilisateur.model';
import { EntrepriseService } from '../../../services/entreprise.service';
import { NotificationService } from '../../../services/notification.service';
import { RoleService } from '../../../services/role.service';
import { UtilisateurService } from '../../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './utilisateur-form.component.html',
  styleUrls: ['../../produits/produit-list.component.scss']
})
export class UtilisateurFormComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  entreprises: Entreprise[] = [];
  form: Utilisateur = this.createEmptyForm();
  loading = false;
  loadingReferences = false;
  loadingEntreprises = false;
  saving = false;
  error = '';
  entrepriseError = '';
  confirmPassword = '';
  roleDropdownOpen = false;
  selectedImageFile?: File;
  imagePreviewUrl = '';
  private utilisateurId?: string;
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private entrepriseService: EntrepriseService,
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.utilisateurId = params.get('id') || undefined;
      this.revokeImagePreview();
      this.selectedImageFile = undefined;
      this.form = this.createEmptyForm();
      this.confirmPassword = '';
      this.loadRoles();
      this.loadEntreprises();

      if (this.utilisateurId) {
        this.loadUtilisateur(this.utilisateurId);
      }
    });
  }

  ngOnDestroy(): void {
    this.revokeImagePreview();
  }

  get isEditMode(): boolean {
    return Boolean(this.utilisateurId);
  }

  save(): void {
    if (!this.form.nom?.trim() || !this.form.email?.trim()) {
      this.showFormError('Le nom et l email sont obligatoires.');
      return;
    }

    if (!this.isEditMode && !this.form.password?.trim()) {
      this.showFormError('Le mot de passe est obligatoire.');
      return;
    }

    if (!this.isEditMode && !this.confirmPassword.trim()) {
      this.showFormError('La confirmation du mot de passe est obligatoire.');
      return;
    }

    if (this.form.password?.trim() && this.form.password !== this.confirmPassword) {
      this.showFormError('Le mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (!this.form.roleIds?.length) {
      this.showFormError('Au moins un role est obligatoire.');
      return;
    }

    this.saving = true;
    this.error = '';

    this.buildSaveRequest().subscribe({
      next: () => {
        if (this.utilisateurId) {
          this.notificationService.updated('Utilisateur modifie avec succes.');
        } else {
          this.notificationService.created('Utilisateur ajoute avec succes.');
        }
        this.saving = false;
        this.router.navigate(['/utilisateurs']);
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.getHttpErrorMessage(
          error,
          this.utilisateurId
            ? 'Modification de l utilisateur impossible'
            : 'Ajout de l utilisateur impossible'
        );
        this.notificationService.error(this.error);
        this.saving = false;
      }
    });
  }

  isSuperAdminSelected(): boolean {
    return this.form.roleIds?.some((id) => this.roles.find((role) => role.id === Number(id))?.nom === 'SUPER_ADMIN') || false;
  }

  get selectedRoleLabel(): string {
    const selectedRoleNames = this.roles
      .filter((role) => role.id && this.form.roleIds?.includes(role.id))
      .map((role) => role.nom);

    return selectedRoleNames.length > 0 ? selectedRoleNames.join(', ') : 'Selectionner les roles';
  }

  toggleRoleDropdown(): void {
    if (this.loadingReferences || this.roles.length === 0) {
      return;
    }

    this.roleDropdownOpen = !this.roleDropdownOpen;
  }

  isRoleSelected(roleId?: number): boolean {
    return Boolean(roleId && this.form.roleIds?.includes(roleId));
  }

  toggleRole(roleId: number | undefined, checked: boolean): void {
    if (!roleId) {
      return;
    }

    const roleIds = this.form.roleIds || [];
    this.form.roleIds = checked
      ? Array.from(new Set([...roleIds, roleId]))
      : roleIds.filter((id) => id !== roleId);
  }

  trackByRoleId(_: number, role: Role): number | undefined {
    return role.id;
  }

  getImagePreviewUrl(): string {
    if (this.imagePreviewUrl) {
      return this.imagePreviewUrl;
    }

    if (!this.form.imageUrl) {
      return '';
    }

    return this.form.imageUrl.startsWith('http')
      ? this.form.imageUrl
      : `${this.apiBaseUrl}${this.form.imageUrl}`;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showFormError('Veuillez choisir un fichier image valide.');
      input.value = '';
      return;
    }

    this.revokeImagePreview();
    this.selectedImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.error = '';
  }

  removeImage(): void {
    this.selectedImageFile = undefined;
    this.revokeImagePreview();
    this.form.imageUrl = '';
  }

  private loadRoles(): void {
    this.loadingReferences = true;
    this.roleService.getAll().subscribe({
      next: (roles) => {
        this.roles = roles.filter((role) => role.id);
        this.loadingReferences = false;
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.getHttpErrorMessage(error, 'Impossible de charger les roles');
        this.loadingReferences = false;
      }
    });
  }

  private loadEntreprises(): void {
    this.loadingEntreprises = true;
    this.entrepriseError = '';

    this.entrepriseService.getVisibleForCurrentUser().subscribe({
      next: (entreprises) => {
        this.entreprises = entreprises;
        this.form.entrepriseId = this.form.entrepriseId || this.findEntrepriseId(this.form) || this.entreprises[0]?.id;
        this.loadingEntreprises = false;
      },
      error: (error: HttpErrorResponse) => {
        this.entreprises = [];
        this.entrepriseError = this.getHttpErrorMessage(error, 'Impossible de charger les entreprises');
        this.loadingEntreprises = false;
      }
    });
  }

  private loadUtilisateur(id: string): void {
    this.loading = true;
    this.error = '';

    this.utilisateurService.getById(id).subscribe({
      next: (utilisateur) => {
        this.form = {
          ...this.createEmptyForm(),
          ...utilisateur,
          roleIds: utilisateur.roleIds?.length ? utilisateur.roleIds.map(Number) : [],
          entrepriseId: utilisateur.entrepriseId || utilisateur.entreprise?.id || this.findEntrepriseId(utilisateur),
          password: ''
        };
        this.revokeImagePreview();
        this.selectedImageFile = undefined;
        this.confirmPassword = '';
        this.applyRoleIdsFromUtilisateur(utilisateur);
        this.applyEntrepriseIdFromUtilisateur(utilisateur);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cet utilisateur.';
        this.loading = false;
      }
    });
  }

  private buildPayload(): Utilisateur {
    const payload: Utilisateur = {
      nom: this.form.nom,
      prenom: this.form.prenom,
      email: this.form.email,
      roleIds: this.form.roleIds,
      entrepriseId: this.form.entrepriseId,
      cin: this.form.cin,
      age: this.form.age,
      genre: this.form.genre || undefined,
      telephone: this.form.telephone,
      adresse: this.form.adresse,
      ville: this.form.ville,
      pays: this.form.pays,
      imageUrl: this.form.imageUrl,
      actif: this.form.actif
    };

    if (this.form.password?.trim()) {
      payload.password = this.form.password;
    }

    return payload;
  }

  private buildSaveRequest(): Observable<Utilisateur> {
    if (!this.selectedImageFile) {
      return this.persistUtilisateur(this.buildPayload());
    }

    return this.utilisateurService.uploadUserImage(this.selectedImageFile).pipe(
      switchMap((imageUrl) => {
        this.form.imageUrl = imageUrl;
        return this.persistUtilisateur(this.buildPayload());
      })
    );
  }

  private persistUtilisateur(payload: Utilisateur): Observable<Utilisateur> {
    return this.utilisateurId
      ? this.utilisateurService.update(this.utilisateurId, payload)
      : this.utilisateurService.create(payload);
  }

  private createEmptyForm(): Utilisateur {
    return {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      roleIds: [],
      entrepriseId: undefined,
      cin: '',
      age: undefined,
      genre: '',
      telephone: '',
      adresse: '',
      ville: '',
      pays: '',
      imageUrl: '',
      actif: true
    };
  }

  private extractRoleIds(utilisateur: Utilisateur): number[] {
    if (utilisateur.roleIds?.length) {
      return utilisateur.roleIds.map(Number);
    }

    if (utilisateur.roles?.length) {
      return utilisateur.roles
        .map((role) => typeof role === 'string'
          ? this.roles.find((option) => option.nom === role)?.id
          : role.id || this.roles.find((option) => option.nom === role.nom)?.id)
        .filter((id): id is number => Boolean(id));
    }

    if (utilisateur.role) {
      const role = this.roles.find((option) => option.nom === utilisateur.role);
      return role?.id ? [role.id] : [];
    }

    return [];
  }

  private applyRoleIdsFromUtilisateur(utilisateur: Utilisateur): void {
    if (this.form.roleIds?.length) {
      return;
    }

    if (this.roles.length > 0) {
      this.form.roleIds = this.extractRoleIds(utilisateur);
      return;
    }

    const intervalId = window.setInterval(() => {
      if (this.roles.length === 0) {
        return;
      }

      this.form.roleIds = this.extractRoleIds(utilisateur);
      window.clearInterval(intervalId);
    }, 50);
  }

  private findEntrepriseId(utilisateur: Utilisateur): number | undefined {
    const entrepriseNom = utilisateur.entrepriseNom || utilisateur.entreprise?.nom;

    if (!entrepriseNom) {
      return undefined;
    }

    return this.entreprises.find((entreprise) => entreprise.nom === entrepriseNom)?.id;
  }

  private applyEntrepriseIdFromUtilisateur(utilisateur: Utilisateur): void {
    if (this.form.entrepriseId) {
      return;
    }

    if (this.entreprises.length > 0) {
      this.form.entrepriseId = this.findEntrepriseId(utilisateur);
      return;
    }

    const intervalId = window.setInterval(() => {
      if (this.entreprises.length === 0) {
        return;
      }

      this.form.entrepriseId = this.findEntrepriseId(utilisateur);
      window.clearInterval(intervalId);
    }, 50);
  }

  private getHttpErrorMessage(error: HttpErrorResponse, message: string): string {
    const backendMessage = this.extractBackendMessage(error);

    if (error.status === 0) {
      return `${message}. Backend indisponible ou CORS bloque.`;
    }

    const friendlyBackendMessage = this.getFriendlyBackendMessage(backendMessage);

    if (friendlyBackendMessage) {
      return `${message}. ${friendlyBackendMessage}`;
    }

    if (error.status === 401) {
      return `${message}. Session non autorisee (401).`;
    }

    if (error.status === 403) {
      return `${message}. Acces refuse par le backend (403).`;
    }

    return `${message}. Erreur ${error.status}.`;
  }

  private getFriendlyBackendMessage(message: string): string {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('image_url') && normalizedMessage.includes('varying(255)')) {
      return 'La photo selectionnee est trop volumineuse pour etre enregistree.';
    }

    if (normalizedMessage.includes('valeur trop longue') || normalizedMessage.includes('value too long')) {
      return 'Une valeur saisie est trop longue.';
    }

    if (normalizedMessage.includes('duplicate') || normalizedMessage.includes('unique')) {
      return 'Une donnee existe deja avec ces informations.';
    }

    return '';
  }

  private extractBackendMessage(error: HttpErrorResponse): string {
    if (!error.error) {
      return '';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.error.message || error.error.error || error.error.detail || '';
  }

  private showFormError(message: string): void {
    this.error = message;
    this.notificationService.error(message);
  }

  private revokeImagePreview(): void {
    if (this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.imagePreviewUrl = '';
  }
}
