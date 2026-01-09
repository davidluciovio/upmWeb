import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AchievementDashboardDataService } from '../../achievement-dashboard/services/achievement-dashboard-data.service';
import { OperationalEfficiencyService } from '../../operational-efficiency/services/operational-efficiency.service';
import { Charts, ChartOptions } from '../../../../../shared/components/charts/charts';
import { forkJoin, interval, Subscription } from 'rxjs';

@Component({
	selector: 'app-slides-dashboard',
	standalone: true,
	imports: [CommonModule, DecimalPipe, Charts],
	templateUrl: './slides-dashboard.html',
	styles: [
		`
			:host {
				display: block;
				height: 100vh;
				background: #020617;
				color: white;
				overflow: hidden;
				font-family: 'Inter', sans-serif;
			}
			.slide-container {
				height: 100%;
				display: flex;
				flex-direction: column;
			}
			.glass-card {
				background: rgba(30, 41, 59, 0.7);
				backdrop-filter: blur(12px);
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 1.5rem;
			}
			.metric-value {
				font-size: 5rem;
				font-weight: 900;
				line-height: 1;
				letter-spacing: -0.05em;
			}
			.metric-label {
				font-size: 0.75rem;
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.2em;
				opacity: 0.5;
			}
			.animate-slide-up {
				animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
			}
			@keyframes slideUp {
				from {
					opacity: 0;
					transform: translateY(40px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}
			.progress-bar {
				height: 4px;
				background: rgba(255, 255, 255, 0.1);
				width: 100%;
				position: absolute;
				bottom: 0;
			}
			.progress-fill {
				height: 100%;
				background: #bf9110;
				transition: width 0.1s linear;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidesDashboard implements OnInit, OnDestroy {
	private _achService = inject(AchievementDashboardDataService);
	private _effService = inject(OperationalEfficiencyService);

	currentSlide = signal(0);
	totalSlides = 4;
	slideProgress = signal(0);
	isLoading = signal(true);

	private _timerSub?: Subscription;
	private _progressSub?: Subscription;
	private _refreshSub?: Subscription;
	private SLIDE_DURATION = 15000; // 15 seconds
	private REFRESH_INTERVAL = 3600000; // 1 hour

	// Data States
	achData = signal<any>({ ach: 0, real: 0, obj: 0, dates: [], trend: [] });
	effData = signal<any>({ oper: 0, work: 0, total: 0, stability: 0, paretoNames: [], paretoValues: [] });

	ngOnInit() {
		this.loadAllData();
		// Configurar actualización automática cada hora
		this._refreshSub = interval(this.REFRESH_INTERVAL).subscribe(() => {
			console.log('SLIDES DEBUG: Hourly data refresh triggered');
			this.loadAllData();
		});
	}

	ngOnDestroy() {
		this._timerSub?.unsubscribe();
		this._progressSub?.unsubscribe();
		this._refreshSub?.unsubscribe();
	}

	private loadAllData() {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		const range = {
			startDate: start.toLocaleDateString('en-CA'),
			endDate: end.toLocaleDateString('en-CA'),
			area: '',
			supervisor: '',
			leader: '',
			partNumberId: '',
		};

		console.log('SLIDES DEBUG: Loading data for CURRENT MONTH:', range);

		forkJoin({
			ach: this._achService.getProductionAchievement(range),
			eff: this._effService.getOperationalEfficiency(range),
		}).subscribe({
			next: ({ ach, eff }) => {
				console.log('SLIDES DEBUG: Data received', {
					achCount: ach?.length,
					effRaw: eff ? 'YES' : 'NO',
				});
				this.processAchData(ach);
				this.processEffData(eff);
				this.isLoading.set(false);
				this.startSlideshow();
			},
			error: (err) => {
				console.error('SLIDES DEBUG: Error loading data:', err);
			},
		});
	}

	toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable full-screen mode: ${err.message}`);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	private processAchData(data: any[]) {
		console.log('SLIDES DEBUG: Processing ACH data, records:', data?.length);
		let totalObj = 0;
		let totalReal = 0;
		const dateMap = new Map<string, { obj: number; real: number }>();

		if (data && Array.isArray(data)) {
			data.forEach((p) => {
				if (p.dailyRecords) {
					p.dailyRecords.forEach((r: any) => {
						totalObj += r.obj || 0;
						totalReal += r.real || 0;
						const d = r.date ? r.date.split('T')[0] : 'N/A';
						const curr = dateMap.get(d) || { obj: 0, real: 0 };
						curr.obj += r.obj || 0;
						curr.real += r.real || 0;
						dateMap.set(d, curr);
					});
				}
			});
		}

		const dates = Array.from(dateMap.keys()).sort();
		this.achData.set({
			ach: totalObj > 0 ? (totalReal / totalObj) * 100 : 0,
			real: totalReal,
			obj: totalObj,
			dates,
			trend: dates.map((d) => {
				const v = dateMap.get(d)!;
				return v.obj > 0 ? (v.real / v.obj) * 100 : 0;
			}),
		});
		console.log('SLIDES DEBUG: ACH processing complete');
	}

	private processEffData(data: any) {
		console.log('SLIDES DEBUG: Processing EFF data');
		let totalWork = 0;
		let totalTime = 0;
		let totalRecs = 0;
		let stableRecs = 0;
		const leaderMap = new Map<string, number>();

		const flat = this.flattenEff(data);
		flat.forEach((r) => {
			totalWork += r.work || 0;
			totalTime += r.total || 0;
			totalRecs++;
			if ((r.metrics?.operativityPercent || 0) >= 0.85) stableRecs++;

			const down = (r.total || 0) - (r.work || 0);
			leaderMap.set(r.leader, (leaderMap.get(r.leader) || 0) + Math.max(0, down));
		});

		const pareto = Array.from(leaderMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8);

		this.effData.set({
			oper: totalTime > 0 ? (totalWork / totalTime) * 100 : 0,
			work: totalWork,
			total: totalTime,
			stability: totalRecs > 0 ? (stableRecs / totalRecs) * 100 : 0,
			paretoNames: pareto.map((e) => e[0] || 'Unknown'),
			paretoValues: pareto.map((e) => Math.round(e[1])),
		});
		console.log('SLIDES DEBUG: EFF processing complete');
	}

	private flattenEff(response: any): any[] {
		const flat: any[] = [];
		const list = Array.isArray(response) ? response : response ? [response] : [];

		console.log('SLIDES DEBUG: Processing Eff response, items:', list.length);

		list.forEach((root: any) => {
			const dataObj = root?.data || {};
			Object.keys(dataObj).forEach((leaderName) => {
				const parts = dataObj[leaderName] || {};
				Object.keys(parts).forEach((partName) => {
					const areas = parts[partName] || {};
					Object.keys(areas).forEach((areaName) => {
						const supervisors = areas[areaName] || {};
						Object.keys(supervisors).forEach((supName) => {
							const records = supervisors[supName] || [];
							records.forEach((rec: any) => {
								if (!rec) return;
								flat.push({
									area: areaName,
									supervisor: supName,
									leader: leaderName,
									part: partName,
									date: rec.productionDate ? rec.productionDate.split('T')[0] : 'N/A',
									work: rec.metrics?.realWorkingTime ?? 0,
									total: rec.metrics?.totalTime ?? 0,
									metrics: rec.metrics || {},
								});
							});
						});
					});
				});
			});
		});

		console.log('SLIDES DEBUG: Flattened Eff records:', flat.length);
		return flat;
	}

	private startSlideshow() {
		if (this._timerSub || this._progressSub) return;

		this._timerSub = interval(this.SLIDE_DURATION).subscribe(() => {
			this.currentSlide.update((i) => (i + 1) % this.totalSlides);
			this.slideProgress.set(0);
		});

		this._progressSub = interval(100).subscribe(() => {
			this.slideProgress.update((p) => p + 100 / (this.SLIDE_DURATION / 100));
		});
	}

	// --- Chart Options ---
	achTrendOptions = computed<ChartOptions | null>(() => {
		const d = this.achData();
		if (d.trend.length === 0) return null;
		return this._cfg([{ name: 'Achievement %', data: d.trend }], d.dates, 'area', ['#3b82f6'], 450);
	});

	paretoOptions = computed<ChartOptions | null>(() => {
		const d = this.effData();
		if (d.paretoValues.length === 0) return null;
		const opts = this._cfg([{ name: 'Downtime (min)', data: d.paretoValues }], d.paretoNames, 'bar', ['#ef4444'], 500);
		return {
			...opts,
			plotOptions: {
				bar: {
					horizontal: true,
					borderRadius: 8,
					barHeight: '70%',
				},
			},
		} as any;
	});

	private _cfg(series: any[], categories: string[], type: any, colors: string[], height: number | string = '100%'): ChartOptions {
		return {
			series,
			colors,
			chart: {
				type,
				height,
				toolbar: { show: false },
				animations: { enabled: true, speed: 800 },
				background: 'transparent',
			},
			xaxis: { categories, labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
			yaxis: { labels: { style: { colors: '#94a3b8' } } },
			grid: { borderColor: 'rgba(255,255,255,0.05)' },
			stroke: { curve: 'smooth', width: 4 },
			fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
			dataLabels: { enabled: false },
			theme: { mode: 'dark' },
		} as any;
	}
}
