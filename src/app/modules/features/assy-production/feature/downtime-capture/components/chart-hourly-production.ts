import { Component, computed, input, OnInit, viewChild } from '@angular/core';
import { Charts } from '../../../../../../shared/components/charts/charts';
import { DowntimeCaptureResponseInterface } from '../services/load-data-downtime-capture';

@Component({
	selector: 'chart-hourly-production',
	standalone: true,
	imports: [Charts],
	template: `
		<div class="glass-effect px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden relative h-full">
			<div class="flex items-center justify-between mb-6 relative z-10">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
						<span class="material-symbols-outlined">shutter_speed</span>
					</div>
					<div>
						<h2 class="text-xl font-black text-slate-800 dark:text-white italic uppercase tracking-tighter leading-none">Producción por hora</h2>
						<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Comparativa vs Objetivo</p>
					</div>
				</div>
				<div class="flex gap-2">
					<div class="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full">
						<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
						<span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En Vivo</span>
					</div>
				</div>
			</div>

			<div class="relative z-10">
				@if (chartOptions()) {
					<chart [chartOptions]="chartOptions()"></chart>
				} @else {
					<div class="flex items-center justify-center h-64">
						<span class="text-slate-400">Cargando...</span>
					</div>
				}
			</div>

			<!-- Background decorative element -->
			<div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
		</div>
	`,
})
export class ChartHourlyProduction {
	readonly data = input<DowntimeCaptureResponseInterface>();
	private chartComponent = viewChild.required(Charts);

	/**
	 * Actualiza solo los datos del gráfico para una animación más fluida
	 */
	public updateChartOnly() {
		const options = this.chartOptions();
		if (options && options.series) {
			this.chartComponent().updateSeries(options.series);
		}
	}

	protected chartOptions = (() => {
		const data = this.data();

		if (!data || !data.partNumberDataProductions) {
			return {
				series: [],
				chart: { type: 'bar', height: 250 },
				noData: {
					text: 'No hay datos disponibles',
					align: 'center',
					verticalAlign: 'middle',
					style: {
						color: '#94a3b8',
						fontSize: '16px',
					},
				},
			};
		}

		const categories =
			data.partNumberDataProductions[0]?.hourlyProductionDatas.map((h) => {
				const start = new Date(h.startProductionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
				return `${start}`;
			}) || [];

		return {
			series: [
				...data.partNumberDataProductions.map((item) => ({
					name: item.partNumberName,
					type: 'bar',
					data: (item.hourlyProductionDatas || []).map((part) => part.producedQuantity),
				})),
				{
					name: 'Objetivo Promedio',
					type: 'line',
					data:
						data.partNumberDataProductions[0]?.hourlyProductionDatas.map((_, hourIndex) => {
							const sum = data.partNumberDataProductions.reduce((acc, part) => {
								return acc + (part.hourlyProductionDatas[hourIndex]?.objetiveQuantity || 0);
							}, 0);
							return Math.round(sum / data.partNumberDataProductions.length);
						}) || [],
				},
			],
			chart: {
				type: 'line',
				height: 300,
				animations: { enabled: false },
			},
			xaxis: {
				categories: categories,
				labels: {
					rotate: -45,
					style: { fontSize: '12px' },
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					borderRadius: 4,
					dataLabels: {
						position: 'top',
					},
				},
			},
			dataLabels: {
				enabled: true,
				formatter: function (val: any, opts: any) {
					return val + ' pzas';
				},
			},
		};
	});

	constructor() {}
}
