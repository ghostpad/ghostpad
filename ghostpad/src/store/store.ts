import { configureStore } from '@reduxjs/toolkit';
import configReducer from './configSlice';
import uiReducer from './uiSlice';
import connectionSliceReducer from './connectionSlice';
import worldInfoSliceReducer from './worldInfoSlice';
import { koboldConfigMiddleware } from './koboldConfigMiddleware';

export const store = configureStore({
  reducer: {
    config: configReducer,
    connection: connectionSliceReducer,
    worldInfo: worldInfoSliceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(koboldConfigMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;