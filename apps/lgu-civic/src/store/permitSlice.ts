import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Permit {
  id: string;
  applicantName: string;
  permitType: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy: string | null;
}

interface PermitState {
  items: Permit[];
  loading: boolean;
  error: string | null;
  statusFilter: Permit['status'] | 'all';
}

const initialState: PermitState = {
  items: [], loading: false, error: null, statusFilter: 'all',
};

export const fetchPermits = createAsyncThunk(
  'permits/fetchAll',
  async (status?: Permit['status'] | 'all') => {
    const params = status && status !== 'all' ? { status } : {};
    const { data } = await axios.get('/api/permits', { params });
    return data;
  }
);

export const updatePermitStatus = createAsyncThunk(
  'permits/updateStatus',
  async ({ id, status }: { id: string; status: Permit['status'] }) => {
    const { data } = await axios.patch(`/api/permits/${id}`, { status });
    return data as Permit;
  }
);

const permitSlice = createSlice({
  name: 'permits',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<PermitState['statusFilter']>) {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPermits.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchPermits.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchPermits.rejected, (state, { error }) => { state.loading = false; state.error = error.message ?? 'Failed'; })
      .addCase(updatePermitStatus.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(p => p.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      });
  },
});

export const { setStatusFilter } = permitSlice.actions;
export default permitSlice.reducer;
