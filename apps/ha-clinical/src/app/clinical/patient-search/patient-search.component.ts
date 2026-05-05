import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

const SEARCH_PATIENTS = gql`
  query SearchPatients($query: String!) {
    searchPatients(query: $query) {
      id
      federatedIdentity
      firstName
      lastName
      dateOfBirth
      sex
      contactPhone
    }
  }
`;

interface Patient {
  id: string;
  federatedIdentity: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  contactPhone: string;
}

@Component({
  selector: 'ha-patient-search',
  template: `
    <div class="patient-search">
      <div class="page-header">
        <h1>Patient Directory</h1>
        <p class="subtitle">Search by name, date of birth, or phone number</p>
      </div>

      <div class="search-bar">
        <input
          [formControl]="searchCtrl"
          type="text"
          placeholder="Search patients…"
          class="search-input"
          autocomplete="off"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div *ngIf="loading" class="state-msg">Searching…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>
      <div *ngIf="!loading && results.length === 0 && searchCtrl.value" class="state-msg">
        No patients found for "{{ searchCtrl.value }}".
      </div>

      <table *ngIf="results.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Sex</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let patient of results" (click)="openRecord(patient)" class="row-link">
            <td>{{ patient.lastName }}, {{ patient.firstName }}</td>
            <td>{{ patient.dateOfBirth | date:'mediumDate' }}</td>
            <td>{{ patient.sex }}</td>
            <td>{{ patient.contactPhone }}</td>
            <td><button class="btn-primary">Open Record</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .patient-search { padding: 32px; font-family: 'IBM Plex Sans', sans-serif; }
    .page-header { margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; color: #161616; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #525252; margin: 0; }
    .search-bar { position: relative; margin-bottom: 24px; }
    .search-input {
      width: 480px; padding: 10px 40px 10px 12px; border: 1px solid #8d8d8d;
      font-size: 14px; font-family: inherit; outline: none;
    }
    .search-input:focus { border-color: #0f62fe; box-shadow: 0 0 0 2px rgba(15,98,254,0.2); }
    .search-icon { position: absolute; right: calc(100% - 460px); top: 50%; transform: translateY(-50%); pointer-events: none; }
    .state-msg { padding: 16px; color: #525252; font-size: 14px; }
    .state-msg.error { color: #da1e28; }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table thead tr { background: #e0e0e0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.32px; }
    .data-table th { padding: 10px 16px; text-align: left; font-weight: 600; }
    .data-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e0e0e0; }
    .row-link { cursor: pointer; }
    .row-link:hover td { background: #edf5ff; }
    .btn-primary { padding: 4px 14px; background: #0f62fe; color: #fff; border: none; cursor: pointer; font-size: 12px; font-family: inherit; }
  `],
})
export class PatientSearchComponent implements OnInit {
  searchCtrl = new FormControl('');
  results: Patient[] = [];
  loading = false;
  error: string | null = null;

  constructor(private apollo: Apollo, private router: Router) {}

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.trim().length < 2) { this.results = []; return of(null); }
        this.loading = true; this.error = null;
        return this.apollo.query<{ searchPatients: Patient[] }>({
          query: SEARCH_PATIENTS,
          variables: { query: q.trim() },
        }).pipe(catchError(err => { this.error = err.message; return of(null); }));
      }),
    ).subscribe(res => {
      this.loading = false;
      this.results = (res as any)?.data?.searchPatients ?? [];
    });
  }

  openRecord(patient: Patient) {
    this.router.navigate(['/clinical/patients', patient.id]);
  }
}
