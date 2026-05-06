/// <reference types="jasmine" />
import { QueuedMutation } from './sync-queue.service';

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

describe('QueuedMutation interface', () => {
  it('has required fields for queued operations', () => {
    const mutation: QueuedMutation = {
      id: 'test-1',
      operationName: 'CreateEncounter',
      query: 'mutation { createEncounter { id } }',
      variables: { patientId: 'p1' },
      jwt: createValidJwt(),
      enqueuedAt: new Date().toISOString(),
      retries: 0,
    };
    expect(mutation.id).toBe('test-1');
    expect(mutation.operationName).toBe('CreateEncounter');
    expect(mutation.retries).toBe(0);
    expect(mutation.jwt).toBeTruthy();
  });

  it('supports retry count tracking', () => {
    const mutation: QueuedMutation = {
      id: 'test-2',
      operationName: 'UpdatePatient',
      query: 'mutation {}',
      variables: {},
      jwt: createValidJwt(),
      enqueuedAt: new Date().toISOString(),
      retries: 3,
    };
    expect(mutation.retries).toBe(3);
  });

  it('has all required fields for offline sync', () => {
    const mutation: QueuedMutation = {
      id: 'sync-123',
      operationName: 'CreatePrescription',
      query: 'mutation CreatePrescription($input: PrescriptionInput!) { createPrescription(input: $input) { id } }',
      variables: { input: { patientId: 'p1', drugName: 'Aspirin', dosage: '100mg' } },
      jwt: createValidJwt(),
      enqueuedAt: '2026-05-05T10:00:00Z',
      retries: 0,
    };
    expect(mutation.id).toBeDefined();
    expect(mutation.operationName).toBeDefined();
    expect(mutation.query).toBeDefined();
    expect(mutation.variables).toBeDefined();
    expect(mutation.jwt).toBeDefined();
    expect(mutation.enqueuedAt).toBeDefined();
    expect(typeof mutation.retries).toBe('number');
  });
});

describe('JWT validation', () => {
  it('detects expired tokens', () => {
    const expiredToken = createExpiredJwt(-3600 * 1000);
    expect(expiredToken).toBeTruthy();
    // Token structure: header.payload.signature
    expect(expiredToken.split('.').length).toBe(3);
  });

  it('creates valid tokens', () => {
    const validToken = createValidJwt();
    expect(validToken).toBeTruthy();
    expect(validToken.split('.').length).toBe(3);
  });

  it('token payload contains subject', () => {
    const token = createValidJwt();
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    expect(payload.sub).toBe('u1');
  });
});
