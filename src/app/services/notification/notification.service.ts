import { Injectable } from '@angular/core';
import { ToastService } from '../toast/toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  
  constructor(private toastService: ToastService) {}

  showNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const notification: Notification = {
      id: this.generateId(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(notification);
    
    // Also show as toast
    this.toastService.show(message, type);
    
    // Limit to 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAll(): void {
    this.notifications = [];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Specific notification methods for common use cases
  showInfo(message: string, title: string = 'Info'): void {
    this.showNotification(title, message, 'info');
  }

  showSuccess(message: string, title: string = 'Berhasil'): void {
    this.showNotification(title, message, 'success');
  }

  showWarning(message: string, title: string = 'Peringatan'): void {
    this.showNotification(title, message, 'warning');
  }

  showError(message: string, title: string = 'Error'): void {
    this.showNotification(title, message, 'error');
  }

  // Notifications for specific business events
  notifyTicketCreated(ticketId: number, assetName: string): void {
    this.showSuccess(`Tiket #${ticketId} untuk aset "${assetName}" telah dibuat`, 'Tiket Baru Dibuat');
  }

  notifyTicketUpdated(ticketId: number, status: string): void {
    this.showInfo(`Tiket #${ticketId} status diperbarui ke ${status}`, 'Tiket Diperbarui');
  }

  notifyAssetMaintenanceDue(assetName: string, dueDate: string): void {
    this.showWarning(`Aset "${assetName}" jadwal pemeliharaan tanggal ${dueDate}`, 'Pemeliharaan Mendekat');
  }

  notifyLowStock(itemName: string, currentStock: number): void {
    this.showWarning(`${itemName} stok rendah: ${currentStock}`, 'Stok Rendah');
  }
}