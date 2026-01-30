import { Component, computed, input } from '@angular/core';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { AnnualAreaTrend } from '../../services/load-data';

@Component({
	selector: 'app-annual-area-trend-chart',
	imports: [Charts],
	template: `
		<div class="glass-effect p-6 rounded-lg border border-slate-300 dark:border-slate-800">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-4">
					<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
						Tendencia Anual por Área <span class="text-slate-400 font-normal">/ 年次エリアトレンド</span>
					</h2>
				</div>
			</div>
			<chart [chartOptions]="chartOptions()"></chart>
		</div>
	`,
})
export class AnnualAreaTrendChart {
	readonly data = input.required<AnnualAreaTrend[]>();

	chartOptions = computed(() => {
		const areaData = this.data();

		if (!areaData || areaData.length === 0) {
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

		// Sort areas by average operativity (descending) to show them ranked
		const sortedAreaData = [...areaData].sort((a, b) => {
			const avgA = a.months.reduce((acc, m) => acc + m.operativity, 0) / a.months.length;
			const avgB = b.months.reduce((acc, m) => acc + m.operativity, 0) / b.months.length;
			return avgB - avgA;
		});

		const categories = sortedAreaData[0].months.map((m) => m.monthName);

		const series = sortedAreaData.map((area) => ({
			name: area.area,
			data: area.months.map((m) => parseFloat((m.operativity * 100).toFixed(1))),
		}));

		return {
			series: series,
			chart: {
				type: 'bar',
				height: 350,
				toolbar: { show: false },
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
				// Stacked bar chart for better comparison across months
				stacked: false,
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '85%',
					borderRadius: 4,
					dataLabels: {
						position: 'top', // top, center, bottom
					},
				},
			},
			dataLabels: {
				enabled: true,
				orientation: 'vertical',
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent'],
			},
			xaxis: {
				categories: categories,
				labels: {
					style: { colors: '#94a3b8', fontSize: '12px', fontWeight: '600' },
				},
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				labels: {
					style: { colors: '#64748b', fontSize: '11px', fontWeight: '600' },
					formatter: (val: number) => val.toFixed(0) + '%',
				},
				min: 0,
				max: 100,
			},
			grid: {
				borderColor: 'rgba(226, 232, 240, 0.1)',
				strokeDashArray: 4,
				yaxis: { lines: { show: true } },
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				labels: {
					colors: '#64748b',
				},
			},
			tooltip: {
				theme: 'dark',
				y: {
					formatter: (val: number) => val + '%',
				},
			},
			colors: ['#1e40af', '#059669', '#4f46e5', '#d97706', '#2563eb', '#0d9488', '#e11d48'],
			annotations: {
				yaxis: [
					{
						y: 85,
						borderColor: '#22c55e',
						label: {
							borderColor: '#22c55e',
							style: {
								color: '#fff',
								background: '#22c55e',
							},
							text: 'Objetivo (85%)',
						},
					},
				],
			},
		};
	});
}
