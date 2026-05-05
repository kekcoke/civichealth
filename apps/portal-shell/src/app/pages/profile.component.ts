import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChButtonComponent } from '../../../../libs/shared-ui/src/components/angular/ch-button.component';

/**
 * ProfileComponent — Profile & Settings with EMR Consent Directives.
 * Wireframe: citizen_portal_screens.md #2
 * Addresses Gap 5: citizen-facing consent management UI.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ChButtonComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">My Profile</h2>
        <div class="header-actions">
          <ch-button variant="tertiary">Edit Info</ch-button>
          <ch-button variant="ghost">Bank Details</ch-button>
        </div>
      </div>

      <div class="profile-section">
        <dl class="profile-dl">
          <div class="profile-row"><dt>Name</dt><dd>{{ profile.name }}</dd></div>
          <div class="profile-row"><dt>OIDC Identity (UUID)</dt><dd class="uuid">{{ profile.uuid }}</dd></div>
          <div class="profile-row"><dt>Email</dt><dd>{{ profile.email }}</dd></div>
        </dl>
      </div>

      <div class="consent-section">
        <h3 class="section-label">🔐 EMR Consent Directives (Health)</h3>
        <div class="consent-list">
          <label class="consent-item" *ngFor="let c of consentDirectives">
            <input type="radio" name="emrConsent" [value]="c.value" [(ngModel)]="selectedConsent" class="consent-radio" />
            <span class="consent-label">{{ c.label }}</span>
          </label>
          <label class="consent-item">
            <input type="checkbox" [(ngModel)]="researchOptIn" class="consent-radio" />
            <span class="consent-label">Opt-in to anonymized public health research</span>
          </label>
        </div>
        <div style="margin-top:24px;">
          <ch-button variant="primary" (clicked)="saveConsent()">Save Consent Preferences</ch-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 640px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #e0e0e0; }
    .page-title { font-size:24px; font-weight:400; color:#161616; line-height:1.33; }
    .header-actions { display:flex; gap:8px; }
    .profile-dl { display:flex; flex-direction:column; }
    .profile-row { display:flex; gap:24px; padding:12px 0; border-bottom:1px solid #e0e0e0; }
    dt { font-size:12px; color:#8c8c8c; letter-spacing:0.32px; min-width:180px; }
    dd { font-size:14px; color:#161616; letter-spacing:0.16px; }
    .uuid { font-size:12px; color:#525252; font-family:'IBM Plex Mono',monospace; }
    .consent-section { background:#f4f4f4; padding:24px; border:1px solid #e0e0e0; margin-top:32px; }
    .section-label { font-size:16px; font-weight:400; color:#161616; margin-bottom:16px; letter-spacing:0.16px; }
    .consent-list { display:flex; flex-direction:column; gap:12px; }
    .consent-item { display:flex; align-items:flex-start; gap:12px; cursor:pointer; }
    .consent-radio { accent-color:#0f62fe; margin-top:2px; }
    .consent-label { font-size:14px; color:#161616; letter-spacing:0.16px; line-height:1.50; }
  `]
})
export class ProfileComponent {
  profile = { name: 'John Doe', uuid: '123e4567-e89b-12d3-a456-426614174000', email: 'john.doe@civic.gov' };
  selectedConsent = 'primary_only';
  researchOptIn = true;
  consentDirectives = [
    { value: 'all',          label: 'Share EMR with all HA Clinics' },
    { value: 'primary_only', label: 'Restrict EMR to Primary Care Provider Only' },
  ];
  saveConsent(): void { console.log('Consent saved:', this.selectedConsent, this.researchOptIn); }
}
