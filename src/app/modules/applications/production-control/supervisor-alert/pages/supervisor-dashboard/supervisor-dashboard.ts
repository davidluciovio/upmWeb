import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertMetricCard, AlertMetricCardInterface } from "../../components/alert-metric-card/alert-metric-card";
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { AreaOperatorAlertInterface, AreaOperatorAlertContainer } from '../../components/area-operator-alert-container/area-operator-alert-container';

@Component({
  selector: 'supervisor-dashboard',
  imports: [AlertMetricCard, CommonModule, TabsModule, AreaOperatorAlertContainer],
  templateUrl: './supervisor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    class: "flex flex-col gap-4 "
  }
})
export class SupervisorDashboard { 
  alertMetrics: AlertMetricCardInterface[] = [
    { title: 'Paros', icon: 'warning', value: '150', color: 'text-sky-500' },
    { title: 'Criticos', icon: 'error', value: '25', color: 'text-red-500' },
    { title: 'Pendientes', icon: 'pending_actions', value: '75', color: 'text-yellow-500' },
    { title: 'Completados', icon: 'check_circle', value: '50', color: 'text-green-500'},
  ]

  areaOperatorAlerts: AreaOperatorAlertInterface[] =[
    {
      area: 'Area 1',
      operatorAlerts: [
        {
          userCode: 'Operador 1',
          critical: 5,
          pending: 10,
          downtimes: 2,
          complete: 15,
          alerts: [
            {
              icon: 'e911_emergency',
              iconColor: 'text-red-500',
              title: 'Alerta Crítica',
              description: 'Descripción de la alerta crítica del Operador 1',
              creationDate: new Date(),
              component: 'Componente X',
              location: 'Línea A',
              snp: 'SNP-001',
              status: 'Pendiente',
              partNumber: 'PN-001',
              line: 'Línea A',
              model: 'Modelo 1',
              area: 'Area 1',
            },
            {
              icon: 'pending_actions',
              iconColor: 'text-yellow-500',
              title: 'Alerta Pendiente',
              description: 'Descripción de la alerta pendiente del Operador 1',
              creationDate: new Date(),
              component: 'Componente Y',
              location: 'Línea B',
              snp: 'SNP-002',
              status: 'Pendiente',
              partNumber: 'PN-002',
              line: 'Línea B',
              model: 'Modelo 2',
              area: 'Area 1',
            },
          ],
        },
        {
          userCode: 'Operador 2',
          critical: 1,
          pending: 3,
          downtimes: 0,
          complete: 5,
          alerts: [
            {
              icon: 'e911_emergency',
              iconColor: 'text-red-500',
              title: 'Alerta Crítica',
              description: 'Descripción de la alerta crítica del Operador 2',
              creationDate: new Date(),
              component: 'Componente Z',
              location: 'Línea C',
              snp: 'SNP-003',
              status: 'Pendiente',
              partNumber: 'PN-003',
              line: 'Línea C',
              model: 'Modelo 3',
              area: 'Area 1',
            },
          ],
        },
      ],
    },
    {
      area: 'Area 2',
      operatorAlerts: [
        {
          userCode: 'Operador 3',
          critical: 2,
          pending: 1,
          downtimes: 1,
          complete: 8,
        },
        {
          userCode: 'Operador 4',
          critical: 0,
          pending: 0,
          downtimes: 0,
          complete: 10,
        },
      ],
    },
  ]

}
