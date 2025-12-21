import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
	selector: 'app-kpi-cards',
	standalone: true,
	imports: [CommonModule, DecimalPipe],
	templateUrl: './kpi-cards.html',
})
export class KpiCardsComponent {
	@Input() globalAchievement: number = 0;
	@Input() totalReal: number = 0;
	@Input() totalObj: number = 0;
	@Input() difference: number = 0;
}
