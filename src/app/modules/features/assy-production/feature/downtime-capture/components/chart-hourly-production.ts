import { Component, computed, input, OnInit } from '@angular/core';
import { Charts } from '../../../../../../shared/components/charts/charts';
import { DowntimeCaptureResponseInterface } from '../services/load-data-downtime-capture';

@Component({
	selector: 'chart-hourly-production',
	standalone: true,
	imports: [Charts],
	template: `
		<div class="glass-effect p-6 rounded-lg border border-slate-300 dark:border-slate-800">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-4">
					<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">Producción por hora</h2>
				</div>
			</div>
			<chart [chartOptions]="chartOptions()"></chart>
		</div>
	`,
})
export class ChartHourlyProduction {
	readonly data = input<DowntimeCaptureResponseInterface>();

	protected chartOptions = computed(() => {
		const data = this.data();

		if (!data || !data.partNumberDataProductions) {
			return {
				series: [],
				chart: { type: 'bar', height: 350 },
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
				height: 350,
				animations: { enabled: true },
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
