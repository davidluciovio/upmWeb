import { Component, computed, input } from '@angular/core';
import { PressGroup } from '../../operational-analysis/services/load-data';
import { Charts } from '../../../../../../shared/components/charts/charts';

@Component({
	selector: 'app-press-operativity-chart',
	imports: [Charts],
	template: `
		<div class="glass-effect p-6 rounded-lg border border-slate-300 dark:border-slate-800">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
					Operatividad por Prensa <span class="text-slate-400 font-normal">/ プレス別稼働率</span>
				</h2>
			</div>
			<chart [chartOptions]="chartOptions()"></chart>
		</div>
	`,
})
export class PressOperativityChart {
	readonly data = input.required<PressGroup[]>();

	chartOptions = computed(() => {
		const pressData = this.data();

		if (!pressData || pressData.length === 0) {
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

		const categories = pressData.map((p) => p.pressName);
		const seriesData = pressData.map((p) => parseFloat((p.totalOperativity * 100).toFixed(1)));

		return {
			series: [
				{
					name: 'Operatividad',
					data: seriesData,
				},
			],
			chart: {
				type: 'bar',
				height: 350,
				toolbar: { show: false },
				animations: { enabled: true, speed: 800 },
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
			},
			plotOptions: {
				bar: {
					borderRadius: 8,
					columnWidth: '50%',
					distributed: true,
					dataLabels: {
						position: 'top',
					},
				},
			},
			dataLabels: {
				enabled: true,
				formatter: (val: number) => val + '%',
				offsetY: -20,
				style: {
					fontSize: '12px',
					colors: ['#64748b'],
					fontWeight: '700',
				},
			},
			xaxis: {
				categories: categories,
				labels: {
					style: { colors: '#94a3b8', fontSize: '10px', fontWeight: '700' },
				},
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				max: 110,
				labels: {
					style: { colors: '#64748b', fontSize: '11px', fontWeight: '600' },
					formatter: (val: number) => val.toFixed(0) + '%',
				},
			},
			grid: {
				borderColor: 'rgba(226, 232, 240, 0.1)',
				strokeDashArray: 4,
				xaxis: { lines: { show: false } },
				yaxis: { lines: { show: true } },
			},
			tooltip: {
				theme: 'dark',
				y: {
					formatter: (val: number) => val + '%',
				},
			},
			colors: ['#1e40af', '#059669', '#4f46e5', '#d97706', '#2563eb', '#0d9488', '#e11d48', '#7c3aed', '#db2777', '#ea580c'],
			annotations: {
				yaxis: [
					{
						y: 100,
						borderColor: '#22c55e',
						label: {
							borderColor: '#22c55e',
							style: {
								color: '#fff',
								background: '#22c55e',
							},
							text: 'Objetivo (100%)',
						},
					},
				],
			},
		};
	});
}
