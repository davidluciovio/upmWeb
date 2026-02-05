import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { CardOperativity } from '../../services/load-data';
import { PercentPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-operativity-card',
	imports: [PercentPipe, CommonModule],
	template: `
		<div class="flex flex-col gap-3 p-5 border border-l-8 border-t-0 border-b-0 border-r-0 rounded-xl -ml-0.5" [ngClass]="getEnfasisColor().border">
			<h2 class="text-xl font-bold">{{ cardData().area }}</h2>
      <div class="flex flex-row gap-2 items-end">
        <p class="text-4xl font-bold" [ngClass]="getEnfasisColor().color">{{ cardData().operativity | percent:'1.2-2' }}</p>
        <p class="text-xs font-bold ml-1 bg-surface-300/50 dark:bg-surface-700 rounded-full px-2 py-1 text-surface-700 dark:text-surface-200">Operatividad</p>
      </div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'glass-effect rounded-2xl justify-center shadow-lg',

	},
})
export class OperativityCard implements OnInit {
	public cardData = input.required<CardOperativity>();
  constructor() {
    
  }

  ngOnInit(): void {
    
  }

  getEnfasisColor(): {border: string, color: string} {
    if (!this.cardData()) return {border: 'border-surface-300', color: 'text-surface-300'};
    if(this.cardData().area.toUpperCase() === 'ENSAMBLE I') {
      return this.cardData().operativity >= .85 ? {border: 'border-emerald-500 dark:border-emerald-700', color: 'text-emerald-500 dark:text-emerald-700'} : this.cardData().operativity >= .7 && this.cardData().operativity < .85 ? {border: 'border-amber-500', color: 'text-amber-500'} : {border: 'border-red-500', color: 'text-red-500'};
    }
    if(this.cardData().area.toUpperCase() === 'ENSAMBLE II') {
      return this.cardData().operativity >= .85 ? {border: 'border-emerald-500 dark:border-emerald-700', color: 'text-emerald-500 dark:text-emerald-700'} : this.cardData().operativity >= .7 && this.cardData().operativity < .85 ? {border: 'border-amber-500', color: 'text-amber-500'} : {border: 'border-red-500', color: 'text-red-500'};
    }
    if(this.cardData().area.toUpperCase() === 'ENSAMBLE III') {
      return this.cardData().operativity >= .85 ? {border: 'border-emerald-500 dark:border-emerald-700', color: 'text-emerald-500 dark:text-emerald-700'} : this.cardData().operativity >= .7 && this.cardData().operativity < .85 ? {border: 'border-amber-500', color: 'text-amber-500'} : {border: 'border-red-500', color: 'text-red-500'};
    }
    if(this.cardData().area.toUpperCase() === 'PCP CORTE') {
      return this.cardData().operativity >= .75 ? {border: 'border-emerald-500 dark:border-emerald-700', color: 'text-emerald-500 dark:text-emerald-700'} : this.cardData().operativity >= .7 && this.cardData().operativity < .75 ? {border: 'border-amber-500', color: 'text-amber-500'} : {border: 'border-red-500', color: 'text-red-500'};
    }
    if(this.cardData().area.toUpperCase() === 'PCP ESTAMPADO') {
      return this.cardData().operativity >= .70? {border: 'border-emerald-500 dark:border-emerald-700', color: 'text-emerald-500 dark:text-emerald-700'} : this.cardData().operativity >= .7 && this.cardData().operativity < .75 ? {border: 'border-amber-500', color: 'text-amber-500'} : {border: 'border-red-500', color: 'text-red-500'};
    }
    return this.cardData().operativity < 0.9 ? {border: 'border-red-500 dark:border-red-700', color: 'text-red-500 dark:text-red-700'} : {border: 'border-green-500 dark:border-green-700', color: 'text-green-500 dark:text-green-700'};
  }
}
