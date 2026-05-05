import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

/**
 * ChButtonComponent — Carbon/IBM square-corner button.
 * DESIGN.MD: rounded.none (0px), IBM Plex Sans 14px/400, letter-spacing 0.16px.
 * Primary = IBM Blue #0f62fe. No pill shapes.
 */
@Component({
  selector: 'ch-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ch-button.component.html',
  styleUrl: './ch-button.component.css'
})
export class ChButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return `btn-${this.variant}`;
  }
}
