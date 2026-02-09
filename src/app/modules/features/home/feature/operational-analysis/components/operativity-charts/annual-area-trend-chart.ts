import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { AnnualAreaTrend } from '../../services/load-data';

@Component({
	selector: 'app-annual-area-trend-chart',
	standalone: true,
	imports: [Charts],
	template: `
		<div
			class="p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
		>
			<div class="flex items-center gap-3 mb-6">
				<div class="w-2 h-6 rounded-full bg-blue-600"></div>
				<h3 class="text-sm font-black uppercase tracking-tighter text-slate-700 dark:text-slate-200 italic">
					Tendencia Anual por Área
					<span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest not-italic mt-0.5">年次エリアトレンド</span>
				</h3>
			</div>
			<div class="grow">
				<chart [chartOptions]="chartOptions()"></chart>
			</div>
		</div>
	`,
	styles: [
		`
			:host {
				display: block;
				width: 100%;
				height: 100%;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnualAreaTrendChart {
	readonly data = input.required<AnnualAreaTrend[]>();

	chartOptions = computed(() => {
		const areaData = this.data();

		if (!areaData || areaData.length === 0) {
			return {
				series: [],
				chart: { type: 'bar', height: 350, toolbar: { show: true } },
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
