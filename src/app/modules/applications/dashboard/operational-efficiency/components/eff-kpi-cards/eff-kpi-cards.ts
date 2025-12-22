import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
	selector: 'app-eff-kpi-cards',
	standalone: true,
	imports: [CommonModule, DecimalPipe],
	template: `
		<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			<!-- Operatividad Media -->
			<div class="bg-base-100 p-5 rounded-xl border-l-4 border-emerald-600 shadow-sm">
				<p class="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Operatividad</p>
				<span class="text-[0.7rem] text-base-content/40 font-normal block">平均稼働率 (Operativity)</span>
				<div class="mt-3">
					<span class="text-3xl font-black text-base-content">{{ operativity() | number: '1.1-1' }}%</span>
				</div>
			</div>

			<!-- Tiempo Total -->
			<div class="bg-base-100 p-5 rounded-xl border-l-4 border-slate-400 shadow-sm">
				<p class="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Tiempo Total</p>
				<span class="text-[0.7rem] text-base-content/40 block leading-tight">総時間 (Total Time)</span>
				<div class="mt-3 text-2xl font-black text-base-content">{{ totalTime() | number: '1.0-0' }} <span class="text-xs font-normal">min</span></div>
			</div>

			<!-- Trabajo -->
			<div class="bg-base-100 p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm">
				<p class="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Tiempo Trabajo</p>
				<span class="text-[0.7rem] text-base-content/40 block leading-tight">稼働時間 (Work Time)</span>
				<div class="mt-3 text-2xl font-black text-base-content">{{ workTime() | number: '1.0-0' }} <span class="text-xs font-normal">min</span></div>
			</div>

			<!-- Paro -->
			<div class="bg-base-100 p-5 rounded-xl border-l-4 border-red-500 shadow-sm">
				<p class="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Tiempo Paro</p>
				<span class="text-[0.7rem] text-base-content/40 block leading-tight">停止時間 (Downtime)</span>
				<div class="mt-3 text-2xl font-black text-red-600">{{ stopTime() | number: '1.0-0' }} <span class="text-xs font-normal">min</span></div>
			</div>

			<!-- Estabilidad -->
			<div class="bg-base-100 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
				<p class="text-[10px] font-bold text-base-content/60 uppercase tracking-widest">Estabilidad</p>
				<span class="text-[0.7rem] text-base-content/40 block leading-tight">プロセスの安定性</span>
				<div class="mt-3 text-2xl font-black text-blue-600">{{ stability() | number: '1.1-1' }}%</div>
			</div>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffKpiCardsComponent {
	operativity = input<number>(0);
	workTime = input<number>(0);
	totalTime = input<number>(0);
	stopTime = input<number>(0);
	stability = input<number>(0);
}
