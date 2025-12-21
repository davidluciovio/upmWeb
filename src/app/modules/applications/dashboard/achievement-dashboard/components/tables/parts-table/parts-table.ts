import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PartNode {
	number: string;
	area: string;
	obj: number;
	real: number;
	ach: number;
}

@Component({
	selector: 'app-parts-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule],
	templateUrl: './parts-table.html',
})
export class PartsTableComponent implements OnChanges {
	@Input() data: PartNode[] = [];
	filteredData: PartNode[] = [];
	searchText: string = '';

	ngOnChanges() {
		this.filterData();
	}

	filterData() {
		if (!this.searchText) {
			this.filteredData = [...this.data];
		} else {
			const lower = this.searchText.toLowerCase();
			this.filteredData = this.data.filter((p) => p.number.toLowerCase().includes(lower) || p.area.toLowerCase().includes(lower));
		}
	}
}
