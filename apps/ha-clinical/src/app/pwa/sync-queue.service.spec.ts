import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SyncQueueService, QueuedMutation } from './sync-queue.service';
import { OfflineService } from './offline.service';

const FAKE_ENV = { haBffUrl: 'https://ha-proxy.internal/api/ha/v1/graphql' };

// Spy helper — module-level so spies persist across tests
let idbSetSpy: jasmine.Spy;
let idbDelSpy: jasmine.Spy;
let idbKeysSpy: jasmine.Spy;
let idbGetSpy: jasmine.Spy;

const createExpiredJwt = (expOffsetMs = -3600 * 1000) => {
  const exp = Math.floor((Date.now() + expOffsetMs) / 1000);
  const payload = btoa(JSON.stringify({ sub: 'u1', exp }));
  return `header.${payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.sig`;
};

const createValidJwt = () => {
  const exp = Math.floor((Date.now() + 3600 * 1000) / 1000);
  const payload = btoa(JSON.stringify({ sub: 'u1', exp }));
  return `header.${payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.sig`;
};

describe('SyncQueueService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Mock idb-keyval functions at import level via window hack
    idbSetSpy = jasmine.createSpy('idb-set').and.returnValue(Promise.resolve());
    idbDelSpy = jasmine.createSpy('idb-del').and.returnValue(Promise.resolve());
    idbKeysSpy = jasmine.createSpy('idb-keys').and.returnValue(Promise.resolve([]));
    idbGetSpy = jasmine.createSpy('idb-get').and.returnValue(Promise.resolve(undefined));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SyncQueueService,
        OfflineService,
        { provide: 'idb-keyval', useValue: { set: idbSetSpy, del: idbDelSpy, keys: idbKeysSpy, get: idbGetSpy } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('enqueue', () => {
    it('writes entry with id, enqueuedAt, retries=0 to IDB', async () => {
      const service = TestBed.inject(SyncQueueService);
      const id = await service.enqueue({
        operationName: 'CreateEncounter', query: 'mutation{}', variables: {}, jwt: createValidJwt(),
      });

      expect(id).toMatch(/^ha_sync_queue_/);
      expect(idbSetSpy).toHaveBeenCalled();
      const entry: QueuedMutation = idbSetSpy.calls.mostRecent().args[1];
      expect(entry.id).toBe(id);
      expect(entry.retries).toBe(0);
      expect(entry.enqueuedAt).toBeTruthy();
    });
  });

  describe('getQueue', () => {
    it('returns entries sorted FIFO by enqueuedAt', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve(['ha_sync_queue_a', 'ha_sync_queue_b']));
      idbGetSpy.and.callFake((key: string) => {
        const older = { id: 'ha_sync_queue_a', operationName: 'op', query: '', variables: {}, jwt: '', enqueuedAt: '2026-01-01T00:00:00Z', retries: 0 };
        const newer = { id: 'ha_sync_queue_b', operationName: 'op', query: '', variables: {}, jwt: '', enqueuedAt: '2026-01-02T00:00:00Z', retries: 0 };
        return Promise.resolve(key === 'ha_sync_queue_a' ? older : newer);
      });

      const service = TestBed.inject(SyncQueueService);
      const queue = await service.getQueue();

      expect(queue[0].id).toBe('ha_sync_queue_a');
      expect(queue[1].id).toBe('ha_sync_queue_b');
    });
  });

  describe('queueSize', () => {
    it('returns count of queued entries', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve(['ha_sync_queue_1', 'ha_sync_queue_2', 'ha_sync_queue_3']));
      const service = TestBed.inject(SyncQueueService);
      expect(await service.queueSize()).toBe(3);
    });
  });

  describe('flush', () => {
    it('skips when offline', async () => {
      const offlineStub = { isOnline: () => false, changes$: { subscribe: () => {} } };
      const svc = new SyncQueueService(TestBed.inject(HttpClientTestingModule as any), offlineStub as any);

      await svc.flush();
      expect(idbGetSpy).not.toHaveBeenCalled();
    });

    it('deletes entry on HTTP success', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve(['ha_sync_queue_x']));
      idbGetSpy.and.returnValue(Promise.resolve({
        id: 'ha_sync_queue_x', operationName: 'op', query: 'mutation{}', variables: {},
        jwt: createValidJwt(), enqueuedAt: new Date().toISOString(), retries: 0,
      }));

      const service = TestBed.inject(SyncQueueService);
      await service.flush();

      httpMock.expectOne({ method: 'POST' }).flush({ data: {} });
      expect(idbDelSpy).toHaveBeenCalledWith('ha_sync_queue_x');
    });

    it('retries up to MAX_RETRIES then drops entry', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve(['ha_sync_queue_r']));
      idbGetSpy.and.returnValue(Promise.resolve({
        id: 'ha_sync_queue_r', operationName: 'op', query: 'mutation{}', variables: {},
        jwt: createValidJwt(), enqueuedAt: new Date().toISOString(), retries: 4,
      }));

      const service = TestBed.inject(SyncQueueService);
      await service.flush();

      httpMock.expectOne({ method: 'POST' }).error(new ErrorEvent('Error'));
      // After 5th retry (retries was 4), should drop
      expect(idbDelSpy).toHaveBeenCalledWith('ha_sync_queue_r');
    });

    it('drops stale JWT without HTTP call', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve(['ha_sync_queue_expired']));
      idbGetSpy.and.returnValue(Promise.resolve({
        id: 'ha_sync_queue_expired', operationName: 'op', query: 'mutation{}', variables: {},
        jwt: createExpiredJwt(), enqueuedAt: new Date().toISOString(), retries: 0,
      }));

      const service = TestBed.inject(SyncQueueService);
      await service.flush();

      httpMock.expectNone({ method: 'POST' });
      expect(idbDelSpy).toHaveBeenCalledWith('ha_sync_queue_expired');
    });

    it('flushNow delegates to flush', async () => {
      idbKeysSpy.and.returnValue(Promise.resolve([]));
      const service = TestBed.inject(SyncQueueService);
      await service.flushNow();
      // If it completes without error, delegation worked
      expect(idbKeysSpy).toHaveBeenCalled();
    });
  });
});
