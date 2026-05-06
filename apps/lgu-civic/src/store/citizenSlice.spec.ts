import citizenReducer, {
  selectCitizen,
  clearSelected,
  setPage,
  fetchCitizens,
} from './citizenSlice';
import type { CitizenState } from './citizenSlice';

describe('citizenSlice reducers', () => {
  const initialState: CitizenState = {
    items: [], selected: null, loading: false, error: null, total: 0, page: 1,
  };

  it('selectCitizen sets state.selected', () => {
    const citizen = { id: 'c1', fullName: 'Juan Garcia', email: 'juan@example.com', phone: '09171234567', address: '123 Main St', barangay: 'Barangay 1', status: 'active' as const };
    const state = citizenReducer(initialState, selectCitizen(citizen));
    expect(state.selected).toEqual(citizen);
  });

  it('clearSelected sets state.selected to null', () => {
    const stateWithSelected: CitizenState = { ...initialState, selected: { id: 'c1', fullName: 'Juan', email: '', phone: '', address: '', barangay: '', status: 'active' } };
    const state = citizenReducer(stateWithSelected, clearSelected());
    expect(state.selected).toBeNull();
  });

  it('setPage sets state.page', () => {
    const state = citizenReducer(initialState, setPage(5));
    expect(state.page).toBe(5);
  });
});

describe('fetchCitizens extraReducers', () => {
  it('pending — loading=true, error=null', () => {
    const state: CitizenState = { items: [], selected: null, loading: false, error: 'old error', total: 0, page: 1 };
    const next = citizenReducer(state, { type: fetchCitizens.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('fulfilled — loading=false, items and total populated', () => {
    const state: CitizenState = { items: [], selected: null, loading: true, error: null, total: 0, page: 1 };
    const payload = { data: [{ id: 'c1' }], total: 50 };
    const next = citizenReducer(state, { type: fetchCitizens.fulfilled.type, payload });
    expect(next.loading).toBe(false);
    expect(next.items).toEqual(payload.data);
    expect(next.total).toBe(50);
  });

  it('rejected — loading=false, error set', () => {
    const state: CitizenState = { items: [], selected: null, loading: true, error: null, total: 0, page: 1 };
    const next = citizenReducer(state, { type: fetchCitizens.rejected.type, error: { message: 'Network error' } as any });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Network error');
  });
});
