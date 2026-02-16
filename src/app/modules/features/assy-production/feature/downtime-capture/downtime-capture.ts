import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ChartHourlyProduction } from './components/chart-hourly-production';
import { TableHourlyProduction } from './components/table-hourly-production';
import {
	CompleteRackRegisterDto,
	DowntimeCaptureRequestInterface,
	DowntimeCaptureResponseInterface,
	DowntimeRegisterDto,
	LineOperatorsRegisterDto,
	LoadDataDowntimeCapture,
	PartNumberDataProduction,
} from './services/load-data-downtime-capture';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CardGroupKpisData } from './components/card-group-kpis-data';
import { DowntimeCaptureFilterBar } from './components/downtime-capture-filter-bar';
import { FormAddOperator } from './components/form-add-operator';
import { BarActionDowntimeCapture } from './components/bar-action-downtime-capture';
import { ModalAddDowntime } from './components/modal-add-downtime';
import { ModalAddRack } from './components/modal-add-rack';
import { DialogModule } from 'primeng/dialog';
import { LineInterface, LineManager } from '../../../../Admin/services/line-manager';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
	selector: 'app-downtime-capture',
	imports: [
		ChartHourlyProduction,
		TableHourlyProduction,
		CardGroupKpisData,
		FormAddOperator,
		BarActionDowntimeCapture,
		ModalAddDowntime,
		ModalAddRack,
		DialogModule,
		ReactiveFormsModule,
		Select,
		ButtonModule,
		CardModule,
		ProgressBarModule,
	],
	templateUrl: './downtime-capture.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeCapture implements OnInit {
	ngOnInit(): void {
		setInterval(() => {
			this.data$.reload();
		}, 60000);
	}
	private readonly _loadDataDowntimeCapture = inject(LoadDataDowntimeCapture);
	private readonly _lineManager = inject(LineManager);
	private readonly _fb = inject(FormBuilder);

	protected showDowntimeModal = signal(false);
	protected showRackModal = signal(false);
	protected showOperatorModal = signal(false);
	protected isLineSelected = signal(false);

	lineForm: FormGroup = this._fb.group({
		lineDescription: ['', Validators.required],
	});

	filters = signal<DowntimeCaptureRequestInterface>(this._getInitialFilters());

	protected allLines$ = rxResource({
		stream: () => this._lineManager.getLines().pipe(map((lines: LineInterface[]) => lines || [])),
	});

	// Safer accessor for the template
	protected lines = computed<LineInterface[]>(() => (this.allLines$.value() as LineInterface[]) || []);

	protected data$ = rxResource({
		params: () => (this.isLineSelected() ? this.filters() : null),
		stream: (rx: any) =>
			this._loadDataDowntimeCapture.getFiltersData(rx.params).pipe(
				map((response: DowntimeCaptureResponseInterface) => {
					if (!response) return response;
					if (response.partNumberDataProductions) {
						response.partNumberDataProductions = response.partNumberDataProductions.filter(
							(item: PartNumberDataProduction) => item.hourlyProductionDatas && item.hourlyProductionDatas.length > 0,
						);
					}
					return response;
				}),
			),
			defaultValue: {
				lineId: '',
				lineDescription: '',
				partNumberDataProductions: [] as PartNumberDataProduction[],
			},
	});

	onRegisterDowntime(data: DowntimeRegisterDto) {
		this._loadDataDowntimeCapture.registerDowntime(data).subscribe(() => {
			this.data$.reload();
		});
	}

	onRegisterCompleteRack(data: CompleteRackRegisterDto) {
		this._loadDataDowntimeCapture.registerCompleteRack(data).subscribe(() => {
			this.data$.reload();
		});
	}

	onRegisterLineOperators(data: LineOperatorsRegisterDto) {
		this._loadDataDowntimeCapture.registerLineOperators(data).subscribe(() => {
			this.data$.reload();
		});
	}

	private _getInitialFilters(): DowntimeCaptureRequestInterface {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const currentMinutes = hours * 60 + minutes;

		let start = new Date(now);
		let end = new Date(now);

		const shift1Start = 8 * 60; // 08:00
		const shift1End = 21 * 60 + 30; // 21:30

		if (currentMinutes >= shift1Start && currentMinutes < shift1End) {
			// Shift 1: 08:00 - 21:30
			start.setHours(8, 0, 0, 0);
			end.setHours(21, 30, 0, 0);
		} else if (currentMinutes >= shift1End) {
			// Shift 2 (Part A): 21:30 - Midnight
			start.setHours(21, 30, 0, 0);
			end.setDate(end.getDate() + 1);
			end.setHours(7, 0, 0, 0);
		} else {
			// Shift 2 (Part B): Midnight - 07:00
			start.setDate(start.getDate() - 1);
			start.setHours(21, 30, 0, 0);
			end.setHours(7, 0, 0, 0);
		}

		return {
			startDatetime: this._formatDate(start),
			endDatetime: this._formatDate(end),
			lineDescription: '',
		};
	}

	onSelectLine() {
		if (this.lineForm.valid) {
			const line = this.lineForm.value.lineDescription as string;
			const initialFilters = this._getInitialFilters();
			initialFilters.lineDescription = line;
			this.filters.set(initialFilters);
			this.isLineSelected.set(true);
		}
	}

	private _formatDate(date: Date): string {
		const pad = (n: number) => (n < 10 ? '0' + n : n);
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
	}

	onFiltersChange(newFilters: DowntimeCaptureRequestInterface) {
		this.filters.set(newFilters);
	}
}
