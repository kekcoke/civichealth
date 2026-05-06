import serviceRequestReducer, {
  fetchServiceRequests,
  assignRequest,
} from './serviceRequestSlice';
import type { ServiceRequestState } from './serviceRequestSlice';

describe('serviceRequestSlice', () => {
  const initialState: ServiceRequestState = { items: [], loading: false, error: null };

  describe('fetchServiceRequests extraReducers', () => {
    it('pending — loading=true', () => {
      const next = serviceRequestReducer(initialState, { type: fetchServiceRequests.pending.type });
      expect(next.loading).toBe(true);
    });

    it('fulfilled — items populated, loading=false', () => {
      const items = [{ id: 'r1', ticketNumber: 'SR-001', category: 'Road Damage', description: 'Pothole on main road', reporterName: 'Juan', address: '123 Main St', lat: 14.5995, lng: 120.9842, status: 'open' as const, assignedTo: null, createdAt: '2026-01-01' }];
      const next = serviceRequestReducer(initialState, { type: fetchServiceRequests.fulfilled.type, payload: items });
      expect(next.loading).toBe(false);
      expect(next.items).toEqual(items);
    });

    it('rejected — error set, loading=false', () => {
      const next = serviceRequestReducer(initialState, { type: fetchServiceRequests.rejected.type, error: { message: 'Failed' } as any });
      expect(next.error).toBe('Failed');
      expect(next.loading).toBe(false);
    });
  });

  describe('assignRequest.fulfilled', () => {
    it('updates matching item in state.items', () => {
      const existing: ServiceRequestState = {
        items: [{ id: 'r1', ticketNumber: 'SR-001', category: 'Road Damage', description: 'desc', reporterName: 'Juan', address: 'addr', lat: 0, lng: 0, status: 'open' as const, assignedTo: null, createdAt: '' }],
        loading: false, error: null,
      };
      const assigned = { id: 'r1', ticketNumber: 'SR-001', category: 'Road Damage', description: 'desc', reporterName: 'Juan', address: 'addr', lat: 0, lng: 0, status: 'assigned' as const, assignedTo: 'Agent A', createdAt: '' };
      const next = serviceRequestReducer(existing, { type: assignRequest.fulfilled.type, payload: assigned });
      expect(next.items[0].status).toBe('assigned');
      expect(next.items[0].assignedTo).toBe('Agent A');
    });
  });
});
