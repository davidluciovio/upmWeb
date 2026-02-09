import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaOperativityDayTrend } from '../../services/load-data';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-area-trend-chart-operativity',
	standalone: true,
	imports: [Charts, FormsModule, CommonModule],
	template: `
		<div
			class="p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
		>
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="w-2 h-6 rounded-full bg-emerald-600"></div>
					<h3 class="text-sm font-black uppercase tracking-tighter text-slate-700 dark:text-slate-200 italic">
						Tendencia de Eficiencia
						<span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest not-italic mt-0.5">効率トレンド</span>
					</h3>
				</div>
				<div
					class="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
				>
					<button
						(click)="isGlobalView.set(false)"
						[class]="!isGlobalView() ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-slate-500'"
						class="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all"
					>
						Por Área
					</button>
					<button
						(click)="isGlobalView.set(true)"
						[class]="isGlobalView() ? 'bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-400' : 'text-slate-500'"
						class="px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all"
					>
						Global
					</button>
				</div>
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
