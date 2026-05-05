import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { OfflineService } from './offline.service';
import { SyncQueueService } from './sync-queue.service';

/**
 * OfflineBannerComponent
 *
 * Persistent status bar shown at the top of the clinical shell.
 * - Offline: red banner with queue count
 * - Back online with pending queue: amber banner with "Syncing…" state
 * - All synced: green banner for 4s then auto-dismisses
 *
 * Usage: <ha-offline-banner></ha-offline-banner>
 */
@Component({
  selector: 'ha-offline-banner',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div *ngIf="banner$ | async as b" class="offline-banner" [ngClass]="b.type">
      <span class="banner-icon">{{ b.icon }}</span>
      <span class="banner-msg">{{ b.message }}</span>
      <button *ngIf="b.showSync" class="banner-sync-btn" (click)="syncNow()" [disabled]="syncing">
        {{ syncing ? 'Syncing…' : 'Sync Now' }}
      </button>
    </div>
  `,
  styles: [`
    .offline-banner {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 16px; font-size: 13px; font-family: 'IBM Plex Sans', sans-serif;
      position: sticky; top: 0; z-index: 1000;
    }
    .offline-banner.offline  { background: #fff1f1; color: #da1e28; border-bottom: 2px solid #da1e28; }
    .offline-banner.syncing  { background: #fff8e1; color: #b45309; border-bottom: 2px solid #f1c21b; }
    .offline-banner.synced   { background: #defbe6; color: #0e6027; border-bottom: 2px solid #24a148; }
    .banner-icon { font-size: 15px; }
    .banner-msg  { flex: 1; }
    .banner-sync-btn {
      padding: 3px 12px; border: 1px solid currentColor; background: transparent;
      color: inherit; cursor: pointer; font-size: 12px; font-family: inherit;
    }
    .banner-sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class OfflineBannerComponent implements OnInit {
  syncing = false;
  queueSize = 0;

  banner$!: Observable<{ type: string; icon: string; message: string; showSync: boolean } | null>;

  private readonly _online$: Observable<boolean>;

  constructor(
    private offline: OfflineService,
    private syncQueue: SyncQueueService,
  ) {
    this._online$ = this.offline.isOnline$;
  }

  ngOnInit() {
    // Poll queue size every 5s (lightweight — IDB read)
    setInterval(async () => {
      this.queueSize = await this.syncQueue.queueSize();
    }, 5000);

    this.banner$ = this._online$.pipe(
      map(online => {
        if (!online) {
          return {
            type: 'offline',
            icon: '📴',
            message: `You are offline. ${this.queueSize > 0 ? `${this.queueSize} mutation(s) queued for sync.` : 'Changes will be queued automatically.'}`,
            showSync: false,
          };
        }
        if (this.queueSize > 0) {
          return {
            type: 'syncing',
            icon: '🔄',
            message: `Back online — ${this.queueSize} pending mutation(s) will sync shortly.`,
            showSync: true,
          };
        }
        return null; // no banner when online and queue is empty
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    );
  }

  async syncNow() {
    this.syncing = true;
    await this.syncQueue.flushNow();
    this.queueSize = await this.syncQueue.queueSize();
    this.syncing = false;
  }
}
