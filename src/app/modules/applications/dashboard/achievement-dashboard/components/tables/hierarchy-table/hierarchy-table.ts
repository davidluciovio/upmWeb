import { Component, computed, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';

export interface DailyRecord {
	date: string;
	obj: number;
	real: number;
}

export interface LeaderNode {
	name: string;
	obj: number;
	real: number;
	ach: number;
	records: DailyRecord[];
}

export interface SupervisorNode {
	name: string;
	area: string;
	obj: number;
	real: number;
	ach: number;
	leaders: LeaderNode[];
	expanded?: boolean;
	records: DailyRecord[]; // Aggregated records for supervisor
}

@Component({
	selector: 'app-hierarchy-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule, Charts],
	templateUrl: './hierarchy-table.html',
})
export class HierarchyTableComponent implements OnChanges {
	@Input() data: SupervisorNode[] = [];
	@Output() openDetail = new EventEmitter<{ title: string; records: DailyRecord[] }>();

	viewMode = signal<'table' | 'chart'>('table');
	filteredData = signal<SupervisorNode[]>([]);
	searchText = signal('');

	ngOnChanges() {
		this.filterData();
	}

	filterData() {
		const txt = this.searchText().toLowerCase();
		if (!txt) {
			this.filteredData.set([...this.data]);
		} else {
			this.filteredData.set(this.data.filter((s) => s.name.toLowerCase().includes(txt) || s.leaders.some((l) => l.name.toLowerCase().includes(txt))));
		}
	}

	// Chart Options for Chart View
	hierarchyChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		// We want a horizontal bar chart showing achievement % per supervisor and leader
		const categories: string[] = [];
		const seriesData: number[] = [];
		const colors: string[] = [];

		// Limit to prevent chart explosion if too many items, or scroll?
		// Logic from index.html: Supervisor then Leaders
		data.forEach((sup) => {
			categories.push(sup.name);
			seriesData.push(sup.ach);
			colors.push('#002855');

			sup.leaders.forEach((lid) => {
				categories.push(`↳ ${lid.name}`);
				seriesData.push(lid.ach);
				colors.push('rgba(59, 130, 246, 0.6)'); // light blue
			});
		});

		return {
			series: [{ name: 'Achievement %', data: seriesData }],
			chart: { type: 'bar', height: Math.max(400, categories.length * 30), toolbar: { show: false } }, // dynamic height
			plotOptions: { bar: { horizontal: true, borderRadius: 2, barHeight: '70%' } },
			xaxis: { max: 150, labels: { formatter: (val: any) => val.toFixed(0) + '%' } },
			yaxis: { labels: { style: { fontSize: '11px', fontFamily: 'monospace' } } },
			colors: colors,
			dataLabels: { enabled: true, textAnchor: 'start', formatter: (val: number) => val.toFixed(1) + '%' },
			grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
		};
	});

	toggleExpand(item: SupervisorNode) {
		item.expanded = !item.expanded;
	}

	onSearch(val: string) {
		this.searchText.set(val);
		this.filterData();
	}

	triggerDetail(title: string, records: DailyRecord[]) {
		this.openDetail.emit({ title, records });
	}

	setView(mode: 'table' | 'chart') {
		this.viewMode.set(mode);
	}
}
