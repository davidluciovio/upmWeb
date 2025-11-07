import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface AlertMetricCardInterface {
  title: string;
  icon: string;
  value: string;
  color?: string;
  textColor?: string;
}

@Component({
  selector: 'alert-metric-card',
  imports: [CommonModule],
  templateUrl: './alert-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'w-full h-fit bg-base-100 p-2 rounded-lg border border-base-300 dark:bg-base-900 dark:border-base-700',
  },
})
export class AlertMetricCard {
  data = input<AlertMetricCardInterface>();

  constructor() {
    
    
  }
}
