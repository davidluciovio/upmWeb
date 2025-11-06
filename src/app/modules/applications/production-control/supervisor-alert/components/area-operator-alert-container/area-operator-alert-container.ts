import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { OperatorAlertInterface, OperatorAlertsCard } from '../operator-alerts-card/operator-alerts-card';
import { CardModule } from 'primeng/card';

export interface AreaOperatorAlertInterface {
  area: string;
  operatorAlerts: OperatorAlertInterface[];
}

@Component({
  selector: 'area-operator-alert-container',
  imports: [CardModule, OperatorAlertsCard],
  templateUrl: './area-operator-alert-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaOperatorAlertContainer {
  options = input<AreaOperatorAlertInterface>();

}
