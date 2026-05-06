import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientSearchComponent } from './patient-search.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';

// Minimal Apollo mock — replace query/mutate with per-test spies
class MockApollo {
  query = jasmine.createSpy('query').and.returnValue(of({ data: { searchPatients: [] } }));
  mutate = jasmine.createSpy('mutate').and.returnValue(of({ data: null }));
  watchQuery = jasmine.createSpy('watchQuery').and.returnValue({ valueChanges: of({ data: [] }) });
  mutateObservable = jasmine.createSpy('mutate').and.returnValue(of({ data: null }));
}

describe('PatientSearchComponent', () => {
  let fixture: ComponentFixture<PatientSearchComponent>;
  let component: PatientSearchComponent;
  let apollo: MockApollo;

  beforeEach(async () => {
    apollo = new MockApollo();

    await TestBed.configureTestingModule({
      declarations: [PatientSearchComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: Apollo, useValue: apollo }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('debounce behavior', () => {
    it('debounce — fires GraphQL query after 300 ms of no input', fakeAsync(() => {
      jasmine.clock().install();

      const searchCtrl = component.searchCtrl;
      searchCtrl.setValue('garcia');

      // No query should fire before debounce
      expect(apollo.query).not.toHaveBeenCalled();

      tick(350); // past debounceTime(300)

      expect(apollo.query).toHaveBeenCalledWith(
        jasmine.objectContaining({ variables: { query: 'garcia' } })
      );

      jasmine.clock().uninstall();
    }));

    it('distinctUntilChanged — same query value does not re-fire', fakeAsync(() => {
      jasmine.clock().install();

      component.searchCtrl.setValue('reyes');
      tick(350);
      apollo.query.calls.reset();

      // Set same value again
      component.searchCtrl.setValue('reyes');
      tick(350);

      expect(apollo.query).not.toHaveBeenCalled();
      jasmine.clock().uninstall();
    }));

    it('min 2 chars — query not fired when 1 char entered', fakeAsync(() => {
      jasmine.clock().install();

      component.searchCtrl.setValue('a');
      tick(350);

      expect(apollo.query).not.toHaveBeenCalled();
      jasmine.clock().uninstall();
    }));
  });

  describe('loading and error states', () => {
    it('loading state set while query in flight', fakeAsync(() => {
      jasmine.clock().install();

      apollo.query.and.callFake(() => new Promise(resolve => setTimeout(resolve, 200)).then(() => of({ data: { searchPatients: [] } })));

      component.searchCtrl.setValue('santos');
      tick(100); // before query resolves

      expect(component.loading).toBe(true);

      tick(300); // let promise + debounce settle
      jasmine.clock().uninstall();
    }));

    it('error state set on GraphQL failure', fakeAsync(() => {
      jasmine.clock().install();

      apollo.query.and.returnValue(throwError(() => new Error('Network error')));
      component.searchCtrl.setValue('delos');
      tick(350);

      expect(component.error).toContain('Network error');
      jasmine.clock().uninstall();
    }));

    it('results populated on successful response', fakeAsync(() => {
      jasmine.clock().install();

      const patients = [
        { id: 'p1', federatedIdentity: 'fid1', firstName: 'Juan', lastName: 'Reyes', dateOfBirth: '1990-01-01', sex: 'M', contactPhone: '09171234567' },
      ];
      apollo.query.and.returnValue(of({ data: { searchPatients: patients } }));

      component.searchCtrl.setValue('reyes');
      tick(350);

      expect(component.results).toEqual(patients);
      jasmine.clock().uninstall();
    }));

    it('no results empty state shown when 0 results', fakeAsync(() => {
      jasmine.clock().install();

      apollo.query.and.returnValue(of({ data: { searchPatients: [] } }));
      component.searchCtrl.setValue('nonexistent');
      tick(350);

      expect(component.results.length).toBe(0);
      jasmine.clock().uninstall();
    }));
  });

  describe('navigation', () => {
    it('openRecord navigates to /clinical/patients/{id}', fakeAsync(() => {
      jasmine.clock().install();
      const router = TestBed.inject(RRouter);
      spyOn(router, 'navigate').and.callThrough();

      const patient = { id: 'p99', federatedIdentity: 'fid', firstName: 'Ana', lastName: 'Garcia', dateOfBirth: '1985-05-05', sex: 'F', contactPhone: '09181112222' };

      component.openRecord(patient);
      tick(350);

      expect(router.navigate).toHaveBeenCalledWith(['/clinical/patients', 'p99']);
      jasmine.clock().uninstall();
    }));
  });

  describe('input clearing', () => {
    it('results cleared when input cleared', fakeAsync(() => {
      jasmine.clock().install();

      apollo.query.and.returnValue(of({ data: { searchPatients: [{ id: '1' }] } }));
      component.searchCtrl.setValue('reyes');
      tick(350);
      expect(component.results.length).toBe(1);

      component.searchCtrl.setValue('');
      tick(350);

      expect(component.results.length).toBe(0);
      jasmine.clock().uninstall();
    }));
  });
});

// Suppress TS "not a web module" for apollo-angular in test context
import { Router as RRouter } from '@angular/router';
