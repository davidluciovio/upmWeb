import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { Managment } from '../../services/load-data';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

export type RankingLevel = 'manager' | 'jefe' | 'supervisor' | 'leader';

@Component({
	selector: 'app-ranking-chart',
	standalone: true,
	imports: [Charts, CommonModule],
	template: `
		<div class="ranking-card">
			<div class="operativity-chart-card">
				<div class="chart-header-row">
					<div class="chart-title-box">
						<div class="chart-indicator-bar" [style.backgroundColor]="color()"></div>
						<div class="chart-titles">
							<h3 class="chart-main-title">Ranking: {{ title() }}</h3>
							<span class="chart-subtitle-ja">{{ langService.translateDual('topOperativity') }}</span>
						</div>
					</div>
				</div>
				<div class="chart-body">
					<chart [chartOptions]="chartOptions()"></chart>
				</div>
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

			.ranking-card {
				height: 100%;
				min-height: 400px;
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

			:host ::ng-deep .text-wrap-labels {
				white-space: normal !important;
				word-break: break-word !important;
				text-align: center !important;
				width: 80px !important;
				display: block !important;
				line-height: 1.1 !important;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyRankingChart {
	public managments = input.required<Managment[]>();
	public level = input.required<RankingLevel>();
	public title = input.required<string>();
	public color = input.required<string>();

	public readonly langService = inject(LanguageService);

	chartOptions = computed(() => {
		const rawData = this._extractData(this.managments(), this.level());
		return this._createChartOptions(rawData, this.color());
	});

	private _extractData(managments: Managment[], level: RankingLevel): { name: string; area: string; val: number }[] {
		switch (level) {
			case 'manager':
				return managments.map((m) => ({ name: m.managment, area: m.area, val: m.operativity }));

			case 'jefe':
				return managments.flatMap((m) => m.jefes.map((j) => ({ name: j.jefe, area: m.area, val: j.operativity })));

			case 'supervisor':
				return managments.flatMap((m) => m.jefes.flatMap((j) => j.supervisors.map((s) => ({ name: s.supervisor, area: m.area, val: s.operativity }))));

			case 'leader':
				return managments.flatMap((m) =>
					m.jefes.flatMap((j) => j.supervisors.flatMap((s) => s.leaders.map((l) => ({ name: l.leader, area: m.area, val: l.operativity })))),
				);
			default:
				return [];
		}
	}

	private _createChartOptions(rawData: { name: string; area: string; val: number }[], color: string): ChartOptions {
		// Aggregate data by name to handle duplicates (averaging value and combining areas)
		const aggregatedMap = new Map<string, { total: number; count: number; areas: Set<string> }>();

		rawData.forEach((item) => {
			const key = item.name.trim(); // Normalize name
			if (!aggregatedMap.has(key)) {
				aggregatedMap.set(key, { total: 0, count: 0, areas: new Set() });
			}
			const entry = aggregatedMap.get(key)!;
			entry.total += item.val;
			entry.count++;
			if (item.area) {
				entry.areas.add(item.area);
			}
		});

		const data = Array.from(aggregatedMap.entries()).map(([name, stats]) => ({
			name: name,
			// If more than 3 areas, show count instead of listing all to avoid UI clutter
			area: stats.areas.size > 2 ? `${stats.areas.size} ${this.langService.translateDual('areasLabel')}` : Array.from(stats.areas).join(',\n'),
			val: stats.total / stats.count,
		}));

		// Sort descending and take top 10 to avoid overcrowding
		const sorted = [...data].sort((a, b) => b.val - a.val).slice(0, 10);

		return {
			series: [
				{
					name: this.langService.translateDual('operativity'),
					data: sorted.map((i) => parseFloat((i.val * 100).toFixed(1))),
				},
			],
			chart: {
				type: 'bar',
				height: 350,
				toolbar: { show: false },
				animations: { enabled: true, speed: 600 },
				background: 'transparent',
			},
			plotOptions: {
				bar: {
					horizontal: false,
					borderRadius: 4,
					columnWidth: '60%',
					distributed: false,
					dataLabels: { position: 'center' },
				},
			},
			colors: [color],
			dataLabels: {
				enabled: true,
				formatter: (val: number, opts?: any) => {
					const area = sorted[opts?.dataPointIndex]?.area || '';
					return [val + '%', ...area.split('\n')];
				},
				offsetY: 0,
				style: { fontSize: '10px', fontWeight: '700', colors: ['#ffffff'], textShadow: '0px 0px 4px rgba(0,0,0,0.5)' },
			},
			xaxis: {
				categories: sorted.map((i) => i.name),
				labels: {
					rotate: 0,
					rotateAlways: false,
					style: { fontSize: '10px', fontWeight: '700', colors: '#64748b' },
					trim: true,
				},
				axisBorder: { show: false },
				axisTicks: { show: false },
			},
			yaxis: {
				max: 100,
				labels: {
					show: true,
					style: { fontSize: '9px', fontWeight: '700', colors: '#64748b' },
					formatter: (val: number) => val.toFixed(0) + '%',
				},
			},
			grid: {
				borderColor: 'rgba(226, 232, 240, 0.05)',
				yaxis: { lines: { show: true } },
				xaxis: { lines: { show: false } },
			},
			legend: { show: false },
			tooltip: {
				theme: 'dark',
				y: { formatter: (val: number) => val + '%' },
			},
		} as any;
	}
}
