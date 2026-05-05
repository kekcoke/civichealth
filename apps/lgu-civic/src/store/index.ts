import { configureStore } from '@reduxjs/toolkit';
import citizenReducer from './citizenSlice';
import permitReducer from './permitSlice';
import serviceRequestReducer from './serviceRequestSlice';
import financeReducer from './financeSlice';

export const store = configureStore({
  reducer: {
    citizens: citizenReducer,
    permits: permitReducer,
    serviceRequests: serviceRequestReducer,
    finance: financeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
