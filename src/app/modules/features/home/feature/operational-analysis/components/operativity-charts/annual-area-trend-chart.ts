import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Charts } from '../../../../../../../shared/components/charts/charts';
import { AnnualAreaTrend } from '../../services/load-data';

@Component({
	selector: 'app-annual-area-trend-chart',
	standalone: true,
	imports: [Charts],
	template: `
		<div class="operativity-chart-card">
			<div class="chart-header-row">
				<div class="chart-title-box">
					<div class="chart-indicator-bar bg-blue"></div>
					<div class="chart-titles">
						<h3 class="chart-main-title">Tendencia Anual por Área</h3>
						<span class="chart-subtitle-ja">年次エリアトレンド</span>
					</div>
				</div>
			</div>
			<div class="chart-body">
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

			.operativity-chart-card {
				display: flex;
				flex-direction: column;
				height: 100%;
				padding: 1.25rem;
				background-color: rgba(255, 255, 255, 0.6);
				border: 1px solid #e2e8f0;
				border-radius: 0.75rem;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
				transition: all 0.2s;
			}
			.operativity-chart-card:hover {
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
			}
			:host-context(.dark-mode) .operativity-chart-card {
				background-color: #0f172a;
				border-color: #1e293b;
			}

			.chart-header-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 1.5rem;
			}

			.chart-title-box {
				display: flex;
				align-items: center;
				gap: 0.75rem;
			}
			.chart-indicator-bar {
				width: 0.5rem;
				height: 1.5rem;
				border-radius: 9999px;
			}
			.chart-indicator-bar.bg-blue {
				background-color: #2563eb;
			}

			.chart-titles {
				display: flex;
				flex-direction: column;
			}
			.chart-main-title {
				font-size: 0.875rem;
				font-weight: 900;
				color: #334155;
				text-transform: uppercase;
				letter-spacing: -0.025em;
				font-style: italic;
				margin: 0;
			}
			:host-context(.dark-mode) .chart-main-title {
				color: #e2e8f0;
			}
			.chart-subtitle-ja {
				font-size: 9px;
				font-weight: 700;
				color: #94a3b8;
				text-transform: uppercase;
				letter-spacing: 0.1em;
				margin-top: 0.125rem;
			}

			.chart-body {
				flex-grow: 1;
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
