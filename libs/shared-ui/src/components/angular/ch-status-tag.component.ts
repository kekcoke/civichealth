import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * ChStatusTagComponent — Carbon status badge.
 * DESIGN.MD: rounded.xs (2px) — rare exception for badges.
 * Uses semantic color tokens only.
 */
@Component({
  selector: 'ch-status-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'status-tag status-' + status">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .status-tag {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.32px;
      line-height: 1.33;
      padding: 2px 8px;
      border-radius: 2px;
      display: inline-block;
      white-space: nowrap;
    }
    .status-success { background: #defbe6; color: #0e6027; }
    .status-warning { background: #fdf6dd; color: #8a5600; }
    .status-error   { background: #fff1f1; color: #da1e28; }
    .status-info    { background: #edf5ff; color: #0043ce; }
    .status-neutral { background: #f4f4f4; color: #525252; }
  `]
})
export class ChStatusTagComponent {
  @Input() status: TagStatus = 'neutral';
}
