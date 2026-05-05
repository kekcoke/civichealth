import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentSettingsComponent } from './consent-settings.component';

// Custom Element registration handled via Module Federation remote
// import '../../../ha-clinical/src/app/health-status/health-status.element';

/**
 * DashboardComponent — Citizen's unified home screen.
 *
 * Combines:
 *  - Quick-links to all portal sections
 *  - <health-status-widget> Custom Element (appointment summary, no PHI)
 *  - <app-consent-settings> (Gap 5) — EMR consent directive management
 *
 * OIDC token + federated identity are read from sessionStorage (written by
 * Keycloak redirect handler in the shell bootstrap).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ConsentSettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Welcome back</h1>
        <p class="dashboard-subtitle">Your CivicHealth unified portal</p>
      </header>

      <!-- Quick links grid -->
      <section class="quicklinks">
        <a *ngFor="let link of quickLinks" [href]="link.href" class="quicklink-card">
          <span class="quicklink-icon">{{ link.icon }}</span>
          <span class="quicklink-label">{{ link.label }}</span>
        </a>
      </section>

      <!-- Two-column widget row -->
      <div class="widget-row">

        <!-- Health status widget (Custom Element — no PHI) -->
        <div class="widget-col">
          <div class="widget-card">
            <ng-container *ngIf="federatedIdentity && jwt; else noHealth">
              <health-status-widget
                [attr.federated-identity]="federatedIdentity"
                [attr.jwt]="jwt"
              ></health-status-widget>
            </ng-container>
            <ng-template #noHealth>
              <p class="widget-placeholder">🏥 Sign in to view your health status.</p>
            </ng-template>
          </div>
        </div>

        <!-- Consent settings panel (Gap 5) -->
        <div class="widget-col">
          <app-consent-settings
            *ngIf="federatedIdentity && jwt; else noConsent"
            [federatedIdentity]="federatedIdentity"
            [jwt]="jwt"
          ></app-consent-settings>
          <ng-template #noConsent>
            <div class="widget-card">
              <p class="widget-placeholder">🔐 Sign in to manage consent preferences.</p>
            </div>
          </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; font-family: 'IBM Plex Sans', sans-serif; max-width: 1200px; }

    .dashboard-header { margin-bottom: 28px; }
    .dashboard-header h1 { font-size: 24px; font-weight: 300; color: #161616; margin: 0 0 4px; }
    .dashboard-subtitle  { font-size: 14px; color: #525252; margin: 0; }

    /* Quick-link cards */
    .quicklinks {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .quicklink-card {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px 12px; background: #ffffff; border: 1px solid #e0e0e0;
      text-decoration: none; color: #161616; gap: 8px;
      transition: border-color 0.15s, background 0.15s;
    }
    .quicklink-card:hover { border-color: #0f62fe; background: #edf5ff; }
    .quicklink-icon  { font-size: 24px; }
    .quicklink-label { font-size: 13px; font-weight: 500; text-align: center; }

    /* Widget row */
    .widget-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .widget-row { grid-template-columns: 1fr; } }

    .widget-card { background: #ffffff; border: 1px solid #e0e0e0; padding: 20px; }
    .widget-placeholder { font-size: 13px; color: #525252; margin: 0; }
  `],
})
export class DashboardComponent implements OnInit {
  federatedIdentity: string | null = null;
  jwt: string | null = null;

  readonly quickLinks = [
    { icon: '🧾', label: 'Taxes & Invoices', href: '/taxes' },
    { icon: '📋', label: 'Permits',           href: '/permits' },
    { icon: '🚧', label: '311 Requests',      href: '/service-requests' },
    { icon: '📅', label: 'Appointments',      href: '/appointments' },
    { icon: '🏥', label: 'Health Record',     href: '/emr' },
    { icon: '👤', label: 'My Profile',        href: '/profile' },
  ];

  ngOnInit() {
    // Portal shell bootstrap writes kc_token + kc_identity after Keycloak redirect
    this.jwt = sessionStorage.getItem('kc_token');
    this.federatedIdentity = sessionStorage.getItem('kc_identity');
  }
}
