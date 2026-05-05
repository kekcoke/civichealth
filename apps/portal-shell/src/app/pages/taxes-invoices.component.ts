import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taxes-invoices',
  standalone: true,
  imports: [CommonModule],
  template: `<div class=\"page\"><h1>Taxes & Invoices</h1><p>Your tax records and invoices will appear here.</p></div>`
})
export class TaxesInvoicesComponent {}
