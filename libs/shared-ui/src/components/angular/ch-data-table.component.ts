import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

/**
 * ChDataTableComponent — Carbon data table.
 * DESIGN.MD: surface-1 alternate rows, hairline borders, 0px radius.
 * body-sm (14px/400/0.16px) for cell content.
 */
@Component({
  selector: 'ch-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table class="ch-table">
        <thead>
          <tr>
            <th *ngFor="let col of columns" [style.width]="col.width">
              {{ col.label }}
            </th>
            <th *ngIf="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let i = index" [class.row-alt]="i % 2 === 1">
            <td *ngFor="let col of columns">
              <ng-container *ngIf="!isStatusField(col.key); else statusCell">
                {{ row[col.key] }}
              </ng-container>
              <ng-template #statusCell>
                <ch-status-tag [status]="resolveStatus(row[col.key])">
                  {{ row[col.key] }}
                </ch-status-tag>
              </ng-template>
            </td>
            <td *ngIf="actions" class="action-cell">
              <ng-content></ng-content>
            </td>
          </tr>
          <tr *ngIf="!data || data.length === 0">
            <td [colSpan]="columns.length + (actions ? 1 : 0)" class="empty-row">
              No records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; }
    .ch-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.16px;
      line-height: 1.29;
    }
    thead tr { background: #f4f4f4; border-bottom: 1px solid #e0e0e0; }
    th {
      text-align: left;
      padding: 12px 16px;
      color: #161616;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.32px;
      white-space: nowrap;
    }
    td { padding: 12px 16px; color: #161616; border-bottom: 1px solid #e0e0e0; }
    .row-alt td { background: #f4f4f4; }
    .action-cell { white-space: nowrap; }
    .empty-row { text-align: center; color: #8c8c8c; padding: 32px 16px; }
  `]
})
export class ChDataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions = false;
  @Input() statusFields: string[] = ['status', 'taxStatus', 'permitStatus'];

  isStatusField(key: string): boolean {
    return this.statusFields.includes(key);
  }

  resolveStatus(value: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const v = (value || '').toUpperCase();
    if (['PAID', 'APPROVED', 'ACTIVE', 'CLEARED', 'COMPLETED'].includes(v)) return 'success';
    if (['OVERDUE', 'ARREARS', 'FAILED', 'DENIED'].includes(v))              return 'error';
    if (['PENDING', 'UNDER REVIEW', 'IN PROGRESS'].includes(v))              return 'warning';
    if (['SUBMITTED', 'OPEN', 'SCHEDULED'].includes(v))                      return 'info';
    return 'neutral';
  }
}
