import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  AlertMetricCard,
  AlertMetricCardInterface,
} from '../../components/alert-metric-card/alert-metric-card';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import {
  AreaOperatorAlertInterface,
  AreaOperatorAlertContainer,
} from '../../components/area-operator-alert-container/area-operator-alert-container';
import { TableAlertsHistory } from '../../components/table-alerts-history/table-alerts-history';
import { DataSupervisorAlert } from '../../services/data-supervisor-alert';

@Component({
  selector: 'supervisor-dashboard',
  standalone: true,
  imports: [
    AlertMetricCard,
    CommonModule,
    TabsModule,
    AreaOperatorAlertContainer,
    TableAlertsHistory,
  ],
  templateUrl: './supervisor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-4',
  },
})
export class SupervisorDashboard {
  readonly dataService: DataSupervisorAlert = inject(DataSupervisorAlert);

  alertMetrics: AlertMetricCardInterface[] = [
    {
      title: 'Paros',
      icon: 'warning',
      value: '150',
      color: 'bg-red-500/30',
      textColor: 'text-red-600',
    },
    {
      title: 'Criticos',
      icon: 'error',
      value: '25',
      color: 'bg-orange-500/30',
      textColor: 'text-orange-600',
    },
    {
      title: 'Pendientes',
      icon: 'pending_actions',
      value: '75',
      color: 'bg-yellow-500/30',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Completados',
      icon: 'check_circle',
      value: '50',
      color: 'bg-green-500/30',
      textColor: 'text-green-600',
    },
  ];

  areaOperatorAlerts = computed(() => this.dataService.getDataAreaOperatorAlerts() ?? []);

  tableAlertsHistory = computed(() =>
    this.areaOperatorAlerts()
      .flatMap((areaOperatorAlert) => areaOperatorAlert.operatorAlerts ?? [])
      .flatMap((operatorAlert) => operatorAlert.alerts ?? []),
  );
}
