import { useMemo } from 'react';

/** Roles that may exist in the JWT `realm_access.roles` or `resource_access` claim. */
export type CivicRole = 'civic_employee' | 'super_admin' | 'clinician' | 'citizen';

interface AuthState {
  authorized: boolean;
  role: CivicRole | null;
  token: string | null;
}

/**
 * Reads the Keycloak OIDC access token from sessionStorage (key: `kc_token`),
 * decodes the payload, and checks whether the user holds at least one of the
 * `allowedRoles`.
 *
 * Integration note: the portal-shell is responsible for writing `kc_token`
 * to sessionStorage after a successful Keycloak login redirect.
 */
export function useAuthGuard(allowedRoles: CivicRole[]): AuthState {
  return useMemo<AuthState>(() => {
    const raw = sessionStorage.getItem('kc_token');
    if (!raw) return { authorized: false, role: null, token: null };

    try {
      // JWT is base64url-encoded; decode the payload segment (index 1)
      const payload = JSON.parse(atob(raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

      // Keycloak puts roles in realm_access.roles
      const roles: string[] = payload?.realm_access?.roles ?? [];
      const matchedRole = (allowedRoles as string[]).find(r => roles.includes(r)) as CivicRole | undefined;

      return {
        authorized: Boolean(matchedRole),
        role: matchedRole ?? (roles[0] as CivicRole) ?? null,
        token: raw,
      };
    } catch {
      return { authorized: false, role: null, token: raw };
    }
  }, [allowedRoles.join(',')]);
}
