import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SCHEDULE_APPOINTMENT = gql`
  mutation ScheduleAppointment($input: AppointmentInput!) {
    scheduleAppointment(
      patient_id: $input.patientId,
      provider_id: $input.providerId,
      start_time: $input.startTime,
      end_time: $input.endTime,
      appointment_type: $input.appointmentType
    ) {
      appointment { id status startTime }
      errors
    }
  }
`;

const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!) {
    cancelAppointment(id: $id) {
      appointment { id status }
      errors
    }
  }
`;

@Component({
  selector: 'app-appointments',
  template: `
    <div class="appointments">
      <h3>Appointments</h3>
      <p>Use the patient record to view and manage appointments.</p>
    </div>
  `,
})
export class AppointmentsComponent {
  constructor(private apollo: Apollo) {}

  scheduleAppointment(input: any): Observable<any> {
    return this.apollo
      .mutate({ mutation: SCHEDULE_APPOINTMENT, variables: { input } })
      .pipe(map((r: any) => r.data.scheduleAppointment));
  }

  cancelAppointment(id: string): Observable<any> {
    return this.apollo
      .mutate({ mutation: CANCEL_APPOINTMENT, variables: { id } })
      .pipe(map((r: any) => r.data.cancelAppointment));
  }
}
