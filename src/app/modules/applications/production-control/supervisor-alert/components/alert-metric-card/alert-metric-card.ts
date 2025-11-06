import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface AlertMetricCardInterface {
  title: string;
  icon: string;
  value: string;
  color?: string;
}

@Component({
  selector: 'alert-metric-card',
  imports: [CommonModule],
  templateUrl: './alert-metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'w-full h-36 bg-gray-100 p-4 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-700',
  },
})
export class AlertMetricCard {
  data = input<AlertMetricCardInterface>();

  constructor() {
    
    
  }
}
