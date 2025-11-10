import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CaptureNavBar } from "./components/capture-nav-bar/capture-nav-bar";
import { Charts, ChartOptions } from '../../../../shared/components/charts/charts';

@Component({
  selector: 'app-capture-production',
  imports: [CaptureNavBar, Charts],
  templateUrl: './capture-production.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    class:""
  }
})
export class CaptureProduction { 
  ChartOptions = signal<ChartOptions>({});
  constructor() {

  }

  initializeChart() {
    this.ChartOptions.set({
      chart: {
        height: 350,
        type: "line",
        stacked: true,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
    });
  }
}
