import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SupervisorOperativityDayTrend } from '../../services/load-data';
import { Charts } from '../../../../../../../shared/components/charts/charts';

@Component({
	selector: 'app-supervisor-heatmap-chart-operativity',
	imports: [Charts],
	template: `
		<div class="glass-effect p-6 rounded-lg border border-slate-300 dark:border-slate-800">
			<div class="flex items-center gap-4 mb-4">
				<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tight">
					Mapa de Calor de Eficiencia por Supervisor <span class="text-slate-400 font-normal">/ 監督者別効率ヒートマップ</span>
				</h2>
			</div>
			<div class="w-full overflow-x-auto">
				<div class="min-w-[800px]">
					<chart [chartOptions]="chartOptions()"></chart>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorHeatmapChartOperativity {
	readonly data = input.required<SupervisorOperativityDayTrend[]>();

	chartOptions = computed(() => {
		const data = this.data();
		if (!data || data.length === 0) {
			return {
				series: [],
				chart: {
					type: 'heatmap',
					height: 350,
				},
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

		const series: any[] = [];

		data.forEach((s) => {
			// Add Supervisor Series
			series.push({
				name: s.supervisor,
				data: s.dayOperativities.map((d) => ({
					x: new Date(d.day).toLocaleDateString(),
					y: parseFloat((d.operativity * 100).toFixed(1)),
				})),
			});

			// Add Leaders Series (indented)
			if (s.leaders && s.leaders.length > 0) {
				s.leaders.forEach((l) => {
					series.push({
						name: `\u00A0\u00A0\u00A0\u00A0↳ ${l.leader}`,
						data: l.dayOperativities.map((d) => ({
							x: new Date(d.day).toLocaleDateString(),
							y: parseFloat((d.operativity * 100).toFixed(1)),
						})),
					});
				});
			}
		});

		return {
			series: series,
			chart: {
				type: 'heatmap',
				height: Math.max(450, series.length * 40),
				fontFamily: 'Inter, sans-serif',
				background: 'transparent',
				toolbar: { show: false },
				animations: { enabled: true },
				dataLabels: { enabled: true },
			},
			plotOptions: {
				heatmap: {
					shadeIntensity: 0.5,
					radius: 4,
					// useFillColorAsStroke: true,
					colorScale: {
						ranges: [
							{
								from: 0,
								to: 69.9,
								name: 'Bajo (<70%)',
								color: '#be123c',
							},
							{
								from: 70,
								to: 84.9,
								name: 'Medio (70%-84%)',
								color: '#b45309',
							},
							{
								from: 85,
								to: 100,
								name: 'Alto (≥85%)',
								color: '#047857',
							},
						],
					},
				},
			},
			dataLabels: {
				enabled: true,
				formatter: function (val: number) {
					return val + '%';
				},
				style: { fontSize: '10px', fontWeight: '700' },
			},
			xaxis: {
				labels: {
					style: { colors: '#94a3b8', fontSize: '10px', fontWeight: '700' },
				},
				tooltip: { enabled: false },
			},
			yaxis: {
				reversed: true,
				labels: {
					style: { colors: '#64748b', fontSize: '11px', fontWeight: '600' },
				},
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				markers: { radius: 12 },
				labels: { colors: '#64748b' },
			},
			tooltip: {
				theme: 'dark',
				y: {
					formatter: function (val: number) {
						return val + '%';
					},
				},
			},
		};
	});
}
