import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardAlertInterface, CardAlert } from '../../../component-alert/components/card-alert/card-alert';
import { Card } from "primeng/card";

export interface OperatorAlertInterface {
  userCode: string;
  critical: number;
  pending: number;
  downtimes: number;
  complete: number;
  alerts?: CardAlertInterface[]
}

@Component({
  selector: 'operator-alerts-card',
  imports: [Card],
  templateUrl: './operator-alerts-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorAlertsCard { 
  options = input<OperatorAlertInterface>();
}
