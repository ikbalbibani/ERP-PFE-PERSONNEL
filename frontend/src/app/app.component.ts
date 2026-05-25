import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notifications/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SalesFront';

  ngOnInit(): void {
    const themeMode = localStorage.getItem('themeMode') === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeMode);
  }
}
