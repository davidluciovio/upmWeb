import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ChartHourlyProduction } from './components/chart-hourly-production';
import { TableHourlyProduction } from './components/table-hourly-production';
import { DowntimeCaptureRequestInterface, LoadDataDowntimeCapture } from './services/load-data-downtime-capture';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CardGroupKpisData } from './components/card-group-kpis-data';
import { DowntimeCaptureFilterBar } from './components/downtime-capture-filter-bar';
import { FormAddOperator } from './components/form-add-operator';
import { BarActionDowntimeCapture } from './components/bar-action-downtime-capture';
import { ModalAddMaterialAlert } from './components/modal-add-material-alert';
import { ModalAddDowntime } from './components/modal-add-downtime';
import { ModalAddRack } from './components/modal-add-rack';
import { DialogModule } from 'primeng/dialog';

@Component({
	selector: 'app-downtime-capture',
	imports: [
		ChartHourlyProduction,
		TableHourlyProduction,
		CardGroupKpisData,
		FormAddOperator,
		BarActionDowntimeCapture,
		ModalAddMaterialAlert,
		ModalAddDowntime,
		ModalAddRack,
		DialogModule,
	],
	templateUrl: './downtime-capture.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeCapture implements OnInit {
	ngOnInit(): void {
		setInterval(() => {
			this.data$.reload();
		}, 10000);
	}
	private readonly _loadDataDowntimeCapture = inject(LoadDataDowntimeCapture);

	protected showMaterialAlert = signal(false);
	protected showDowntimeModal = signal(false);
	protected showRackModal = signal(false);
	protected showOperatorModal = signal(false);

	filters = signal<DowntimeCaptureRequestInterface>(this._getInitialFilters());

	protected data$ = rxResource({
		params: () => this.filters(),
		stream: (rx) =>
			this._loadDataDowntimeCapture.getFiltersData(rx.params).pipe(
				map((response) => {
					if (!response) return response;
					if (response.partNumberDataProductions) {
						response.partNumberDataProductions = response.partNumberDataProductions.filter(
							(item) => item.hourlyProductionDatas && item.hourlyProductionDatas.length > 0,
						);
					}
					return response;
				}),
			),
	});
	onSaveMaterialAlert(data: { component: string; description: string }) {
		const lineId = this.data$.value()?.lineId || '';
		this._loadDataDowntimeCapture.saveMaterialAlert({ ...data, lineId }).subscribe(() => {
			this.data$.reload();
		});
	}

	onSaveDowntime(data: any) {
		const lineId = this.data$.value()?.lineId || '';
		this._loadDataDowntimeCapture.saveDowntime({ ...data, lineId }).subscribe(() => {
			this.data$.reload();
		});
	}

	onSaveRack(data: any) {
		const lineId = this.data$.value()?.lineId || '';
		this._loadDataDowntimeCapture.saveRack({ ...data, lineId }).subscribe(() => {
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
			lineDescription: 'L8210',
		};
	}

	private _formatDate(date: Date): string {
		const pad = (n: number) => (n < 10 ? '0' + n : n);
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
	}

	onFiltersChange(newFilters: DowntimeCaptureRequestInterface) {
		this.filters.set(newFilters);
	}
}
