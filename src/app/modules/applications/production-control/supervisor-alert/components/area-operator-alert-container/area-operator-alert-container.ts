import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { OperatorAlertInterface, OperatorAlertsCard } from '../operator-alerts-card/operator-alerts-card';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

export interface AreaOperatorAlertInterface {
  area: string;
  operatorAlerts: OperatorAlertInterface[];
}

@Component({
  selector: 'area-operator-alert-container',
  imports: [CardModule, OperatorAlertsCard, Button],
  templateUrl: './area-operator-alert-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 h-fit rounded-xl p-2 w-full flex flex-col gap-4"
  }
})
export class AreaOperatorAlertContainer {
  options = input<AreaOperatorAlertInterface>();

}
