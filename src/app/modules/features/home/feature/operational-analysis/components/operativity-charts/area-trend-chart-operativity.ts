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
		<div class="operativity-chart-card">
			<div class="chart-header-row">
				<div class="chart-title-box">
					<div class="chart-indicator-bar bg-emerald"></div>
					<div class="chart-titles">
						<h3 class="chart-main-title">Tendencia de Eficiencia</h3>
						<span class="chart-subtitle-ja">効率トレンド</span>
					</div>
				</div>
				<div class="chart-view-toggle">
					<button (click)="isGlobalView.set(false)" [class.active]="!isGlobalView()" class="toggle-btn">Por Área</button>
					<button (click)="isGlobalView.set(true)" [class.active]="isGlobalView()" class="toggle-btn">Global</button>
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
			.chart-indicator-bar.bg-emerald {
				background-color: #059669;
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

			.chart-view-toggle {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				padding: 0.25rem;
				background-color: rgba(226, 232, 240, 0.5);
				border-radius: 0.75rem;
				border: 1px solid #e2e8f0;
				box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
			}
			:host-context(.dark-mode) .chart-view-toggle {
				background-color: rgba(30, 41, 59, 0.5);
				border-color: #334155;
			}

			.toggle-btn {
				padding: 0.375rem 1rem;
				font-size: 10px;
				font-weight: 900;
				text-transform: uppercase;
				border-radius: 0.5rem;
				border: none;
				background: transparent;
				color: #64748b;
				cursor: pointer;
				transition: all 0.2s;
			}
			.toggle-btn.active {
				background-color: #ffffff;
				color: #0284c7;
				box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
			}
			:host-context(.dark-mode) .toggle-btn.active {
				background-color: #334155;
				color: #38bdf8;
			}

			.chart-body {
				flex-grow: 1;
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
