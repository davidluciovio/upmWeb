import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataComponentAlertReport, ComponentAlertReportResponseInterface, ComponentAlertReportRequestInterface } from '../../feature/component-alert-report/services/load-data-component-alert-report';
import { Authentication } from '../../../../auth/services/authentication';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-forklifter-view',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, TooltipModule],
  templateUrl: './forklifter-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ForklifterView implements OnInit, OnDestroy {
  private readonly alertService = inject(LoadDataComponentAlertReport);
  private readonly authService = inject(Authentication);
  private readonly messageService = inject(MessageService);
  private refreshInterval: any;
  private timerInterval: any;
  
  readonly currentTime = signal(Date.now());
  private readonly MAX_TIME_MS = 30 * 60 * 1000; // 30 minutos en milisegundos

  readonly user = this.authService.user;

  // Resource to fetch alerts for the current user
  readonly alertsResource = rxResource({
    stream: () => {
      const today = new Date();
      // Start of day
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      // End of day
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      
      return this.alertService.getGlobalAlerts({
        startDate,
        endDate,
        userId: this.user()?.sub
      });
    }
  });
  
  ngOnInit(): void {
    // Set up auto-refresh every minute
    this.refreshInterval = setInterval(() => {
      this.alertsResource.reload();
    }, 60000); // 60 seconds

    // Set up timer for progress bar (every second)
    this.timerInterval = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up interval on component destroy
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Tracking processing IDs for instant UI feedback
  private readonly processingIds = signal<Set<string>>(new Set());

  // Filter alerts that are pending (no receivedDate yet)
  readonly activeAlerts = computed(() => {
    const alerts = this.alertsResource.value() || [];
    const processing = this.processingIds();
    return alerts.filter(a => 
      a.receivedDate === null && 
      a.status !== 'CANCELLED' &&
      !processing.has(a.id)
    );
  });

  // Action to complete an alert (Mark as RECEIVED/COMPLETED)
  completeAlert(alert: ComponentAlertReportResponseInterface) {
    // Instant feedback: add to processing set
    this.processingIds.update(set => {
      const newSet = new Set(set);
      newSet.add(alert.id);
      return newSet;
    });

    const request: ComponentAlertReportRequestInterface = this.mapResponseToRequest(alert);
    
    // According to request: setting receivedDate hides the alert
    request.status = 'COMPLETED'; 
    request.completeBy = this.user()?.name || 'Forklifter';
    request.completeDate = new Date();
    request.updateBy = this.user()?.email || 'System';
    request.updateDate = new Date();

    this.alertService.updateAlert(alert.id, request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Entrega Exitosa', detail: 'El material ha sido marcado como entregado.' });
        this.alertsResource.reload();
        // Clean up processing state
        this.processingIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(alert.id);
          return newSet;
        });
      },
      error: (err) => {
        console.error('Error completing alert:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la entrega.' });
        this.processingIds.update(set => {
          const newSet = new Set(set);
          newSet.delete(alert.id);
          return newSet;
        });
      }
    });
  }

  // Helper to map response back to request format
  private mapResponseToRequest(alert: ComponentAlertReportResponseInterface): ComponentAlertReportRequestInterface {
    return {
      active: true,
      createBy: alert.createBy,
      createDate: alert.createDate,
      updateBy: alert.updateBy,
      updateDate: alert.updateDate,
      status: alert.status,
      partNumberLogisticsId: alert.partNumberLogistics.id,
      userId: this.user()?.sub || '', // We use sub since it's the ID
      cancelBy: alert.cancelBy,
      cancelDate: alert.cancelDate,
      completeBy: alert.completeBy,
      completeDate: alert.completeDate,
      criticalBy: alert.criticalBy,
      criticalDate: alert.criticalDate,
      receivedBy: alert.receivedBy,
      receivedDate: alert.receivedDate
    };
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'CREATED': return 'info';
      case 'RECEIVED': return 'warn';
      case 'COMPLETED': return 'success';
      case 'CRITICAL': return 'danger';
      case 'CANCELLED': return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CREATED': return 'Pendiente';
      case 'RECEIVED': return 'En Proceso';
      case 'COMPLETED': return 'Entregado';
      case 'CRITICAL': return 'Crítico';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  getAlertProgress(createDate: Date | string): number {
    const creationTime = new Date(createDate).getTime();
    const elapsedTime = this.currentTime() - creationTime;
    return Math.min((elapsedTime / this.MAX_TIME_MS) * 100, 100);
  }

  getProgressBarColor(progress: number): string {
    if (progress > 80) return '#ef4444'; // Red-500
    if (progress > 50) return '#f59e0b'; // Amber-500
    return '#10b981'; // Emerald-500
  }

  getFormattedElapsedTime(createDate: Date | string): string {
    const creationTime = new Date(createDate).getTime();
    const elapsedTime = Math.max(0, this.currentTime() - creationTime);
    
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
