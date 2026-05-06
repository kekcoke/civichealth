import { TestBed } from '@angular/core/testing';
import { EncountersComponent } from './encounters.component';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

class MockApollo {
  watchQuery = jasmine.createSpy('watchQuery').and.returnValue({ valueChanges: of({ data: { listEncounters: [] } }) });
  mutate = jasmine.createSpy('mutate').and.returnValue(of({ data: { createEncounter: { encounter: {}, errors: [] } } }));
}

describe('EncountersComponent', () => {
  let component: EncountersComponent;
  let apollo: MockApollo;

  beforeEach(async () => {
    apollo = new MockApollo();
    await TestBed.configureTestingModule({
      declarations: [EncountersComponent],
      providers: [{ provide: Apollo, useValue: apollo }],
    }).compileComponents();

    component = TestBed.createComponent(EncountersComponent).componentInstance;
  });

  describe('listEncounters', () => {
    it('returns Observable from Apollo watchQuery', (done) => {
      const encounters = [{ id: 'e1', encounterDate: '2026-01-01', encounterType: 'routine', chiefComplaint: 'checkup', status: 'open' }];
      apollo.watchQuery.and.returnValue({ valueChanges: of({ data: { listEncounters: encounters } }) });

      component.listEncounters('p1').subscribe(result => {
        expect(result).toEqual(encounters);
        expect(apollo.watchQuery).toHaveBeenCalledWith({
          query: jasmine.any(Object),
          variables: { patientId: 'p1' },
        });
        done();
      });
    });
  });

  describe('createEncounter', () => {
    it('returns Observable from Apollo mutate', (done) => {
      const vars = { patientId: 'p1', providerId: 'prov1', encounterDate: '2026-01-01', encounterType: 'routine', chiefComplaint: 'fever' };
      const result = { encounter: { id: 'e1' }, errors: [] };

      apollo.mutate.and.returnValue(of({ data: { createEncounter: result } }));

      component.createEncounter(vars).subscribe(r => {
        expect(r).toEqual(result);
        expect(apollo.mutate).toHaveBeenCalledWith({ mutation: jasmine.any(Object), variables: vars });
        done();
      });
    });
  });
});
