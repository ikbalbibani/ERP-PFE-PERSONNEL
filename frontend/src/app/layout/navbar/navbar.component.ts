import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['../layout.component.scss']
})
export class NavbarComponent {
  @Input() userEmail = 'User';
  @Input() userMenuOpen = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}
