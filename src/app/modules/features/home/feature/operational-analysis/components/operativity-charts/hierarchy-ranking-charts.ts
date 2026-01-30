import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Managment } from '../../services/load-data';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-hierarchy-ranking-charts',
	standalone: true,
	imports: [Charts, CommonModule],
	template: `
		<section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
			<!-- Managers Ranking -->
			<div class="ranking-card h-full">
				<ng-container
					*ngTemplateOutlet="
						rankingChart;
						context: {
							title: 'Gerentes',
							color: '#4f46e5',
							options: managerChartOptions(),
						}
					"
				></ng-container>
			</div>

			<!-- Jefes Ranking -->
			<div class="ranking-card h-full">
				<ng-container
					*ngTemplateOutlet="
						rankingChart;
						context: {
							title: 'Jefes',
							color: '#10b981',
							options: jefeChartOptions(),
						}
					"
				></ng-container>
			</div>

			<section class="col-span-2 grid grid-cols-1  gap-6">
				<!-- Supervisors Ranking -->
				<div class="ranking-card h-full">
					<ng-container
						*ngTemplateOutlet="
							rankingChart;
							context: {
								title: 'Supervisores',
								color: '#0ea5e9',
								options: supervisorChartOptions(),
							}
						"
					></ng-container>
				</div>

				<!-- Leaders Ranking -->
				<div class="ranking-card h-full">
					<ng-container
						*ngTemplateOutlet="
							rankingChart;
							context: {
								title: 'Líderes',
								color: '#64748b',
								options: leaderChartOptions(),
							}
						"
					></ng-container>
				</div>
			</section>
		</section>

		<ng-template #rankingChart let-title="title" let-color="color" let-options="options">
			<div
				class="glass-effect p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex items-center gap-3 mb-3">
					<div class="w-2 h-6 rounded-full" [style.backgroundColor]="color"></div>
					<h3 class="text-sm font-black uppercase tracking-tighter text-slate-700 dark:text-slate-200 italic">
						Ranking: {{ title }}
						<span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest not-italic mt-0.5">Top Operatividad</span>
					</h3>
				</div>
				<div class="grow">
					<chart [chartOptions]="options"></chart>
				</div>
			</div>
		</ng-template>
	`,
	styles: [
		`
			:host {
				display: block;
				width: 100%;
			}
			.ranking-card {
				min-height: 400px;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyRankingCharts {
	public managments = input.required<Managment[]>();

	managerChartOptions = computed(() =>
		this._createChartOptions(
			this.managments().map((m) => ({ name: m.managment, area: m.area, val: m.operativity })),
			'#4f46e5',
		),
	);

	jefeChartOptions = computed(() => {
		const flat = this.managments().flatMap((m) => m.jefes.map((j) => ({ name: j.jefe, area: m.area, val: j.operativity })));
		return this._createChartOptions(flat, '#10b981');
	});

	supervisorChartOptions = computed(() => {
		const flat = this.managments().flatMap((m) =>
			m.jefes.flatMap((j) => j.supervisors.map((s) => ({ name: s.supervisor, area: m.area, val: s.operativity }))),
		);
		return this._createChartOptions(flat, '#0ea5e9');
	});

	leaderChartOptions = computed(() => {
		const flat = this.managments().flatMap((m) =>
			m.jefes.flatMap((j) => j.supervisors.flatMap((s) => s.leaders.map((l) => ({ name: l.leader, area: m.area, val: l.operativity })))),
		);
		return this._createChartOptions(flat, '#64748b');
	});

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
			tooltip: {
				theme: 'dark',
				y: { formatter: (val: number) => val + '%' },
			},
		} as any;
	}
}
