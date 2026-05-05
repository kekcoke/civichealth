import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emr-labs',
  standalone: true,
  imports: [CommonModule],
  template: `<div class=\"page\"><h1>EMR & Labs</h1><p>Access your electronic medical records and lab results.</p></div>`
})
export class EmrLabsComponent {}
