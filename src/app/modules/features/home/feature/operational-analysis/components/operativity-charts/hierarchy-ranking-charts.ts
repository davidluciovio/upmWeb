import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Managment } from '../../services/load-data';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { CommonModule } from '@angular/common';

export type RankingLevel = 'manager' | 'jefe' | 'supervisor' | 'leader';

@Component({
	selector: 'app-ranking-chart', // Renamed selector to singular
	standalone: true,
	imports: [Charts, CommonModule],
	template: `
		<div class="ranking-card h-full">
			<div
				class="glass-effect p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex items-center gap-3 mb-6">
					<div class="w-2 h-6 rounded-full" [style.backgroundColor]="color()"></div>
					<h3 class="text-sm font-black uppercase tracking-tighter text-slate-700 dark:text-slate-200 italic">
						Ranking: {{ title() }}
						<span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest not-italic mt-0.5">Top Operatividad</span>
					</h3>
				</div>
				<div class="grow">
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
				min-height: 400px;
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
	// Renamed class to singular
	public managments = input.required<Managment[]>();
	public level = input.required<RankingLevel>();
	public title = input.required<string>();
	public color = input.required<string>();

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
			area: stats.areas.size > 2 ? `${stats.areas.size} Áreas` : Array.from(stats.areas).join(',\n'),
			val: stats.total / stats.count,
		}));

		// Sort descending and take top 10 to avoid overcrowding
		const sorted = [...data].sort((a, b) => b.val - a.val).slice(0, 10);

		return {
			series: [
				{
					name: 'Operatividad',
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
