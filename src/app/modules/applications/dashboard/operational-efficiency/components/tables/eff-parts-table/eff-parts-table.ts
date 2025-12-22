import { Component, computed, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EfficiencyDetailRecord } from '../../eff-detail-modal/eff-detail-modal';

export interface EffPartNode {
	number: string;
	work: number;
	total: number;
	oper: number;
	records: EfficiencyDetailRecord[];
}

@Component({
	selector: 'app-eff-parts-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule],
	template: `
		<section class="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden flex flex-col h-full">
			<div class="p-4 bg-base-200/50 border-b border-base-300 flex justify-between items-center">
				<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/60 italic">Part Number Efficiency / 品番別効率</h2>
				<span class="text-[9px] text-base-content/40 font-mono">{{ _data().length }} Items</span>
			</div>
			<div class="p-4 bg-base-100 border-b border-base-300">
				<input
					type="text"
					[ngModel]="searchText()"
					(ngModelChange)="searchText.set($event)"
					placeholder="Buscar 品番 / No. de Parte..."
					class="w-full px-3 py-1.5 text-xs border border-base-300 rounded-md focus:outline-none focus:border-primary bg-base-100 text-base-content"
				/>
			</div>
			<div class="overflow-x-auto custom-scrollbar grow max-h-[400px]">
				<table class="w-full text-left text-xs border-collapse">
					<thead class="bg-base-100 border-b border-base-300 text-base-content/40 font-bold uppercase text-[9px] sticky top-0 z-10 shadow-sm">
						<tr>
							<th class="px-4 py-3 cursor-pointer select-none hover:bg-base-50" (click)="toggleSort('number')">
								Part No.
								<span class="ml-1 opacity-40">⇅</span>
							</th>
							<th class="px-4 py-3 text-center cursor-pointer select-none hover:bg-base-50" (click)="toggleSort('oper')">
								Oper. %
								<span class="ml-1 opacity-40">⇅</span>
							</th>
							<th class="px-4 py-3 text-center">Log</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-base-200">
						@for (row of sortedData(); track row.number) {
							<tr class="hover:bg-base-50 transition-colors">
								<td class="px-4 py-3 font-mono font-bold text-base-content">{{ row.number }}</td>
								<td class="px-4 py-3 text-center font-black" [class.text-emerald-600]="row.oper >= 85" [class.text-info]="row.oper < 85">
									{{ row.oper | number: '1.1-1' }}%
								</td>
								<td class="px-4 py-3 text-center">
									<button
										(click)="triggerDetail(row.number, row.records)"
										class="text-[8px] font-bold text-base-content/60 bg-base-200 px-2 py-1 rounded hover:bg-base-300 transition-colors"
									>
										LOG
									</button>
								</td>
							</tr>
						}
					</tbody>
				</table>
			</div>
		</section>
	`,
	styles: [
		`
			.custom-scrollbar::-webkit-scrollbar {
				width: 4px;
				height: 4px;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb {
				background: #cbd5e1;
				border-radius: 10px;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffPartsTableComponent {
	protected _data = signal<EffPartNode[]>([]);
	@Input({ required: true }) set data(val: EffPartNode[]) {
		this._data.set(val);
	}

	@Output() openDetail = new EventEmitter<{ title: string; records: EfficiencyDetailRecord[] }>();

	searchText = signal('');
	sortField = signal<'number' | 'oper'>('number');
	sortOrder = signal<'asc' | 'desc'>('asc');

	sortedData = computed(() => {
		let items = this._data();
		const query = this.searchText().toLowerCase().trim();

		if (query) {
			items = items.filter((p) => p.number.toLowerCase().includes(query));
		}

		const field = this.sortField();
		const order = this.sortOrder();

		return [...items].sort((a, b) => {
			let valA: any = field === 'number' ? a.number : a.oper;
			let valB: any = field === 'number' ? b.number : b.oper;

			if (valA < valB) return order === 'asc' ? -1 : 1;
			if (valA > valB) return order === 'asc' ? 1 : -1;
			return 0;
		});
	});

	toggleSort(field: 'number' | 'oper') {
		if (this.sortField() === field) {
			this.sortOrder.update((o) => (o === 'asc' ? 'desc' : 'asc'));
		} else {
			this.sortField.set(field);
			this.sortOrder.set('asc');
		}
	}

	triggerDetail(title: string, records: EfficiencyDetailRecord[]) {
		this.openDetail.emit({ title: `PN: ${title}`, records });
	}
}
