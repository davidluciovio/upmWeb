import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  CardAlertInterface,
  CardAlert,
} from '../../../component-alert/components/card-alert/card-alert';

export interface OperatorAlertInterface {
  userCode: string;
  critical: number;
  pending: number;
  downtimes: number;
  complete: number;
  alerts?: CardAlertInterface[];
}

@Component({
  selector: 'operator-alerts-card',
  imports: [],
  templateUrl: './operator-alerts-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'border border-gray-300 dark:border-gray-700 h-full rounded-lg p-2 w-full flex flex-col gap-4',
  },
})
export class OperatorAlertsCard {
  options = input<OperatorAlertInterface>();
}
