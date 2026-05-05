import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * ConsentSettingsComponent (Gap 5)
 *
 * Public-facing consent management panel embedded in the Citizen Dashboard.
 * Calls the HA BFF GraphQL `updateConsentDirective` mutation with the citizen's
 * OIDC JWT — the BFF PHI sanitizer ensures only consent fields are writable
 * by non-clinician tokens.
 *
 * Usage:
 *   <app-consent-settings [federatedIdentity]="oidcUuid" [jwt]="token" />
 */

const HA_BFF_URL = (window as any).__HA_BFF_URL__ || 'https://ha-proxy.internal/api/ha/v1/graphql';

interface ConsentState {
  shareAllClinics: boolean;
  restrictToPcp: boolean;
  researchOptIn: boolean;
}

@Component({
  selector: 'app-consent-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="consent-panel">
      <div class="consent-header">
        <span class="consent-icon">🔐</span>
        <h3>EMR Consent Directives</h3>
      </div>

      <div *ngIf="saveSuccess" class="consent-banner consent-banner--success">
        ✓ Consent preferences saved successfully.
      </div>
      <div *ngIf="saveError" class="consent-banner consent-banner--error">
        ✗ {{ saveError }}
      </div>

      <fieldset class="consent-fieldset" [disabled]="saving">

        <!-- Share with all clinics -->
        <label class="consent-option">
          <input
            type="radio"
            name="shareScope"
            [value]="true"
            [(ngModel)]="consent.shareAllClinics"
            (change)="onScopeChange(true)"
          />
          <span class="consent-label">
            <strong>Share EMR with all HA Clinics</strong>
            <small>Any authorized HA facility can access your full health record.</small>
          </span>
        </label>

        <!-- Restrict to PCP -->
        <label class="consent-option">
          <input
            type="radio"
            name="shareScope"
            [value]="false"
            [(ngModel)]="consent.shareAllClinics"
            (change)="onScopeChange(false)"
          />
          <span class="consent-label">
            <strong>Restrict EMR to Primary Care Provider Only</strong>
            <small>Only your registered primary care provider can access your record.</small>
          </span>
        </label>

        <hr class="consent-divider" />

        <!-- Research opt-in -->
        <label class="consent-option consent-option--checkbox">
          <input type="checkbox" [(ngModel)]="consent.researchOptIn" />
          <span class="consent-label">
            <strong>Opt-in to anonymized public health research</strong>
            <small>Your de-identified data may be used for population health studies. No PHI is shared.</small>
          </span>
        </label>

      </fieldset>

      <div class="consent-actions">
        <button class="btn-primary" (click)="save()" [disabled]="saving">
          {{ saving ? 'Saving…' : 'Save Preferences' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .consent-panel {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      padding: 20px 24px;
      font-family: 'IBM Plex Sans', sans-serif;
    }
    .consent-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .consent-header h3 {
      font-size: 15px;
      font-weight: 600;
      color: #161616;
      margin: 0;
    }
    .consent-banner {
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 14px;
      border-left: 3px solid;
    }
    .consent-banner--success { background: #defbe6; color: #0e6027; border-color: #24a148; }
    .consent-banner--error   { background: #fff1f1; color: #da1e28; border-color: #da1e28; }
    .consent-fieldset {
      border: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .consent-fieldset[disabled] { opacity: 0.6; pointer-events: none; }
    .consent-option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      padding: 10px 12px;
      border: 1px solid transparent;
      transition: border-color 0.15s;
    }
    .consent-option:hover { border-color: #c6c6c6; background: #f4f4f4; }
    .consent-option input { margin-top: 2px; accent-color: #0f62fe; flex-shrink: 0; }
    .consent-label { display: flex; flex-direction: column; gap: 2px; }
    .consent-label strong { font-size: 14px; color: #161616; font-weight: 500; }
    .consent-label small  { font-size: 12px; color: #525252; }
    .consent-divider { border: none; border-top: 1px solid #e0e0e0; margin: 4px 0; }
    .consent-actions { margin-top: 16px; }
    .btn-primary {
      padding: 8px 20px;
      background: #0f62fe;
      color: #ffffff;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      font-weight: 500;
    }
    .btn-primary:disabled { background: #c6c6c6; cursor: not-allowed; }
    .btn-primary:hover:not(:disabled) { background: #0353e9; }
  `],
})
export class ConsentSettingsComponent implements OnInit {
  @Input() federatedIdentity!: string;
  @Input() jwt!: string;

  consent: ConsentState = {
    shareAllClinics: false,
    restrictToPcp: true,
    researchOptIn: false,
  };

  saving = false;
  saveSuccess = false;
  saveError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load existing consent directives on mount if identity is available
    if (this.federatedIdentity && this.jwt) this.loadConsent();
  }

  onScopeChange(shareAll: boolean) {
    this.consent.shareAllClinics = shareAll;
    this.consent.restrictToPcp = !shareAll;
  }

  private loadConsent() {
    const query = `
      query GetConsent($federatedIdentity: ID!) {
        getPatientRecord(federated_identity: $federatedIdentity) {
          consentDirectives {
            directiveType
            isActive
          }
        }
      }
    `;
    this.http.post<any>(
      HA_BFF_URL,
      { query, variables: { federatedIdentity: this.federatedIdentity } },
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.jwt}`, 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: ({ data }) => {
        const directives: { directiveType: string; isActive: boolean }[] =
          data?.getPatientRecord?.consentDirectives ?? [];
        const findActive = (type: string) => directives.find(d => d.directiveType === type)?.isActive ?? false;
        this.consent.shareAllClinics = findActive('SHARE_ALL_CLINICS');
        this.consent.restrictToPcp   = findActive('RESTRICT_TO_PCP');
        this.consent.researchOptIn   = findActive('RESEARCH_OPT_IN');
      },
    });
  }

  save() {
    if (!this.federatedIdentity || !this.jwt) return;
    this.saving = true; this.saveSuccess = false; this.saveError = null;

    const mutation = `
      mutation UpdateConsent($federatedIdentity: ID!, $directives: [ConsentDirectiveInput!]!) {
        updateConsentDirectives(federated_identity: $federatedIdentity, directives: $directives) {
          success
          errors
        }
      }
    `;

    const directives = [
      { directiveType: 'SHARE_ALL_CLINICS', isActive: this.consent.shareAllClinics },
      { directiveType: 'RESTRICT_TO_PCP',   isActive: this.consent.restrictToPcp },
      { directiveType: 'RESEARCH_OPT_IN',   isActive: this.consent.researchOptIn },
    ];

    this.http.post<any>(
      HA_BFF_URL,
      { query: mutation, variables: { federatedIdentity: this.federatedIdentity, directives } },
      { headers: new HttpHeaders({ Authorization: `Bearer ${this.jwt}`, 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: ({ data }) => {
        this.saving = false;
        if (data?.updateConsentDirectives?.success) {
          this.saveSuccess = true;
          setTimeout(() => (this.saveSuccess = false), 4000);
        } else {
          this.saveError = data?.updateConsentDirectives?.errors?.join(', ') ?? 'Unknown error';
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err.message ?? 'Network error — please try again.';
      },
    });
  }
}
