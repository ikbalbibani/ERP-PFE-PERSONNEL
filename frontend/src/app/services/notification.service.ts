import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'delete';

const DEFAULT_NOTIFICATION_DURATION = 20000;

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<AppNotification[]>([]);
  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  created(message = 'Element ajoute avec succes.', duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('success', 'Ajout reussi', message, duration);
  }

  updated(message = 'Element modifie avec succes.', duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('success', 'Modification reussie', message, duration);
  }

  deleted(message = 'Element supprime avec succes.', duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('delete', 'Suppression effectuee', message, duration);
  }

  success(message: string, duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('success', 'Operation reussie', message, duration);
  }

  error(message: string, duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('error', 'Erreur', message, duration);
  }

  info(message: string, duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('info', 'Information', message, duration);
  }

  warning(message: string, duration = DEFAULT_NOTIFICATION_DURATION): void {
    this.show('warning', 'Attention', message, duration);
  }

  close(id: number): void {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'delete':
        return '−';
      case 'error':
        return '!';
      case 'warning':
        return '?';
      default:
        return 'i';
    }
  }

  private show(type: NotificationType, title: string, message: string, duration: number): void {
    const notification: AppNotification = {
      id: this.nextId++,
      type,
      title,
      message
    };

    this.notifications.update((items) => [...items, notification]);

    if (duration > 0) {
      const timer = setTimeout(() => this.close(notification.id), duration);
      this.timers.set(notification.id, timer);
    }
  }
}
