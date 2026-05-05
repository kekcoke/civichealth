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
      <h2>Clinician Dashboard</h2>
      <nav>
        <a routerLink="appointments">Appointments</a>
        <a routerLink="encounters">Encounters</a>
        <a routerLink="prescriptions">Prescriptions</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
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
