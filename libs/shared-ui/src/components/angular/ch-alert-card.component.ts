import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * ChAlertCardComponent — Carbon feature-card tile for dashboard alerts.
 * DESIGN.MD: feature-card — canvas bg, hairline 1px border, 0px radius, 24px padding.
 * Severity maps to semantic left-border accent.
 */
@Component({
  selector: 'ch-alert-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'alert-card alert-' + severity">
      <div class="alert-header">
        <span class="alert-icon">{{ icon }}</span>
        <span class="alert-title">{{ title }}</span>
      </div>
      <div class="alert-body">
        <ng-content></ng-content>
      </div>
      <div class="alert-action" *ngIf="actionLabel">
        <a class="alert-cta">{{ actionLabel }} →</a>
      </div>
    </div>
  `,
  styles: [`
    .alert-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-left-width: 4px;
      border-radius: 0;
      padding: 24px;
      font-family: 'IBM Plex Sans', sans-serif;
    }
    .alert-info    { border-left-color: #0f62fe; }
    .alert-success { border-left-color: #24a148; }
    .alert-warning { border-left-color: #f1c21b; }
    .alert-error   { border-left-color: #da1e28; }
    .alert-header  { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .alert-icon    { font-size: 16px; }
    .alert-title   { font-size: 16px; font-weight: 400; color: #161616; line-height: 1.50; letter-spacing: 0.16px; }
    .alert-body    { font-size: 14px; color: #525252; line-height: 1.29; letter-spacing: 0.16px; }
    .alert-action  { margin-top: 16px; }
    .alert-cta     { font-size: 14px; color: #0f62fe; cursor: pointer; letter-spacing: 0.16px; text-decoration: none; }
    .alert-cta:hover { color: #0043ce; }
  `]
})
export class ChAlertCardComponent {
  @Input() title = '';
  @Input() severity: AlertSeverity = 'info';
  @Input() icon = '[!]';
  @Input() actionLabel = '';
}
