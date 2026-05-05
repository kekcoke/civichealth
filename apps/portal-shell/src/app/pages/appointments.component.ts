import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `<div class=\"page\"><h1>Appointments</h1><p>View and manage your appointments.</p></div>`
})
export class AppointmentsComponent {}
