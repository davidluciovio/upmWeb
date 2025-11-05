import { DatePipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, OnDestroy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

export interface CardAlertInterface {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  
  creationDate: Date;
  component: string;
  location: string;
  snp: string;

  status: string;

  partNumber: string;
  line: string;
  model: string;
}

@Component({
  selector: 'card-alert',
  imports: [ButtonModule, DatePipe, CommonModule],
  templateUrl: './card-alert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
  }
})
export class CardAlert implements OnInit, OnDestroy {
  options = input<CardAlertInterface>();

  protected progress = signal(0);
  protected progressBarColor = signal('bg-green-500');
  private intervalId: any;
  private readonly MAX_TIME_MS = 1 * 60 * 1000; // 15 minutos en milisegundos

  ngOnInit(): void {
    this.updateProgress(); // Cálculo inicial
    this.intervalId = setInterval(() => this.updateProgress(), 1000); // Actualizar cada segundo
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateProgress(): void {
    const creationDate = this.options()?.creationDate;
    if (!creationDate || this.options()?.status !== 'Pendiente') {
      this.progress.set(0);
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    const now = new Date().getTime();
    const creationTime = new Date(creationDate).getTime();
    const elapsedTime = now - creationTime;

    const percentage = Math.min((elapsedTime / this.MAX_TIME_MS) * 100, 100);
    this.progress.set(percentage);

    this.progressBarColor.set(percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500');
  }
}
