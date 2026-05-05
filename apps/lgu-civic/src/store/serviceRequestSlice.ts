import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  category: string;
  description: string;
  reporterName: string;
  address: string;
  lat: number;
  lng: number;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: string | null;
  createdAt: string;
}

interface ServiceRequestState {
  items: ServiceRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: ServiceRequestState = { items: [], loading: false, error: null };

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchAll',
  async () => { const { data } = await axios.get('/api/service-requests'); return data; }
);

export const assignRequest = createAsyncThunk(
  'serviceRequests/assign',
  async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
    const { data } = await axios.patch(`/api/service-requests/${id}/assign`, { assignedTo });
    return data as ServiceRequest;
  }
);

const serviceRequestSlice = createSlice({
  name: 'serviceRequests',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchServiceRequests.pending, state => { state.loading = true; })
      .addCase(fetchServiceRequests.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchServiceRequests.rejected, (state, { error }) => { state.loading = false; state.error = error.message ?? 'Failed'; })
      .addCase(assignRequest.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(r => r.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      });
  },
});

export default serviceRequestSlice.reducer;
