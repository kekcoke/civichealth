import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-requests',
  standalone: true,
  imports: [CommonModule],
  template: `<div class=\"page\"><h1>Service Requests</h1><p>Track your civic service requests.</p></div>`
})
export class ServiceRequestsComponent {}
