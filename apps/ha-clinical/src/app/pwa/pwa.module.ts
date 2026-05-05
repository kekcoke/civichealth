import { NgModule, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OfflineService } from './offline.service';
import { SyncQueueService } from './sync-queue.service';
import { OfflineBannerComponent } from './offline-banner.component';

/**
 * PwaModule
 *
 * Registers the Angular Service Worker and exports the offline/sync services
 * plus the OfflineBannerComponent for use throughout the clinical MFE.
 *
 * Import into ClinicalModule (or AppModule) once at the root level.
 */
@NgModule({
  imports: [
    CommonModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the SW after 3 seconds so it doesn't compete with initial boot
      registrationStrategy: 'registerWithDelay:3000',
    }),
    OfflineBannerComponent,
  ],
  exports: [
    OfflineBannerComponent,
  ],
  providers: [
    OfflineService,
    SyncQueueService,
  ],
})
export class PwaModule {}
