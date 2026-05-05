import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface FinanceBatch {
  id: string;
  batchReference: string;
  type: 'tax_collection' | 'permit_fee' | 'service_charge';
  totalAmount: number;
  recordCount: number;
  status: 'draft' | 'submitted' | 'posted' | 'reversed';
  createdAt: string;
  postedAt: string | null;
}

interface FinanceState {
  batches: FinanceBatch[];
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = { batches: [], loading: false, error: null };

export const fetchBatches = createAsyncThunk(
  'finance/fetchBatches',
  async () => { const { data } = await axios.get('/api/finance/batches'); return data; }
);

export const postBatch = createAsyncThunk(
  'finance/postBatch',
  async (id: string) => {
    const { data } = await axios.post(`/api/finance/batches/${id}/post`);
    return data as FinanceBatch;
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBatches.pending, state => { state.loading = true; })
      .addCase(fetchBatches.fulfilled, (state, { payload }) => { state.loading = false; state.batches = payload; })
      .addCase(fetchBatches.rejected, (state, { error }) => { state.loading = false; state.error = error.message ?? 'Failed'; })
      .addCase(postBatch.fulfilled, (state, { payload }) => {
        const idx = state.batches.findIndex(b => b.id === payload.id);
        if (idx !== -1) state.batches[idx] = payload;
      });
  },
});

export default financeSlice.reducer;
