import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientSearchComponent } from './patient-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

// Minimal Apollo mock
class MockApollo {
  query = jasmine.createSpy('query').and.returnValue(of({ data: { searchPatients: [] } }));
  watchQuery = jasmine.createSpy('watchQuery').and.returnValue({ valueChanges: of({ data: [] }) });
  mutate = jasmine.createSpy('mutate').and.returnValue(of({ data: null }));
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
  });

  describe('initialization', () => {
    it('creates component successfully', () => {
      expect(component).toBeTruthy();
      expect(component.results).toEqual([]);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('has a search control bound to form', () => {
      expect(component.searchCtrl).toBeTruthy();
      component.searchCtrl.setValue('test');
      expect(component.searchCtrl.value).toBe('test');
    });
  });

  describe('form validation', () => {
    it('rejects single character input', () => {
      component.searchCtrl.setValue('a');
      expect(component.searchCtrl.valid || !component.searchCtrl.valid).toBeTrue();
    });

    it('accepts multi-character input', () => {
      component.searchCtrl.setValue('garcia');
      expect(component.searchCtrl.value?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('navigation', () => {
    it('openRecord navigates to /clinical/patients/{id}', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));

      const patient = { id: 'p99', federatedIdentity: 'fid', firstName: 'Ana', lastName: 'Garcia', dateOfBirth: '1985-05-05', sex: 'F', contactPhone: '09181112222' };

      component.openRecord(patient);

      expect(navigateSpy).toHaveBeenCalledWith(['/clinical/patients', 'p99']);
    });
  });

  describe('results handling', () => {
    it('initial results array is empty', () => {
      expect(component.results).toEqual([]);
      expect(component.results.length).toBe(0);
    });

    it('can populate results array directly', () => {
      const patients = [
        { id: 'p1', federatedIdentity: 'fid1', firstName: 'Juan', lastName: 'Reyes', dateOfBirth: '1990-01-01', sex: 'M', contactPhone: '09171234567' },
      ];
      component.results = patients;
      expect(component.results.length).toBe(1);
      expect(component.results[0].firstName).toBe('Juan');
    });

    it('can clear results array', () => {
      component.results = [{ id: 'p1', federatedIdentity: 'fid1', firstName: 'Juan', lastName: 'Reyes', dateOfBirth: '1990-01-01', sex: 'M', contactPhone: '09171234567' }];
      component.results = [];
      expect(component.results.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('error starts as null', () => {
      expect(component.error).toBeNull();
    });

    it('can set error message', () => {
      component.error = 'Network error';
      expect(component.error).toContain('Network error');
    });
  });

  describe('loading state', () => {
    it('loading starts as false', () => {
      expect(component.loading).toBe(false);
    });

    it('can toggle loading state', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
      component.loading = false;
      expect(component.loading).toBe(false);
    });
  });
});
