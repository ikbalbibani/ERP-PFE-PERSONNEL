import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MenuItem } from '../models/menu-item.model';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  userMenuOpen = false;
  userEmail = 'User';
  userRoleLabel = 'Utilisateur';
  themeMode: ThemeMode = 'light';

  menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Dashboard',
      route: '/dashboard',
      active: true
    },
    {
      icon: 'V',
      label: 'Ventes',
      route: '/ventes',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'CAISSIER']
    },
    {
      icon: 'P',
      label: 'Produits',
      route: '/produits',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE']
    },
    {
      icon: 'E',
      label: 'Entreprises',
      route: '/entreprises',
      active: false,
      roles: ['SUPER_ADMIN']
    },
    {
      icon: 'U',
      label: 'Utilisateurs',
      route: '/utilisateurs',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE']
    },
    {
      icon: 'C',
      label: 'Categories',
      route: '/categories',
      active: false
    },
    {
      icon: '%',
      label: 'Taxes',
      route: '/taxes',
      active: false
    },
    {
      icon: 'M',
      label: 'Points de vente',
      route: '/points-vente',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER']
    },
    {
      icon: 'S',
      label: 'Stock',
      route: '/stocks',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'MANAGER', 'STOCK_MANAGER']
    },
    {
      icon: '$',
      label: 'Paiements',
      route: '/paiements',
      active: false,
      roles: ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'COMPTABLE', 'CAISSIER']
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshCurrentUser();
    this.themeMode = this.getStoredTheme();
    this.applyTheme();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeSidebarOnSmallScreen(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  toggleTheme(): void {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('themeMode', this.themeMode);
    this.applyTheme();
  }

  logout(): void {
    this.authService.logout();
  }

  get visibleMenuItems(): MenuItem[] {
    return this.menuItems
      .filter((item) => item.route !== '/dashboard')
      .filter((item) => !item.roles || this.authService.hasAnyRole(item.roles));
  }

  private getStoredTheme(): ThemeMode {
    return localStorage.getItem('themeMode') === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.themeMode);
  }

  private refreshCurrentUser(): void {
    this.userEmail = this.authService.getUserEmail();
    this.userRoleLabel = this.getUserRoleLabel();
  }

  private getUserRoleLabel(): string {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super administrateur',
      ADMIN_ENTREPRISE: 'Administrateur entreprise',
      MANAGER: 'Manager',
      STOCK_MANAGER: 'Gestionnaire stock',
      COMPTABLE: 'Comptable',
      CAISSIER: 'Caissier'
    };
    const roles = this.authService.getRoles();

    return roles.map((role) => labels[role] || role).join(', ') || 'Utilisateur';
  }
}
