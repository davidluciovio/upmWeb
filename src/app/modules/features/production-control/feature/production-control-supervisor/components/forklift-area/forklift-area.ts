import { Component, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PickListModule } from 'primeng/picklist';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

// Services
import { UserManager } from '../../../../../../security/services/user-manager';
import { AreaManagerService } from '../../../../../../Admin/services/area-manager';
import { ErrorHandlerService } from '../../../../../../../core/services/error-handler';
import { ForkliftAreaService } from '../../services/forklift-area.service';

@Component({
	selector: 'forklift-area',
	standalone: true,
	imports: [CommonModule, FormsModule, ButtonModule, SelectModule, PickListModule, ToastModule, TooltipModule, TagModule, TableModule],
	providers: [MessageService],
	templateUrl: './forklift-area.html',
})
export class ForkliftArea {
	private readonly userService = inject(UserManager);
	private readonly areaService = inject(AreaManagerService);
	private readonly forkliftAreaService = inject(ForkliftAreaService);
	private readonly messageService = inject(MessageService);
	private readonly errorHandler = inject(ErrorHandlerService);
	private readonly cdr = inject(ChangeDetectorRef);

	// Resources (New Angular Pattern)
	readonly usersResource = rxResource({
		stream: () =>
			this.userService
				.getUsers()
				.pipe(
					map((users) =>
						(users || []).filter((u) => u.roleName.toLowerCase().includes('montacarguista')).sort((a, b) => a.prettyName.localeCompare(b.prettyName)),
					),
				),
	});

	readonly areasResource = rxResource({
		stream: () => this.areaService.getAreas().pipe(map((areas) => (areas || []).filter((a) => a.active))),
	});

	// State
	selectedUserId = signal<string | null>(null);
	saving = signal(false);
	loadingAssignments = signal(false);

	// Picklist state (must be mutable for PrimeNG)
	sourceAreas: any[] = [];
	targetAreas: any[] = [];

	// Computed for easy access in template
	readonly forkliftUsers = computed(() => this.usersResource.value() || []);
	readonly selectedUser = computed(() => {
		const id = this.selectedUserId();
		return this.forkliftUsers().find((u) => u.id === id) || null;
	});

	loadUserAssignments() {
		const userId = this.selectedUserId();
		const allAreas = this.areasResource.value() || [];

		if (!userId) {
			this.sourceAreas = [...allAreas].sort((a, b) => a.areaDescription.localeCompare(b.areaDescription));
			this.targetAreas = [];
			return;
		}

		// Feedback for the user
		this.loadingAssignments.set(true);
		this.messageService.add({
			severity: 'info',
			summary: 'Explorando',
			detail: 'Recuperando configuración actual...',
			life: 1500,
		});

		this.forkliftAreaService.getAreasForUser(userId).subscribe({
			next: (res: any) => {
				this.loadingAssignments.set(false);
				let assignedAreas: any[] = [];

				// Handle both: [ { dataProductionAreaId: [] } ] and { dataProductionAreaId: [] }
				if (Array.isArray(res)) {
					const firstMatch = res[0];
					if (firstMatch) {
						assignedAreas = firstMatch.dataProductionAreaId || firstMatch.DataProductionAreaId || (Array.isArray(firstMatch) ? firstMatch : []);
					}
				} else if (res) {
					assignedAreas = res.dataProductionAreaId || res.DataProductionAreaId || [];
				}

				// Normalize IDs - supporting both 'id' and 'Id' properties
				const assignedIds = new Set(assignedAreas.map((a: any) => (a.id || a.Id || '').toString().toLowerCase()));

				// Reconstruct lists by filtering allAreas
				this.targetAreas = allAreas.filter((a: any) => {
					const id = (a.id || a.Id || '').toString().toLowerCase();
					return id && assignedIds.has(id);
				});

				this.sourceAreas = allAreas.filter((a: any) => {
					const id = (a.id || a.Id || '').toString().toLowerCase();
					return id && !assignedIds.has(id);
				});

				// Trigger UI update
				this.cdr.detectChanges();
			},
			error: (err) => {
				this.loadingAssignments.set(false);
				if (err.status !== 404) {
					this.errorHandler.handleValidationError(err);
				}
				this.resetPicklist();
				this.cdr.detectChanges();
			},
		});
	}

	onUserChange() {
		this.loadUserAssignments();
	}

	resetPicklist() {
		const allAreas = this.areasResource.value() || [];
		this.sourceAreas = [...allAreas].sort((a, b) => a.areaDescription.localeCompare(b.areaDescription));
		this.targetAreas = [];
	}

	saveAssignments() {
		const userId = this.selectedUserId();
		if (!userId) return;

		this.saving.set(true);
		const assignedAreaIds = this.targetAreas.map((a) => a.id || a.Id);

		this.forkliftAreaService.assignAreasToUser(userId, assignedAreaIds).subscribe({
			next: (res) => {
				this.saving.set(false);
				this.messageService.add({
					severity: 'success',
					summary: 'Sincronización Exitosa',
					detail: res.message || 'Jurisdicción actualizada correctamente',
				});
			},
			error: (err) => {
				this.saving.set(false);
				this.errorHandler.handleValidationError(err);
			},
		});
	}

	reload() {
		this.usersResource.reload();
		this.areasResource.reload();
		this.loadUserAssignments();
	}
}
