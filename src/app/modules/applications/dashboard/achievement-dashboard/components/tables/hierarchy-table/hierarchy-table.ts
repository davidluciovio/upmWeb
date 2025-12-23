import { Component, computed, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Charts, ChartOptions } from '../../../../../../../shared/components/charts/charts';

// Interfaces (Se mantienen igual)
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
	records: DailyRecord[];
}

@Component({
	selector: 'app-hierarchy-table',
	standalone: true,
	imports: [CommonModule, DecimalPipe, FormsModule, Charts],
	templateUrl: './hierarchy-table.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HierarchyTableComponent {
	// Usamos señales para las entradas si es posible, o transformamos el input
	private _data = signal<SupervisorNode[]>([]);
	@Input({ required: true }) set data(val: SupervisorNode[]) {
		this._data.set(val);
	}

	@Output() openDetail = new EventEmitter<{ title: string; records: DailyRecord[] }>();

	// Estado de la vista
	viewMode = signal<'table' | 'chart'>('table');
	searchText = signal('');

	// Estado de ordenamiento
	sortField = signal<'name' | 'ach' | 'area'>('name');
	sortOrder = signal<'asc' | 'desc'>('asc');

	// Rastreamos expansiones por nombre (ID) para no mutar el objeto data
	expandedSupervisors = signal<Set<string>>(new Set());

	// Computed: Filtrado y Ordenado automático y reactivo
	filteredData = computed(() => {
		const data = this._data();
		const query = this.searchText().toLowerCase().trim();
		const field = this.sortField();
		const order = this.sortOrder();

		// 1. Filtrado
		let filtered = query
			? data.filter((s) => s.name.toLowerCase().includes(query) || s.leaders.some((l) => l.name.toLowerCase().includes(query)))
			: [...data];

		// 2. Ordenado (Supervisores y sus Líderes internamente)
		const compare = (a: any, b: any) => {
			let valA = a[field];
			let valB = b[field];

			if (typeof valA === 'string') {
				valA = valA.toLowerCase();
				valB = valB.toLowerCase();
			}

			if (valA < valB) return order === 'asc' ? -1 : 1;
			if (valA > valB) return order === 'asc' ? 1 : -1;
			return 0;
		};

		// Ordenar supervisores
		filtered.sort(compare);

		// Ordenar líderes dentro de cada supervisor
		return filtered.map((s) => ({
			...s,
			leaders: [...s.leaders].sort(compare),
		}));
	});

	// Computed: Opciones de gráfica basadas en el filtro
	hierarchyChartOptions = computed<ChartOptions>(() => {
		const data = this.filteredData();
		const categories: string[] = [];
		const seriesData: number[] = [];
		const colors: string[] = [];
		const weights: any[] = []; // Usamos any[] para evitar conflictos de tipos

		const SUPERVISOR_COLOR = '#002855';
		const LEADER_COLOR = '#7BB1FA';

		for (const sup of data) {
			// Supervisor: Sin espacios extra
			categories.push(sup.name);
			seriesData.push(Math.round(sup.ach));
			colors.push(SUPERVISOR_COLOR);
			weights.push(700);

			// Líderes: Agregamos sangría con espacios de no ruptura (\u00A0)
			for (const lid of sup.leaders) {
				// Tres espacios de sangría + el símbolo de jerarquía
				categories.push(`\u00A0\u00A0\u00A0↳ ${lid.name}`);
				seriesData.push(Math.round(lid.ach));
				colors.push(LEADER_COLOR);
				weights.push(400);
			}
		}

		// Retornamos el objeto con casting a 'any' para evitar el error TS2345
		return {
			series: [{ name: 'Achievement %', data: seriesData }],
			chart: {
				type: 'bar',
				height: Math.max(450, categories.length * 35),
				toolbar: { show: false },
				animations: { enabled: false },
				fontFamily: 'Inter, sans-serif',
			},
			plotOptions: {
				bar: {
					horizontal: true,
					distributed: true,
					borderRadius: 2,
					barHeight: '70%',
					dataLabels: { position: 'top' },
				},
			},
			colors: colors,
			dataLabels: {
				enabled: true,
				formatter: (val: number) => val + '%',
				style: { fontSize: '11px', colors: ['#fff'] },
				offsetX: -20,
			},
			xaxis: {
				categories: categories,
				max: 150,
				tickAmount: 3,
				labels: { style: { colors: '#64748b', fontSize: '12px' } },
			},
			yaxis: {
				labels: {
					show: true,
					align: 'left', // <--- Alineación a la izquierda
					minWidth: 180, // Asegura espacio para la sangría
					maxWidth: 250,
					style: {
						fontSize: '11px',
						colors: '#475569',
						// Forzamos el array de pesos
						fontWeight: weights as any,
					},
					// Formateador opcional para asegurar que los espacios se respeten
					formatter: (value: string) => value,
				},
			},
			grid: {
				borderColor: '#f1f5f9',
				xaxis: { lines: { show: true } },
				yaxis: { lines: { show: false } },
			},
			legend: { show: false },
			tooltip: {
				theme: 'light',
				y: { formatter: (val: number) => val + '%' },
			},
		} as any; // Casting final para silenciar cualquier error de interfaz
	});

	toggleExpand(name: string) {
		const current = new Set(this.expandedSupervisors());
		if (current.has(name)) current.delete(name);
		else current.add(name);
		this.expandedSupervisors.set(current);
	}

	isExpanded(name: string): boolean {
		return this.expandedSupervisors().has(name);
	}

	triggerDetail(title: string, records: DailyRecord[]) {
		this.openDetail.emit({ title, records });
	}

	toggleSort(field: 'name' | 'ach' | 'area') {
		if (this.sortField() === field) {
			this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
		} else {
			this.sortField.set(field);
			this.sortOrder.set('asc');
		}
	}
}
