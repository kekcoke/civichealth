import { TestBed } from '@angular/core/testing';
import { OfflineService } from './offline.service';
import { first } from 'rxjs/operators';

describe('OfflineService', () => {
  let service: OfflineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineService);
  });

  afterEach(() => service.ngOnDestroy());

  it('isOnline() returns synchronous navigator.onLine snapshot', () => {
    const expected = navigator.onLine;
    expect(service.isOnline()).toBe(expected);
  });

  it('changes$ emits true on window online event', (done) => {
    service.changes$.pipe(first(v => v === true)).subscribe(value => {
      expect(value).toBe(true);
      done();
    });

    window.dispatchEvent(new Event('online'));
  });

  it('changes$ emits false on window offline event', (done) => {
    service.changes$.pipe(first(v => v === false)).subscribe(value => {
      expect(value).toBe(false);
      done();
    });

    window.dispatchEvent(new Event('offline'));
  });

  it('isOnline$ same observable — emits on connectivity transitions', (done) => {
    const emission: boolean[] = [];
    service.isOnline$.subscribe(value => {
      emission.push(value);
      if (emission.length >= 2) {
        // first emission is current state; second is after event
        expect(emission[0]).toBe(navigator.onLine);
        done();
      }
    });
  });
});
