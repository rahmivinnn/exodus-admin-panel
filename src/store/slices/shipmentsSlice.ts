import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Shipment } from '../../types';

interface ShipmentsState {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [],
  selectedShipment: null,
  loading: false,
  error: null,
};

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    fetchShipmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchShipmentsSuccess: (state, action: PayloadAction<Shipment[]>) => {
      state.loading = false;
      state.shipments = action.payload;
    },
    fetchShipmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectShipment: (state, action: PayloadAction<Shipment>) => {
      state.selectedShipment = action.payload;
    },
    createShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createShipmentSuccess: (state, action: PayloadAction<Shipment>) => {
      state.loading = false;
      state.shipments.push(action.payload);
    },
    createShipmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateShipmentSuccess: (state, action: PayloadAction<Shipment>) => {
      state.loading = false;
      const index = state.shipments.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
    },
    updateShipmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteShipmentSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.shipments = state.shipments.filter(s => s.id !== action.payload);
    },
    deleteShipmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchShipmentsStart,
  fetchShipmentsSuccess,
  fetchShipmentsFailure,
  selectShipment,
  createShipmentStart,
  createShipmentSuccess,
  createShipmentFailure,
  updateShipmentStart,
  updateShipmentSuccess,
  updateShipmentFailure,
  deleteShipmentStart,
  deleteShipmentSuccess,
  deleteShipmentFailure,
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer; 