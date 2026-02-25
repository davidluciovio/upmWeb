import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';

// PrimeNG & UI
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import {
	LoadDataComponentAlertReport,
	ComponentAlertReportResponseInterface,
	ComponentAlertReportRequestInterface,
} from './services/load-data-component-alert-report';
import { PartNumberAreaManager } from '../../../../Admin/services/part-number-logistics-manager';
import { Authentication } from '../../../../auth/services/authentication';
import { UserManager, UserInterface } from '../../../../security/services/user-manager';

// Sub-components
import { AlertReportKpisComponent } from './components/alert-report-kpis';
import { AlertManagementModalComponent } from './components/alert-management-modal';
import { AlertReportTableComponent } from './components/alert-report-table';
import { AlertReportFiltersComponent } from './components/alert-report-filters';

// Services
import { AreaManagerService } from '../../../../Admin/services/area-manager';
import { ComponentAlertFiltersDto } from './services/load-data-component-alert-report';

@Component({
	selector: 'app-component-alert-report',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		ToastModule,
		AlertReportKpisComponent,
		AlertManagementModalComponent,
		AlertReportTableComponent,
		AlertReportFiltersComponent,
	],
	providers: [MessageService],
	templateUrl: './component-alert-report.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentAlertReport {
	private readonly alertService = inject(LoadDataComponentAlertReport);
	private readonly partNumberManager = inject(PartNumberAreaManager);
	protected readonly authService = inject(Authentication);
	private readonly userManager = inject(UserManager);
	private readonly areaManager = inject(AreaManagerService);
	private readonly messageService = inject(MessageService);
	private readonly fb = inject(FormBuilder);

	// Filters State
	protected filters = signal<ComponentAlertFiltersDto>({
		startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
		endDate: new Date().toISOString(),
		areaId: null,
		userId: null,
		partNumberLogisticId: null,
	});

	// Status Definitions
	readonly statusOptions = [
		{
			label: 'Creado (Pendiente)',
			value: 'CREATED',
			icon: 'pending',
			severity: 'info',
			description: 'Alerta emitida, pendiente de atención',
		},
		{
			label: 'Recibido (Confirmado en Línea)',
			value: 'RECEIVED',
			icon: 'forklift',
			severity: 'warn',
			description: 'Operador confirmó recepción del material en línea',
		},
		{
			label: 'Completado (Entregado)',
			value: 'COMPLETED',
			icon: 'check_circle',
			severity: 'success',
			description: 'Material entregado físicamente en línea',
		},
		{
			label: 'Cancelado',
			value: 'CANCELLED',
			icon: 'cancel',
			severity: 'danger',
			description: 'Entrega cancelada por el operador',
		},
	];

	// CRUD Context
	displayModal = signal(false);
	selectedAlertId = signal<string | null>(null);
	modalTitle = computed(() => (this.selectedAlertId() ? 'Editar Alerta de Componente' : 'Nueva Alerta de Componente'));

	// State
	searchTerm = signal('');

	// Resources
	protected alertsResource = rxResource({
		stream: () => this.alertService.getGlobalAlerts(this.filters()),
	});

	protected areasResource = rxResource({
		stream: () => this.areaManager.getAreas(),
	});

	protected partNumbersResource = rxResource({
		stream: () => this.partNumberManager.getPartNumberLogistics(),
	});

	protected usersResource = rxResource({
		stream: () => this.userManager.getUsers(),
	});

	// Computed Data
	forkliftUsers = computed(() => {
		const users = (this.usersResource.value() as UserInterface[]) || [];
		return users.filter((u) => u.roleName?.toLowerCase().includes('montacarguista') || u.roleName?.toLowerCase().includes('forklift'));
	});

	kpis = computed(() => {
		const alerts = (this.alertsResource.value() as ComponentAlertReportResponseInterface[]) || [];
		const now = new Date().getTime();
		const CRITICAL_THRESHOLD_MINUTES = 30;

		const total = alerts.length;
		const pending = alerts.filter((a) => a.status === 'CREATED').length;
		const inProcess = alerts.filter((a) => a.status === 'RECEIVED').length;
		const completed = alerts.filter((a) => a.status === 'COMPLETED').length;
		const cancelled = alerts.filter((a) => a.status === 'CANCELLED').length;

		const critical = alerts.filter((a) => {
			if (a.criticalDate) return true;
			if (a.status !== 'COMPLETED' && a.status !== 'CANCELLED') {
				const createTime = new Date(a.createDate).getTime();
				const diffMinutes = (now - createTime) / (1000 * 60);
				return diffMinutes > CRITICAL_THRESHOLD_MINUTES;
			}
			return false;
		}).length;

		const responseTimes = alerts
			.filter((a) => a.createDate && a.receivedDate)
			.map((a) => new Date(a.receivedDate!).getTime() - new Date(a.createDate).getTime());
		const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 / 60 : 0;

		return { total, pending, inProcess, completed, cancelled, critical, avgResponseTime };
	});

	filteredAlerts = computed(() => {
		const alerts = (this.alertsResource.value() as ComponentAlertReportResponseInterface[]) || [];
		const search = this.searchTerm().toLowerCase();

		if (!search) return alerts;

		return alerts.filter(
			(a) =>
				a.partNumberLogistics.partNumber.toLowerCase().includes(search) ||
				a.partNumberLogistics.area.toLowerCase().includes(search) ||
				a.user.toLowerCase().includes(search) ||
				a.status.toLowerCase().includes(search),
		);
	});

	// Form Management
	alertForm = this.fb.group({
		partNumberLogisticsId: ['', Validators.required],
		userId: ['', Validators.required],
		status: ['CREATED', Validators.required],
		isCritical: [false],
	});

	openCreateModal() {
		this.selectedAlertId.set(null);
		this.alertForm.reset({
			status: 'CREATED',
			isCritical: false,
		});
		this.displayModal.set(true);
	}

	openEditModal(alert: ComponentAlertReportResponseInterface) {
		this.selectedAlertId.set(alert.id);
		this.alertForm.patchValue({
			partNumberLogisticsId: alert.partNumberLogistics.id,
			userId: this.forkliftUsers().find((u) => u.prettyName === alert.user)?.id || '',
			status: alert.status,
			isCritical: !!alert.criticalDate,
		});
		this.displayModal.set(true);
	}

	saveAlert() {
		if (this.alertForm.invalid) {
			this.alertForm.markAllAsTouched();
			return;
		}

		const currentUser = this.authService.user();
		if (!currentUser) {
			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el usuario creador' });
			return;
		}

		const formVal = this.alertForm.value;
		const now = new Date();
		const alertId = this.selectedAlertId();

		const request: ComponentAlertReportRequestInterface = {
			active: true,
			createDate: now,
			createBy: currentUser.name,
			updateDate: now,
			updateBy: currentUser.name,
			status: formVal.status!,
			partNumberLogisticsId: formVal.partNumberLogisticsId!,
			userId: formVal.userId!,
			receivedBy: formVal.status === 'RECEIVED' || formVal.status === 'COMPLETED' ? currentUser.name : null,
			receivedDate: formVal.status === 'RECEIVED' || formVal.status === 'COMPLETED' ? now : null,
			completeBy: formVal.status === 'COMPLETED' ? currentUser.name : null,
			completeDate: formVal.status === 'COMPLETED' ? now : null,
			cancelBy: formVal.status === 'CANCELLED' ? currentUser.name : null,
			cancelDate: formVal.status === 'CANCELLED' ? now : null,
			criticalBy: formVal.isCritical ? currentUser.name : null,
			criticalDate: formVal.isCritical ? now : null,
		};

		const operation = alertId ? this.alertService.updateAlert(alertId, request) : this.alertService.createAlert(request);

		operation.subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: alertId ? 'Alerta actualizada' : 'Alerta creada',
				});
				this.alertsResource.reload();
				this.closeModal();
			},
			error: () => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la solicitud' });
			},
		});
	}

	closeModal() {
		this.displayModal.set(false);
		this.selectedAlertId.set(null);
		this.alertForm.reset();
	}

	refreshData() {
		this.alertsResource.reload();
	}
}
