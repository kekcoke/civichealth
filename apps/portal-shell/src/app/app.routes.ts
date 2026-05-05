import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',  loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'taxes',      loadComponent: () => import('./pages/taxes-invoices.component').then(m => m.TaxesInvoicesComponent) },
  { path: 'permits',    loadComponent: () => import('./pages/permits.component').then(m => m.PermitsComponent) },
  { path: 'service-requests', loadComponent: () => import('./pages/service-requests.component').then(m => m.ServiceRequestsComponent) },
  { path: 'appointments', loadComponent: () => import('./pages/appointments.component').then(m => m.AppointmentsComponent) },
  { path: 'emr',        loadComponent: () => import('./pages/emr-labs.component').then(m => m.EmrLabsComponent) },
  { path: 'profile',    loadComponent: () => import('./pages/profile.component').then(m => m.ProfileComponent) },
  { path: 'login',      loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
];
