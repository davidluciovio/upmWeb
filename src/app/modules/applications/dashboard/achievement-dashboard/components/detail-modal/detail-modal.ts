import { Component, computed, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Charts, ChartOptions } from '../../../../../../shared/components/charts/charts';

export interface DetailRecord {
	date: string;
	obj: number;
	real: number;
}

export interface DetailData {
	title: string;
	records: DetailRecord[];
}

@Component({
	selector: 'app-detail-modal',
	standalone: true,
	imports: [CommonModule, Charts],
	template: `
		<div *ngIf="isOpen()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div class="absolute inset-0 bg-slate-900/60 transition-opacity" (click)="close()"></div>
			<div class="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
				<!-- Header -->
				<div class="py-4 px-6 border-b bg-slate-50 flex justify-between items-center">
					<div>
						<p class="text-lg font-black text-slate-800 uppercase tracking-tighter">{{ data()?.title }}</p>
						<p class="text-[9px] font-bold text-blue-600 tracking-widest uppercase">Detailed Execution Log / 詳細実行ログ</p>
					</div>
					<button (click)="close()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Body -->
				<div class="p-6 overflow-y-auto">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<!-- Chart -->
						<div class="bg-white rounded-lg border border-slate-200 p-4">
							<chart [chartOptions]="chartOptions()"></chart>
						</div>

						<!-- Table -->
						<div class="border rounded-lg overflow-hidden shadow-sm">
							<div class="overflow-x-auto">
								<table class="w-full text-left text-[11px]">
									<thead class="bg-slate-50 uppercase text-slate-500 font-bold border-b">
										<tr>
											<th class="px-4 py-2 border-r">Fecha</th>
											<th class="px-4 py-2 text-center border-r">Obj</th>
											<th class="px-4 py-2 text-center border-r">Real</th>
											<th class="px-4 py-2 text-center">Ach %</th>
										</tr>
									</thead>
									<tbody class="font-mono divide-y divide-slate-50">
										<tr *ngFor="let row of tableIds()" class="hover:bg-slate-50">
											<td class="px-4 py-2 border-r font-bold text-slate-700">{{ row.date }}</td>
											<td class="px-4 py-2 text-center border-r">{{ row.obj | number: '1.1-1' }}</td>
											<td class="px-4 py-2 text-center border-r">{{ row.real | number: '1.0-0' }}</td>
											<td class="px-4 py-2 text-center font-bold" [ngClass]="{ 'text-emerald-600': row.ach >= 100, 'text-blue-600': row.ach < 100 }">
												{{ row.ach | number: '1.1-1' }}%
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="px-6 py-4 bg-slate-50 border-t flex justify-end">
					<button (click)="close()" class="bg-[#002855] text-white text-[10px] font-bold px-6 py-2 rounded-lg hover:bg-[#001d3d] transition-colors">
						Close / 閉じる
					</button>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.animate-fade-in-up {
				animation: fadeInUp 0.3s ease-out;
			}
			@keyframes fadeInUp {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}
		`,
	],
})
export class DetailModalComponent {
	isOpen = signal(false);
	data = signal<DetailData | null>(null);

	tableIds = computed(() => {
		const d = this.data();
		if (!d) return [];
		// Aggregate by date if needed, but records technically come daily.
		// Sort by date unique
		const map: Record<string, { obj: number; real: number }> = {};
		d.records.forEach((r) => {
			const date = r.date.split('T')[0];
			if (!map[date]) map[date] = { obj: 0, real: 0 };
			map[date].obj += r.obj;
			map[date].real += r.real;
		});

		return Object.keys(map)
			.sort()
			.map((date) => {
				const item = map[date];
				const ach = item.obj > 0 ? (item.real / item.obj) * 100 : 0;
				return { date, ...item, ach };
			});
	});

	chartOptions = computed<ChartOptions>(() => {
		const rows = this.tableIds();
		const dates = rows.map((r) => r.date);

		return {
			series: [
				{ name: 'Real', type: 'column', data: rows.map((r) => r.real) },
				{ name: 'Obj', type: 'line', data: rows.map((r) => r.obj) },
			],
			chart: { type: 'line', height: 300, toolbar: { show: false } },
			plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
			stroke: { width: [0, 3], curve: 'straight' as any },
			colors: ['#002855', '#bf9110'],
			xaxis: { categories: dates, labels: { rotate: -45, rotateAlways: true } },
			yaxis: { labels: { formatter: (val) => val.toFixed(0) } },
			legend: { show: true, position: 'top' },
		};
	});

	open(data: DetailData) {
		this.data.set(data);
		this.isOpen.set(true);
	}

	close() {
		this.isOpen.set(false);
	}
}
