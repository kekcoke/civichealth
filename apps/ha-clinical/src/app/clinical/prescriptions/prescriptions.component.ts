import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const GET_ACTIVE_PRESCRIPTIONS = gql`
  query GetActivePrescriptions($patientId: ID!) {
    getActivePrescriptions(patient_id: $patientId) {
      id
      drugName
      drugCode
      dosage
      frequency
      durationDays
      refillsAllowed
      refillsUsed
      status
      prescribedOn
      expiresOn
    }
  }
`;

@Component({
  selector: 'app-prescriptions',
  template: `
    <div class="prescriptions">
      <h3>Active Prescriptions</h3>
      <ul *ngIf="prescriptions$ | async as rxList">
        <li *ngFor="let rx of rxList">
          <strong>{{ rx.drugName }}</strong> — {{ rx.dosage }}, {{ rx.frequency }}
          <span class="badge">{{ rx.status }}</span>
        </li>
      </ul>
    </div>
  `,
})
export class PrescriptionsComponent {
  prescriptions$!: Observable<any[]>;

  constructor(private apollo: Apollo) {}

  loadPrescriptions(patientId: string): void {
    this.prescriptions$ = this.apollo
      .watchQuery({ query: GET_ACTIVE_PRESCRIPTIONS, variables: { patientId } })
      .valueChanges.pipe(map((r: any) => r.data.getActivePrescriptions));
  }
}
