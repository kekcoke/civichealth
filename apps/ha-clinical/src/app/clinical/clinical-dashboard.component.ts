import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const LIST_APPOINTMENTS = gql`
  query ListAppointments($patientId: ID!) {
    listAppointments(patient_id: $patientId) {
      id
      startTime
      endTime
      appointmentType
      status
      provider {
        firstName
        lastName
        specialtyCode
      }
    }
  }
`;

const SEARCH_PROVIDERS = gql`
  query SearchProviders($specialty: String) {
    searchProviders(specialty: $specialty) {
      id
      firstName
      lastName
      specialtyCode
      isActive
    }
  }
`;

@Component({
  selector: 'app-clinical-dashboard',
  template: `
    <div class="clinical-dashboard">
      <!-- PWA offline status banner (sticky top) -->
      <ha-offline-banner></ha-offline-banner>

      <div class="clinical-shell">
        <nav class="clinical-nav">
          <span class="nav-brand">HA Clinical</span>
          <a routerLink="patients"       routerLinkActive="active">Patients</a>
          <a routerLink="appointments"   routerLinkActive="active">Appointments</a>
          <a routerLink="encounters"     routerLinkActive="active">Encounters</a>
          <a routerLink="prescriptions"  routerLinkActive="active">Prescriptions</a>
        </nav>
        <main class="clinical-main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .clinical-dashboard { display: flex; flex-direction: column; height: 100vh; font-family: 'IBM Plex Sans', sans-serif; }
    .clinical-shell { display: flex; flex: 1; overflow: hidden; }
    .clinical-nav {
      width: 200px; background: #161616; padding: 24px 0; display: flex;
      flex-direction: column; flex-shrink: 0;
    }
    .nav-brand { padding: 0 16px 20px; color: #f4f4f4; font-size: 13px; font-weight: 600; letter-spacing: 0.16px; }
    .clinical-nav a {
      display: block; padding: 10px 16px; color: #c6c6c6; text-decoration: none;
      font-size: 14px; border-left: 3px solid transparent;
    }
    .clinical-nav a.active { color: #fff; background: #0f62fe; border-left-color: #fff; }
    .clinical-nav a:hover:not(.active) { background: #262626; color: #f4f4f4; }
    .clinical-main { flex: 1; overflow: auto; background: #f4f4f4; }
  `],
})
export class ClinicalDashboardComponent implements OnInit {
  constructor(private apollo: Apollo) {}

  ngOnInit(): void {}

  getAppointments(patientId: string): Observable<any[]> {
    return this.apollo
      .watchQuery({ query: LIST_APPOINTMENTS, variables: { patientId } })
      .valueChanges.pipe(map((r: any) => r.data.listAppointments));
  }

  searchProviders(specialty?: string): Observable<any[]> {
    return this.apollo
      .watchQuery({ query: SEARCH_PROVIDERS, variables: { specialty } })
      .valueChanges.pipe(map((r: any) => r.data.searchProviders));
  }
}
