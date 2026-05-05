import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const GET_PATIENT_RECORD = gql`
  query GetPatientRecord($federatedIdentity: ID!) {
    getPatientRecord(federated_identity: $federatedIdentity) {
      id
      federatedIdentity
      firstName
      lastName
      dateOfBirth
      sex
      bloodType
      contactPhone
      contactEmail
      appointments {
        id
        startTime
        status
        appointmentType
      }
      prescriptions {
        id
        drugName
        dosage
        frequency
        status
      }
      encounters {
        id
        encounterDate
        encounterType
        chiefComplaint
        status
      }
    }
  }
`;

@Component({
  selector: 'app-patient-record',
  template: `
    <div class="patient-record" *ngIf="patient$ | async as patient">
      <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
      <dl>
        <dt>DOB</dt><dd>{{ patient.dateOfBirth }}</dd>
        <dt>Blood Type</dt><dd>{{ patient.bloodType }}</dd>
        <dt>Phone</dt><dd>{{ patient.contactPhone }}</dd>
      </dl>
      <section>
        <h4>Active Prescriptions</h4>
        <ul>
          <li *ngFor="let rx of patient.prescriptions">
            {{ rx.drugName }} — {{ rx.dosage }} {{ rx.frequency }}
          </li>
        </ul>
      </section>
      <section>
        <h4>Upcoming Appointments</h4>
        <ul>
          <li *ngFor="let appt of patient.appointments">
            {{ appt.startTime | date:'medium' }} — {{ appt.appointmentType }} ({{ appt.status }})
          </li>
        </ul>
      </section>
    </div>
  `,
})
export class PatientRecordComponent implements OnInit {
  patient$!: Observable<any>;

  constructor(private route: ActivatedRoute, private apollo: Apollo) {}

  ngOnInit(): void {
    const federatedIdentity = this.route.snapshot.paramMap.get('id')!;
    this.patient$ = this.apollo
      .watchQuery({ query: GET_PATIENT_RECORD, variables: { federatedIdentity } })
      .valueChanges.pipe(map((r: any) => r.data.getPatientRecord));
  }
}
