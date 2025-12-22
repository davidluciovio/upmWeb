import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-kpi-cards',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    templateUrl: './kpi-cards.html',
    // OnPush asegura que las tarjetas no se vuelvan a renderizar 
    // a menos que cambien sus señales de entrada
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardsComponent {
    // Definición de Inputs como Signals
    globalAchievement = input<number>(0);
    totalReal = input<number>(0);
    totalObj = input<number>(0);
    difference = input<number>(0);

    // Computed para determinar estados visuales (evita lógica en el HTML)
    isOverTarget = computed(() => this.globalAchievement() >= 100);
    isDiffPositive = computed(() => this.difference() >= 0);
}