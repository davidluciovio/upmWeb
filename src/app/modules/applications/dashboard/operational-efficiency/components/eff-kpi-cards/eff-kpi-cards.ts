import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

export interface AreaKpi {
	area: string;
	operativity: number;
	workTime: number;
	totalTime: number;
	stopTime: number;
	stability: number;
}

@Component({
	selector: 'app-eff-kpi-cards',
	standalone: true,
	imports: [CommonModule, DecimalPipe],
	template: `
		<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
			@for (item of data(); track item.area) {
				<div class="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 hover:shadow-md transition-shadow relative overflow-hidden group">
					<!-- Decorator Line -->
					<div
						class="absolute top-0 left-0 w-1 h-full"
						[ngClass]="{
							'bg-emerald-500': item.operativity >= 90,
							'bg-amber-500': item.operativity >= 80 && item.operativity < 90,
							'bg-red-500': item.operativity < 80,
						}"
					></div>

					<div class="pl-3">
						<h3 class="font-bold text-lg text-[#002855] uppercase tracking-tight truncate">{{ item.area }}</h3>

						<div class="mt-3 flex items-end gap-2">
							<span
								class="text-3xl font-black"
								[ngClass]="{
									'text-emerald-600': item.operativity >= 90,
									'text-amber-600': item.operativity >= 80 && item.operativity < 90,
									'text-red-600': item.operativity < 80,
								}"
							>
								{{ item.operativity | number: '1.1-1' }}<span class="text-sm">%</span>
							</span>
							<span class="mb-1 text-[10px] bg-base-200 px-1.5 py-0.5 rounded text-base-content/60 font-medium">OEE</span>
						</div>
					</div>
				</div>
			}
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffKpiCardsComponent {
	data = input<AreaKpi[]>([]);
}
