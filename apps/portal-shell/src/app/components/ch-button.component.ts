import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

@Component({
  selector: 'ch-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button [type]="type" [disabled]="disabled" [class]="buttonClasses" (click)="clicked.emit($event)"><ng-content></ng-content></button>`,
  styles: [`button{font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:400;line-height:1.29;letter-spacing:0.16px;border-radius:0;border:none;padding:12px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background-color 80ms ease;min-height:48px}.btn-primary{background:#0f62fe;color:#fff}.btn-primary:hover{background:#0050e6}.btn-primary:active{background:#002d9c}.btn-secondary{background:#161616;color:#fff}.btn-secondary:hover{background:#262626}.btn-tertiary{background:#fff;color:#0f62fe;border:1px solid #0f62fe}.btn-tertiary:hover{background:#f4f4f4}.btn-ghost{background:transparent;color:#0f62fe}.btn-ghost:hover{background:#f4f4f4}.btn-danger{background:#da1e28;color:#fff}.btn-danger:hover{background:#ba1b23}button:disabled{background:#e0e0e0;color:#8c8c8c;cursor:not-allowed}button:focus-visible{outline:2px solid #0f62fe;outline-offset:0}`]
})
export class ChButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button'|'submit'|'reset' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
  get buttonClasses(): string { return `btn-${this.variant}`; }
}
