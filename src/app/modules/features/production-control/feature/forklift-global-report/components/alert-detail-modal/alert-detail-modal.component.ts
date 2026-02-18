import { Component, input, output, ChangeDetectionStrategy, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ForkliftAlertInterface } from '../../services/forklift-global-report.service';

@Component({
	selector: 'forklift-alert-detail-modal',
	standalone: true,
	imports: [CommonModule, DialogModule, TagModule, ButtonModule],
	template: `
		<p-dialog
			[(visible)]="visible"
			[modal]="true"
			[dismissableMask]="true"
			[showHeader]="false"
			styleClass="modern-alert-dialog"
			[breakpoints]="{ '960px': '85vw', '640px': '95vw' }"
			[style]="{ width: '850px', border: 'none', background: 'transparent' }"
		>
			@if (alert()) {
				<div
					class="bg-surface-0 dark:bg-surface-900 rounded-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col md:flex-row max-h-[90vh]"
				>
					<!-- Left Panel: Content -->
					<div class="grow overflow-y-auto">
						<div
							[class]="alert()?.criticalDate ? 'bg-red-500/10' : 'bg-surface-100/30 dark:bg-surface-800/20'"
							class="p-10 border-b border-surface-100 dark:border-surface-800 flex justify-between items-start sticky top-0 z-50 backdrop-blur-2xl"
						>
							<div class="flex items-center gap-6">
								<div
									class="w-16 h-16 bg-white dark:bg-surface-950 shadow-2xl rounded-3xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5"
								>
									<span class="material-symbols-outlined text-primary-500 text-3xl">inventory_2</span>
								</div>
								<div>
									<div class="flex items-center gap-3">
										<h2 class="text-3xl font-black text-surface-950 dark:text-surface-0 m-0 tracking-tighter">
											{{ alert()?.partNumberLogisticsResponseDto?.partNumber }}
										</h2>
										@if (alert()?.criticalDate) {
											<p-tag severity="danger" value="CRITICAL" styleClass="px-4 py-1 font-black text-[10px] tracking-widest" />
										}
									</div>
									<div class="flex items-center gap-2 mt-2 opacity-60">
										<span class="material-symbols-outlined text-xs">fmd_good</span>
										<p class="text-xs m-0 font-black uppercase tracking-widest">
											{{ alert()?.partNumberLogisticsResponseDto?.area }} •
											{{ alert()?.partNumberLogisticsResponseDto?.location }}
										</p>
									</div>
								</div>
							</div>
							<p-button
								icon="pi pi-times"
								[text]="true"
								(onClick)="visible.set(false)"
								severity="secondary"
								styleClass="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black transition-all"
							/>
						</div>

						<div class="p-10 space-y-12">
							<!-- Matrix Stats -->
							<div class="grid grid-cols-2 gap-8 text-center">
								<div
									class="p-8 bg-surface-50 dark:bg-surface-800/40 rounded-[2.5rem] border border-surface-100 dark:border-surface-700/50 shadow-inner group hover:border-primary-500/30 transition-all"
								>
									<p class="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3 opacity-60">Pack Standard (SNP)</p>
									<p class="text-5xl font-black text-primary-500 m-0 tracking-tighter group-hover:scale-110 transition-transform">
										{{ alert()?.partNumberLogisticsResponseDto?.snp }}
									</p>
								</div>
								<div class="p-8 bg-surface-50 dark:bg-surface-800/40 rounded-[2.5rem] border border-surface-100 dark:border-surface-700/50 shadow-inner">
									<p class="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3 opacity-60">System Diagnosis</p>
									<div class="flex flex-col items-center gap-2">
										<span class="text-xs font-black text-surface-800 dark:text-surface-200 uppercase leading-relaxed">{{ alert()?.statusDescription }}</span>
										<div class="w-12 h-1 bg-primary-500/20 rounded-full mt-2">
											<div class="w-1/2 h-full bg-primary-500 rounded-full animate-progress"></div>
										</div>
									</div>
								</div>
							</div>

							<!-- Lead Responsible -->
							<div class="bg-surface-950 p-8 rounded-4xl shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
								<div
									class="absolute -right-20 -top-20 w-60 h-60 bg-primary-500/10 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all"
								></div>

								<div class="flex items-center gap-6 relative z-10">
									<div class="w-20 h-20 rounded-3xl bg-linear-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl">
										<span class="text-2xl font-black text-white italic">{{ alert()?.userData?.userName?.charAt(0) }}</span>
									</div>
									<div class="min-w-0 flex-1">
										<span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] block mb-2 leading-none">Dispatcher Assigned</span>
										<h4 class="text-2xl font-black text-white m-0 tracking-tighter truncate">
											{{ alert()?.userData?.userName }}
										</h4>
										<div class="flex items-center gap-4 mt-3">
											<div class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
												<span class="material-symbols-outlined text-[10px] text-surface-400">mail</span>
												<span class="text-[9px] font-bold text-surface-300 pr-2 truncate max-w-[120px]">{{ alert()?.userData?.email }}</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Transaction History -->
							<div class="px-4">
								<h4 class="text-[10px] font-black text-surface-400 uppercase tracking-[0.4em] mb-8 border-l-4 border-primary-500 pl-4">Audit Trazability</h4>
								<div
									class="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-surface-100 dark:before:bg-surface-800 before:rounded-full"
								>
									<div class="relative pl-12 group/step">
										<div
											class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface-0 dark:bg-surface-900 border-4 border-surface-200 dark:border-surface-700 shadow-xl transition-all group-hover/step:scale-125 group-hover/step:border-primary-500"
										></div>
										<div class="flex justify-between items-start">
											<div>
												<p class="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none mb-2">Sync: Data Entry</p>
												<p class="text-base font-black text-surface-800 dark:text-surface-200 m-0">ERP Signal Detection</p>
											</div>
											<span class="text-xs font-black text-surface-400 font-mono">{{ alert()?.createDate | date: 'HH:mm:ss' }}</span>
										</div>
									</div>

									@if (alert()?.criticalDate) {
										<div class="relative pl-12 group/step">
											<div
												class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface-0 dark:bg-surface-900 border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
											></div>
											<div class="flex justify-between items-start text-red-600">
												<div>
													<p class="text-[10px] font-black uppercase tracking-widest leading-none mb-2">Escalation: Level 3</p>
													<p class="text-base font-black m-0">Critical Stock Rupture</p>
												</div>
												<span class="text-xs font-black font-mono">{{ alert()?.criticalDate | date: 'HH:mm:ss' }}</span>
											</div>
										</div>
									}

									@if (alert()?.receivedDate) {
										<div class="relative pl-12 group/step">
											<div
												class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface-0 dark:bg-surface-900 border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all group-hover/step:scale-125"
											></div>
											<div class="flex justify-between items-start text-blue-600">
												<div>
													<p class="text-[10px] font-black uppercase tracking-widest leading-none mb-2">Acknowledgement</p>
													<p class="text-base font-black m-0">Dispatcher Handshake</p>
												</div>
												<span class="text-xs font-black font-mono">{{ alert()?.receivedDate | date: 'HH:mm:ss' }}</span>
											</div>
										</div>
									}
								</div>
							</div>
						</div>
					</div>

					<!-- Right Panel: Remote Commands -->
					<div class="w-full md:w-80 bg-surface-50 dark:bg-black/20 border-l border-surface-100 dark:border-surface-800 p-10 flex flex-col gap-6">
						<h3 class="text-[10px] font-black text-surface-400 uppercase tracking-[0.5rem] mb-6 text-center leading-none">Control Matrix</h3>

						<p-button
							label="REASSIGN FLOW"
							icon="pi pi-sync"
							(onClick)="onReassign.emit()"
							severity="secondary"
							styleClass="w-full h-16 text-[10px] font-black tracking-widest rounded-2xl border-white/10 shadow-xl active:scale-95 transition-all text-left uppercase pl-6"
						/>

						<p-button
							label="PUSH NOTIFY"
							icon="pi pi-send"
							(onClick)="onNotify.emit()"
							severity="secondary"
							styleClass="w-full h-16 text-[10px] font-black tracking-widest rounded-2xl border-white/10 shadow-xl active:scale-95 transition-all text-left uppercase pl-6"
						/>

						@if (!alert()?.criticalDate && !alert()?.completeDate) {
							<p-button
								label="BOOST PRIORITY"
								icon="pi pi-bolt"
								(onClick)="onBoost.emit()"
								severity="danger"
								styleClass="w-full h-16 text-[10px] font-black tracking-widest rounded-2xl border-white/10 shadow-xl active:scale-95 transition-all text-left uppercase pl-6 animate-shimmer"
							/>
						}

						<div class="mt-auto pt-10 border-t border-surface-200 dark:border-surface-800 flex flex-col items-center gap-4">
							<div
								class="w-32 h-32 p-4 bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200/50 dark:border-white/5 opacity-40 hover:opacity-100 transition-opacity"
							>
								<img
									src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ alert()?.id }}"
									class="w-full h-full grayscale dark:invert"
									alt="Tracking QR"
								/>
							</div>
							<div class="text-center">
								<p class="text-[8px] text-surface-400 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Security Token UID</p>
								<div class="bg-surface-0 dark:bg-surface-900 px-4 py-2 rounded-xl border border-surface-200/50 dark:border-white/5 shadow-inner">
									<code class="block text-[8px] text-surface-500 font-mono break-all leading-tight">
										{{ alert()?.id }}
									</code>
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		</p-dialog>
	`,
	styles: [
		`
			@keyframes progress {
				0% {
					width: 0%;
				}
				100% {
					width: 60%;
				}
			}
			.animate-progress {
				animation: progress 2s ease-out forwards;
			}
			@keyframes shimmer {
				0% {
					opacity: 1;
				}
				50% {
					opacity: 0.8;
				}
				100% {
					opacity: 1;
				}
			}
			.animate-shimmer {
				animation: shimmer 2s infinite ease-in-out;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForkliftAlertDetailModalComponent {
	visible = model<boolean>(false);
	alert = input<ForkliftAlertInterface | null>(null);

	onReassign = output<void>();
	onNotify = output<void>();
	onBoost = output<void>();
}
