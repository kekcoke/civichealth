import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permits',
  standalone: true,
  imports: [CommonModule],
  template: `<div class=\"page\"><h1>Permits</h1><p>Manage your civic permits here.</p></div>`
})
export class PermitsComponent {}
