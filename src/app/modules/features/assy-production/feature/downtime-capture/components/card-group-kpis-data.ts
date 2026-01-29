import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { DowntimeCaptureResponseInterface } from '../services/load-data-downtime-capture';

@Component({
	selector: 'card-group-kpis-data',
	standalone: true,
	imports: [DecimalPipe, PercentPipe],
	host: {
		class: 'block h-full',
	},
	template: `
		<div class="flex flex-col gap-4 h-full">
			<!-- Total Production Card (Split) -->
			<div
				class="flex-1 glass-effect p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-center border border-slate-200/50 dark:border-slate-800/50 shadow-lg"
			>
				<div class="flex items-center justify-between relative z-10 w-full">
					<div class="flex-1 grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Producido</p>
							<h3 class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
								{{ kpis().total | number }} <span class="text-xs font-medium opacity-40 italic">pzas</span>
							</h3>
						</div>
						<div class="space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4">
							<p class="text-[10px] font-black uppercase tracking-widest text-indigo-500/80">Min/Pza</p>
							<h3 class="text-2xl font-black text-slate-700 dark:text-indigo-300 tracking-tighter">
								{{ kpis().avgMinutesPzas | number: '1.2-2' }} <span class="text-xs font-medium opacity-40 italic text-slate-400">min</span>
							</h3>
						</div>
					</div>
					<div
						class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm border border-indigo-500/20 ml-2"
					>
						<span class="material-symbols-outlined text-2xl">analytics</span>
					</div>
				</div>
				<div class="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
			</div>

			<!-- Planned Card (Split) -->
			<div
				class="flex-1 glass-effect p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-center border border-slate-200/50 dark:border-slate-800/50 shadow-lg"
			>
				<div class="flex items-center justify-between relative z-10 w-full">
					<div class="flex-1 grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Meta Planeada</p>
							<h3 class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
								{{ kpis().planned | number: '1.0-0' }} <span class="text-xs font-medium opacity-40 italic">pzas</span>
							</h3>
						</div>
						<div class="space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4">
							<p class="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Objetivo (min)</p>
							<h3 class="text-2xl font-black text-slate-700 dark:text-emerald-300 tracking-tighter">
								{{ kpis().avgObjetiveTime | number: '1.1-1' }} <span class="text-xs font-medium opacity-40 italic text-slate-400">min</span>
							</h3>
						</div>
					</div>
					<div
						class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm border border-emerald-500/20 ml-2"
					>
						<span class="material-symbols-outlined text-2xl">task_alt</span>
					</div>
				</div>
				<div class="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
			</div>

			<!-- Efficiency Card -->
			<div
				class="flex-1 glass-effect p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-amber-500 flex flex-col justify-center shadow-lg border-y border-r border-slate-200/50 dark:border-slate-800/50"
			>
				<div class="flex items-center justify-between relative z-10 mb-5">
					<div class="space-y-1">
						<p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Eficiencia Total</p>
						<h3 class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{{ kpis().efficiency | percent: '1.1-1' }}</h3>
					</div>
					<div
						class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm border border-amber-500/20"
					>
						<span class="material-symbols-outlined text-3xl">bolt</span>
					</div>
				</div>
				<div class="relative z-10 px-1">
					<div
						class="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-300/30 dark:border-slate-700/30"
					>
						<div
							class="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
							[style.width.%]="kpis().efficiency*100"
						></div>
					</div>
				</div>
				<div class="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGroupKpisData {
	public data = input.required<DowntimeCaptureResponseInterface>();

	protected kpis = computed(() => {
		const data = this.data();
		let total = 0;
		let planned = 0;
		let totalMinutesPzas = 0;
		let totalEfectivity = 0;
		let hourlyCount = 0;
		let sumObjetiveTime = 0;

		data.partNumberDataProductions.forEach((part) => {
			sumObjetiveTime += part.objetiveTime;
			part.hourlyProductionDatas.forEach((hour) => {
				total += hour.producedQuantity;
				planned += hour.objetiveQuantity;
				totalMinutesPzas += hour.minutesPzas;
				totalEfectivity += hour.efectivity;
				hourlyCount++;
			});
		});

		const avgMinutesPzas = hourlyCount > 0 ? totalMinutesPzas / hourlyCount : 0;
		const avgObjetiveTime = data.partNumberDataProductions.length > 0 ? sumObjetiveTime / data.partNumberDataProductions.length : 0;
		const efficiency = hourlyCount > 0 ? totalEfectivity / hourlyCount : 0;

		return {
			total,
			planned,
			avgMinutesPzas,
			avgObjetiveTime,
			efficiency,
		};
	});
}
