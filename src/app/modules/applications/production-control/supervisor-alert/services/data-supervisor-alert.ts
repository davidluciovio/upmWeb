import { Injectable } from '@angular/core';
import { AreaOperatorAlertInterface } from '../components/area-operator-alert-container/area-operator-alert-container';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSupervisorAlert {
  data$ = rxResource({
    stream: () => of(areaOperatorAlerts),
  });

  constructor() {}

  getDataAreaOperatorAlerts(): AreaOperatorAlertInterface[] | null {
    this.data$.reload;
    if (!this.data$.hasValue()) return null;

    return this.data$.value();
  }
}

const areaOperatorAlerts: AreaOperatorAlertInterface[] = [
  {
    area: 'Area 1',
    operatorAlerts: [
      {
        userCode: 'Montacargas 1',
        critical: 5,
        pending: 10,
        downtimes: 2,
        complete: 15,
        alerts: [
          {
            icon: 'e911_emergency',
            iconColor: 'text-red-500',
            title: 'Alerta Crítica',
            description: 'Descripción de la alerta crítica del Montacargas 1',
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
            description: 'Descripción de la alerta pendiente del Montacargas 1',
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
        userCode: 'Montacargas 2',
        critical: 1,
        pending: 3,
        downtimes: 0,
        complete: 5,
        alerts: [
          {
            icon: 'e911_emergency',
            iconColor: 'text-red-500',
            title: 'Alerta Crítica',
            description: 'Descripción de la alerta crítica del Montacargas 2',
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
        userCode: 'Montacargas 3',
        critical: 2,
        pending: 1,
        downtimes: 1,
        complete: 8,
      },
      {
        userCode: 'Montacargas 4',
        critical: 0,
        pending: 0,
        downtimes: 0,
        complete: 10,
      },
    ],
  },
  {
    area: 'Area 3',
    operatorAlerts: [
      {
        userCode: 'Montacargas 5',
        critical: 3,
        pending: 2,
        downtimes: 0,
        complete: 7,
      },
      
    ],
  },
  {
    area: 'Area 4',
    operatorAlerts: [
      {
        userCode: 'Montacargas 6',
        critical: 1,
        pending: 1,
        downtimes: 1,
        complete: 1,
      },
      {
        userCode: 'Montacargas 7',
        critical: 2,
        pending: 2,
        downtimes: 2,
        complete: 2,
      },
    ],
  },


];
