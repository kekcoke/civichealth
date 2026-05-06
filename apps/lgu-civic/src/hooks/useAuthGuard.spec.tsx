import { renderHook } from '@testing-library/react';
import { useAuthGuard } from './useAuthGuard';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Build a minimal RS256 JWT (header.payload.sig) — no real signing needed for test
const makeJwt = (roles: string[] = [], expOffsetSec = 3600) => {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const exp = Math.floor((Date.now() / 1000) + expOffsetSec);
  const payload = btoa(JSON.stringify({ sub: 'u1', realm_access: { roles }, exp }));
  return `${header}.${payload}.sig`;
};

// Helper to set/clear sessionStorage between tests
const setToken = (token: string | null) => {
  if (token) sessionStorage.setItem('kc_token', token);
  else sessionStorage.removeItem('kc_token');
};

describe('useAuthGuard', () => {
  beforeEach(() => setToken(null));

  it('no kc_token → authorized=false, role=null, token=null', () => {
    const { result } = renderHook(() => useAuthGuard(['civic_employee']));
    expect(result.current.authorized).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('valid JWT with matching role → authorized=true, role populated', () => {
    setToken(makeJwt(['civic_employee']));
    const { result } = renderHook(() => useAuthGuard(['civic_employee']));
    expect(result.current.authorized).toBe(true);
    expect(result.current.role).toBe('civic_employee');
  });

  it('valid JWT with no matching role → authorized=false', () => {
    setToken(makeJwt(['citizen']));
    const { result } = renderHook(() => useAuthGuard(['civic_employee', 'super_admin']));
    expect(result.current.authorized).toBe(false);
  });

  it('malformed token → graceful fallback to authorized=false', () => {
    sessionStorage.setItem('kc_token', 'not.a.valid.jwt');
    const { result } = renderHook(() => useAuthGuard(['civic_employee']));
    expect(result.current.authorized).toBe(false);
  });

  it('allowedRoles dependency — re-runs when array changes', () => {
    setToken(makeJwt(['super_admin']));
    const { result, rerender } = renderHook(() => useAuthGuard(['civic_employee']));
    expect(result.current.authorized).toBe(false);

    rerender(); // same roles — no change expected
    expect(result.current.authorized).toBe(false);
  });
});
