import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Service & Interfaces
import { ForkliftGlobalReportService, ForkliftAlertInterface } from './services/forklift-global-report.service';

// Components
import { ForkliftReportHeaderComponent } from './components/report-header/report-header.component';
import { ForkliftReportStatsComponent, StatusFilterType } from './components/report-stats/report-stats.component';
import { ForkliftAreaCardComponent } from './components/area-card/area-card.component';
import { ForkliftAlertDetailModalComponent } from './components/alert-detail-modal/alert-detail-modal.component';

@Component({
	selector: 'forklift-global-report',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		ToastModule,
		ForkliftReportHeaderComponent,
		ForkliftReportStatsComponent,
		ForkliftAreaCardComponent,
		ForkliftAlertDetailModalComponent,
	],
	providers: [MessageService],
	templateUrl: './forklift-global-report.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftGlobalReportComponent {
	private readonly alertService = inject(ForkliftGlobalReportService);
	private readonly messageService = inject(MessageService);

	// State
	searchTerm = signal('');
	statusFilter = signal<StatusFilterType>('ALL');
	selectedAlert = signal<ForkliftAlertInterface | null>(null);
	isModalVisible = signal(false);

	// Data Resource
	alertsResource = rxResource({
		stream: () => this.alertService.getGlobalAlerts(),
	});

	// Computed Stats
	stats = computed(() => {
		const data = this.alertsResource.value() || [];
		return {
			total: data.length,
			critical: data.filter((a) => a.criticalDate).length,
			active: data.filter((a) => !a.completeDate && !a.cancelDate).length,
			completed: data.filter((a) => a.completeDate).length,
		};
	});

	overallStatus = computed<{
		label: string;
		severity: 'danger' | 'warn' | 'success' | 'secondary' | 'info' | 'contrast' | null | undefined;
		icon: string;
	}>(() => {
		const { critical, active } = this.stats();
		if (critical > 0) return { label: 'ALERTA CRÍTICA', severity: 'danger', icon: 'report' };
		if (active > 0) return { label: 'FLUJO ACTIVO', severity: 'warn', icon: 'motion_photos_on' };
		return { label: 'OPERACIÓN ESTABLE', severity: 'success', icon: 'check_circle' };
	});

	// Filtered & Grouped Data
	groupedData = computed(() => {
		const data = this.alertsResource.value() || [];
		const search = this.searchTerm().toLowerCase();
		const filter = this.statusFilter();

		// 1. Filter
		const filtered = data.filter((alert) => {
			const matchesSearch =
				alert.partNumberLogisticsResponseDto.partNumber.toLowerCase().includes(search) ||
				alert.partNumberLogisticsResponseDto.area.toLowerCase().includes(search) ||
				alert.userData.userName.toLowerCase().includes(search);

			if (!matchesSearch) return false;

			if (filter === 'CRITICAL') return !!alert.criticalDate;
			if (filter === 'ACTIVE') return !alert.completeDate && !alert.cancelDate;
			if (filter === 'COMPLETED') return !!alert.completeDate;

			return true;
		});

		// 2. Group by Area -> User
		const groups: Record<string, Record<string, ForkliftAlertInterface[]>> = {};

		filtered.forEach((alert) => {
			const area = alert.partNumberLogisticsResponseDto.area;
			const user = alert.userData.userName;

			if (!groups[area]) groups[area] = {};
			if (!groups[area][user]) groups[area][user] = [];

			groups[area][user].push(alert);
		});

		// Convert to array for easier iteration in template
		return Object.entries(groups).map(([areaName, users]) => ({
			name: areaName,
			health: this.calculateAreaHealth(users),
			users: Object.entries(users).map(([userName, alerts]) => ({
				name: userName,
				alerts,
				workload: this.calculateWorkload(alerts),
			})),
			totalAlerts: Object.values(users).flat().length,
		}));
	});

	// Actions
	openAlertDetail(alert: ForkliftAlertInterface) {
		this.selectedAlert.set(alert);
		this.isModalVisible.set(true);
	}

	setStatusFilter(filter: StatusFilterType) {
		this.statusFilter.set(filter);
	}

	clearFilters() {
		this.searchTerm.set('');
		this.statusFilter.set('ALL');
	}

	reload() {
		this.alertsResource.reload();
	}

	// Detail Modal Actions
	markEmergency() {
		const alert = this.selectedAlert();
		if (!alert) return;

		// Hypothetical update: mark as critical
		const updateDto = {
			userId: alert.userId,
			partNumberLogisticsId: alert.partNumberLogisticsId,
			criticalDate: new Date().toISOString(),
			statusDescription: 'ALERTA DE EMERGENCIA',
		};

		this.alertService.updateAlert(alert.id, updateDto).subscribe({
			next: (updated) => {
				this.messageService.add({ severity: 'success', summary: 'Emergencia', detail: 'Prioridad máxima asignada correctamente.' });
				this.selectedAlert.set(updated);
				this.reload();
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado de emergencia.' });
			},
		});
	}

	reassignOperator() {
		this.messageService.add({ severity: 'info', summary: 'Selector', detail: 'El selector de operadores estará disponible en la próxima versión.' });
	}

	notifyPriority() {
		const alert = this.selectedAlert();
		if (!alert) return;

		this.messageService.add({
			severity: 'success',
			summary: 'Notificado',
			detail: `Notificación enviada a ${alert.userData.userName}`,
		});
	}

	// Helpers
	private calculateAreaHealth(users: Record<string, ForkliftAlertInterface[]>): number {
		const alerts = Object.values(users).flat();
		if (alerts.length === 0) return 100;
		const criticals = alerts.filter((a) => a.criticalDate).length;
		return Math.max(0, 100 - (criticals / alerts.length) * 100);
	}

	private calculateWorkload(alerts: ForkliftAlertInterface[]): {
		label: string;
		severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;
	} {
		const criticalCount = alerts.filter((a) => a.criticalDate).length;
		if (criticalCount > 2) return { label: 'CRÍTICA', severity: 'danger' };
		if (alerts.length > 4) return { label: 'MEDIA', severity: 'warn' };
		return { label: 'BAJA', severity: 'success' };
	}

	getAreaHealthColor(health: number): string {
		if (health > 80) return 'green-500';
		if (health > 50) return 'orange-500';
		return 'red-500';
	}
}
