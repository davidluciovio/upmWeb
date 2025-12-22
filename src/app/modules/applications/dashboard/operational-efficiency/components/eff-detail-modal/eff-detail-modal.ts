import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Charts, ChartOptions } from '../../../../../../shared/components/charts/charts';

export interface EfficiencyDetailRecord {
	date: string;
	work: number;
	total: number;
}

export interface EfficiencyDetailData {
	title: string;
	records: EfficiencyDetailRecord[];
}

@Component({
	selector: 'app-eff-detail-modal',
	standalone: true,
	imports: [CommonModule, DecimalPipe, Charts],
	template: `
		@if (isOpen()) {
			<div class="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
				<div class="absolute inset-0 bg-slate-900/60 transition-opacity" (click)="close()"></div>

				<div
					class="relative w-full max-w-6xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border border-base-300"
				>
					<div class="py-5 px-8 border-b bg-base-100 flex justify-between items-center">
						<div class="flex items-center gap-4">
							<div class="w-1.5 h-10 bg-[#002855] rounded-full"></div>
							<div>
								<h2 class="text-xl font-black text-base-content uppercase tracking-tighter leading-tight">
									{{ data()?.title }}
								</h2>
								<p class="text-[10px] font-bold text-primary tracking-widest uppercase">Operativity Audit Log / 稼働率詳細ログ</p>
							</div>
						</div>
						<button (click)="close()" class="p-2 hover:bg-base-200 rounded-full transition-all text-base-content/40 hover:text-base-content/70">
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div class="p-8 overflow-y-auto custom-scrollbar bg-base-200/30">
						<div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
							<div class="lg:col-span-3 bg-base-100  rounded-xl border border-base-300 p-6 shadow-sm">
								<div class="mb-4 flex items-center justify-between">
									<span class="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Work vs Total Time</span>
									<div class="flex gap-4 text-[10px] font-bold">
										<span class="flex items-center gap-1.5"
											><div class="w-2 h-2 rounded-full bg-[#10b981]"></div>
											Work</span
										>
										<span class="flex items-center gap-1.5"
											><div class="w-2 h-2 rounded-full bg-[#cbd5e1]"></div>
											Total</span
										>
									</div>
								</div>
								<chart [chartOptions]="chartOptions()"></chart>
							</div>

							<div class="lg:col-span-2 flex flex-col gap-4">
								<div class="bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm grow">
									<div class="max-h-[450px] overflow-y-auto">
										<table class="w-full text-left text-xs border-collapse">
											<thead class="bg-base-200 sticky top-0 z-10 border-b border-base-300">
												<tr class="text-[9px] uppercase text-base-content/60 font-bold">
													<th class="px-4 py-3">Date / 日付</th>
													<th class="px-4 py-3 text-center">Work (min)</th>
													<th class="px-4 py-3 text-center">Total (min)</th>
													<th class="px-4 py-3 text-right">Oper. %</th>
												</tr>
											</thead>
											<tbody class="divide-y divide-base-200 font-mono">
												@for (row of processedRecords(); track row.date) {
													<tr class="hover:bg-base-200 transition-colors">
														<td class="px-4 py-2.5 font-bold text-base-content">{{ row.date }}</td>
														<td class="px-4 py-2.5 text-center text-base-content/60">{{ row.work | number: '1.0-0' }}</td>
														<td class="px-4 py-2.5 text-center text-base-content/70 font-semibold">{{ row.total | number: '1.0-0' }}</td>
														<td class="px-4 py-2.5 text-right">
															<span [class]="row.oper >= 85 ? 'text-success' : 'text-primary'" class="font-bold"> {{ row.oper | number: '1.1-1' }}% </span>
														</td>
													</tr>
												}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="px-8 py-5 bg-base-100 border-t border-base-300 flex justify-end items-center gap-4">
						<span class="text-[10px] text-base-content/40 font-medium italic">Mostrando {{ processedRecords().length }} registros diarios</span>
						<button (click)="close()" class="dbtn dbtn-sm dbtn-neutral text-[10px] font-bold px-8">CLOSE / 閉じる</button>
					</div>
				</div>
			</div>
		}
	`,
	styles: [
		`
			.animate-fade-in-up {
				animation: fadeInUp 0.25s ease-out;
			}
			@keyframes fadeInUp {
				from {
					opacity: 0;
					transform: translateY(15px) scale(0.98);
				}
				to {
					opacity: 1;
					transform: translateY(0) scale(1);
				}
			}
			.custom-scrollbar::-webkit-scrollbar {
				width: 6px;
			}
			.custom-scrollbar::-webkit-scrollbar-track {
				background: transparent;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb {
				background: #94a3b8;
				border-radius: 10px;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb:hover {
				background: #64748b;
			}
		`,
	],
})
export class EffDetailModalComponent {
	isOpen = signal(false);
	data = signal<EfficiencyDetailData | null>(null);

	@HostListener('document:keydown.escape')
	onKeydownHandler() {
		if (this.isOpen()) this.close();
	}

	processedRecords = computed(() => {
		const d = this.data();
		if (!d) return [];

		const map = new Map<string, { work: number; total: number }>();

		for (const r of d.records) {
			const date = r.date.split('T')[0];
			const current = map.get(date) || { work: 0, total: 0 };
			current.work += r.work;
			current.total += r.total;
			map.set(date, current);
		}

		return Array.from(map.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([date, values]) => ({
				date,
				...values,
				oper: values.total > 0 ? (values.work / values.total) * 100 : 0,
			}));
	});

	chartOptions = computed<any>(() => {
		const rows = this.processedRecords();
		const dates = rows.map((r) => r.date);

		return {
			series: [
				{ name: 'Work', type: 'column', data: rows.map((r) => Math.round(r.work)) },
				{ name: 'Total', type: 'column', data: rows.map((r) => Math.round(r.total)) },
			],
			chart: {
				type: 'bar',
				stacked: false,
				height: 350,
				toolbar: { show: false },
				animations: { enabled: false },
			},
			plotOptions: {
				bar: { columnWidth: '60%', borderRadius: 2 },
			},
			colors: ['#10b981', '#cbd5e1'],
			xaxis: {
				categories: dates,
				labels: { rotate: -45, style: { fontSize: '10px', fontWeight: 600 } },
			},
			yaxis: {
				labels: { style: { fontSize: '10px' } },
			},
			legend: { show: false },
			grid: { borderColor: '#f1f5f9' },
			tooltip: { theme: 'light' },
		};
	});

	open(data: EfficiencyDetailData) {
		this.data.set(data);
		this.isOpen.set(true);
		document.body.style.overflow = 'hidden';
	}

	close() {
		this.isOpen.set(false);
		document.body.style.overflow = 'auto';
	}
}
