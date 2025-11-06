import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardAlert, CardAlertInterface } from "../card-alert/card-alert";

export interface CardContainerInterface {
  icon: string;
  iconColor: string;
  title: string;
}


@Component({
  selector: 'card-container',
  imports: [CommonModule, CardAlert],
  templateUrl: './card-alert-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'w-full bg-gray-100 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 w-full rounded-lg flex flex-col gap-2 p-2' }
})
export class CardAlertContainer {
  options = input<CardContainerInterface>({
    icon: 'e911_emergency',
    iconColor: 'text-yellow-500',
    title: 'Alertas de Material'
  });

  cards: CardAlertInterface[] = [
    {
      icon: 'e911_emergency',
      iconColor: 'text-red-500',
      title: 'Alerta de Material',
      description: 'El material 123456 ha superado el tiempo de espera en la línea de producción.',
      creationDate: new Date(),
      component: 'Componente A',
      location: 'Línea 1',
      snp: 'SNP-001',
      status: 'Pendiente',
      partNumber: '123456',
      line: 'Línea 1',
      model: 'Modelo X',
      area: 'Area 1',
    },
    {
      icon: 'e911_emergency',
      iconColor: 'text-orange-500',
      title: 'Alerta de Material',
      description: 'El material 654321 está a punto de superar el tiempo de espera en la línea de producción.',
      creationDate: new Date(),
      component: 'Componente B',
      location: 'Línea 2',
      snp: 'SNP-002',
      status: 'En progreso',
      partNumber: '654321',
      line: 'Línea 2',
      model: 'Modelo Y',
      area: 'Area 2',
    },
  ]

  constructor() {}

 }
