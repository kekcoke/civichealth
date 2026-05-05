import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ApolloModule } from 'apollo-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ClinicalDashboardComponent } from './clinical-dashboard.component';
import { PatientRecordComponent } from './patient-record/patient-record.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { EncountersComponent } from './encounters/encounters.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';

const routes: Routes = [
  {
    path: '',
    component: ClinicalDashboardComponent,
    children: [
      { path: '',                  redirectTo: 'patients', pathMatch: 'full' },
      { path: 'patients',          component: PatientSearchComponent },
      { path: 'patients/:id',      component: PatientRecordComponent },
      { path: 'appointments',      component: AppointmentsComponent },
      { path: 'encounters',        component: EncountersComponent },
      { path: 'prescriptions',     component: PrescriptionsComponent },
    ]
  }
];

@NgModule({
  declarations: [
    ClinicalDashboardComponent,
    PatientRecordComponent,
    PatientSearchComponent,
    AppointmentsComponent,
    EncountersComponent,
    PrescriptionsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ApolloModule,
    RouterModule.forChild(routes),
  ],
})
export class ClinicalModule {}
