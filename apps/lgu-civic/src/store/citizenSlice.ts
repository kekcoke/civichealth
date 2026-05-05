import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Citizen {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  status: 'active' | 'inactive';
}

interface CitizenState {
  items: Citizen[];
  selected: Citizen | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
}

const initialState: CitizenState = {
  items: [], selected: null, loading: false, error: null, total: 0, page: 1,
};

export const fetchCitizens = createAsyncThunk(
  'citizens/fetchAll',
  async ({ page, search }: { page: number; search?: string }) => {
    const { data } = await axios.get('/api/citizens', { params: { page, search } });
    return data;
  }
);

const citizenSlice = createSlice({
  name: 'citizens',
  initialState,
  reducers: {
    selectCitizen(state, action: PayloadAction<Citizen>) { state.selected = action.payload; },
    clearSelected(state) { state.selected = null; },
    setPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCitizens.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchCitizens.fulfilled, (state, { payload }) => {
        state.loading = false; state.items = payload.data; state.total = payload.total;
      })
      .addCase(fetchCitizens.rejected, (state, { error }) => {
        state.loading = false; state.error = error.message ?? 'Failed to load citizens';
      });
  },
});

export const { selectCitizen, clearSelected, setPage } = citizenSlice.actions;
export default citizenSlice.reducer;
