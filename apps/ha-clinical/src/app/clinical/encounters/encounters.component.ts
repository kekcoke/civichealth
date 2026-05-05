import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const LIST_ENCOUNTERS = gql`
  query ListEncounters($patientId: ID!) {
    listEncounters(patient_id: $patientId) {
      id
      encounterDate
      encounterType
      chiefComplaint
      status
    }
  }
`;

const CREATE_ENCOUNTER = gql`
  mutation CreateEncounter(
    $patientId: ID!, $providerId: ID!,
    $encounterDate: String!, $encounterType: String, $chiefComplaint: String
  ) {
    createEncounter(
      patient_id: $patientId,
      provider_id: $providerId,
      encounter_date: $encounterDate,
      encounter_type: $encounterType,
      chief_complaint: $chiefComplaint
    ) {
      encounter { id encounterDate status }
      errors
    }
  }
`;

@Component({
  selector: 'app-encounters',
  template: `
    <div class="encounters">
      <h3>Clinical Encounters</h3>
      <p>Select a patient to view encounter history.</p>
    </div>
  `,
})
export class EncountersComponent {
  constructor(private apollo: Apollo) {}

  listEncounters(patientId: string): Observable<any[]> {
    return this.apollo
      .watchQuery({ query: LIST_ENCOUNTERS, variables: { patientId } })
      .valueChanges.pipe(map((r: any) => r.data.listEncounters));
  }

  createEncounter(vars: any): Observable<any> {
    return this.apollo
      .mutate({ mutation: CREATE_ENCOUNTER, variables: vars })
      .pipe(map((r: any) => r.data.createEncounter));
  }
}
