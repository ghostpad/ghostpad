import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export enum SocketState {
    LOADING = "LOADING",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED",
    READY_TO_CONNECT = "READY_TO_CONNECT",
}

export type ConnectionState = {
    socketState: SocketState;
}

export const connectionSlice = createSlice({
  name: "connection",
  initialState: {
    socketState: SocketState.LOADING
  },
  reducers: {
    updateSocketState: (_, action: PayloadAction<ConnectionState>) => action.payload,
  },
});

export const { updateSocketState } = connectionSlice.actions;
export default connectionSlice.reducer;
