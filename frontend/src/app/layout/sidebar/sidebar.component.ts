import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['../layout.component.scss']
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() themeMode: 'light' | 'dark' = 'light';
  @Input() userEmail = 'User';
  @Input() userRoleLabel = 'Utilisateur';
  @Output() themeChange = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  get userName(): string {
    return this.userEmail && this.userEmail !== 'User'
      ? this.userEmail.split('@')[0].replace(/[._-]+/g, ' ')
      : 'Utilisateur';
  }

  get userInitials(): string {
    return this.userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }
}
