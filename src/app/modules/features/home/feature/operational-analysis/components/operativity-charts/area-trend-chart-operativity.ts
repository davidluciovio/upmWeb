import { Component, computed, input, signal } from '@angular/core';
import { AreaOperativityDayTrend } from '../../services/load-data';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-area-trend-chart-operativity',
	imports: [Charts, FormsModule],
	template: `
		<div class="glass-effect p-6 rounded-lg border border-slate-300 dark:border-slate-800">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-4">
					<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
						Tendencia de Eficiencia <span class="text-slate-400 font-normal">/ 効率トレンド</span>
					</h2>
				</div>
				<div class="flex items-center gap-2 p-1 bg-slate-300 dark:bg-slate-900 rounded-xl">
					<button
						(click)="isGlobalView.set(false)"
						[class.bg-slate-200]="!isGlobalView()"
						[class.dark:bg-slate-700]="!isGlobalView()"
						[class.shadow-sm]="!isGlobalView()"
						[class.text-sky-600]="!isGlobalView()"
						[class.text-slate-500]="isGlobalView()"
						class="px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all"
					>
						Por Área
					</button>
					<button
						(click)="isGlobalView.set(true)"
						[class.bg-slate-200]="isGlobalView()"
						[class.dark:bg-slate-700]="isGlobalView()"
						[class.shadow-sm]="isGlobalView()"
						[class.text-sky-600]="isGlobalView()"
						[class.text-slate-500]="!isGlobalView()"
						class="px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all"
					>
						Global
					</button>
				</div>
			</div>
			<chart [chartOptions]="chartOptions()"></chart>
		</div>
	`,
})
export class AreaTrendChartOperativity {
	readonly data = input.required<AreaOperativityDayTrend[]>();
	isGlobalView = signal(false);

	chartOptions = computed(() => {
		const areaData = this.data();
		const isGlobal = this.isGlobalView();

		if (!areaData || areaData.length === 0) {
			return {
				series: [],
				chart: { type: 'line', height: 350 },
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

		const categories = areaData[0].dayOperativities.map((d) => new Date(d.day).toLocaleDateString());

		let series: any[] = [];

		if (isGlobal) {
			const globalData = areaData[0].dayOperativities.map((_, index) => {
				const sum = areaData.reduce((acc, area) => acc + area.dayOperativities[index].operativity, 0);
				return parseFloat(((sum / areaData.length) * 100).toFixed(1));
			});
			series = [{ name: 'Promedio Global', data: globalData }];
		} else {
			series = areaData.map((area) => ({
				name: area.area,
				data: area.dayOperativities.map((d) => parseFloat((d.operativity * 100).toFixed(1))),
			}));
		}

		return {
			series: series,
			chart: {
				type: 'line',
				height: 350,
				toolbar: { show: false },
				animations: { enabled: true, speed: 800 },
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
				zoom: { enabled: false },
			},
			stroke: {
				curve: 'straight',
				width: 3,
			},
			dataLabels: {
				enabled: true,
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
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				fontWeight: 600,
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
