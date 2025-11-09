// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  name: string;
  email: string;
  id: string;
  drivingLicence?: string;
  profile?: string;
}

interface FavCar {
  _id: string;
  brand: string;
  modelName: string;
  year: number;
  color: string;
  price: number;
  passengers: number;
  doors: number;
  airCondition: boolean;
  maxPower: number;
  mph: number;
  topSpeed: number;
  available: boolean;
  tax: number;
  weeklyRate: number;
  pricePerDay: number;
  initialMileage: number;
  allowedMilleage: number;
  fuelType: string;
  transmission: string;
  description: string;
  images: string;
  brandImage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserState {
  isLoggedIn: boolean;
  isLoading: boolean;
  favouriteCars: FavCar[];
  token: string | null;
  isGuest: boolean;
  userData: UserData | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  isLoading: false,
  token: null,
  favouriteCars: [],
  isGuest: false,
  userData: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
    },

    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },

    clearToken(state) {
      state.token = null;
    },

    setDrivingLicense(
      state,
      action: PayloadAction<{ drivingLicence: string }>,
    ) {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          drivingLicence: action.payload.drivingLicence,
        };
      }
    },
    continueAsGuest(state) {
      state.userData = null;
      state.isGuest = true;
    },

    clearUserData(state) {
      state.userData = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.token = null;
      state.isGuest = false;
    },

    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    clearGuest(state){
      state.isGuest = false
      state.userData = null
    },
    removeFavCar(state, action: PayloadAction<string>) {
      state.favouriteCars = state.favouriteCars.filter(
        item => item._id !== action.payload,
      );
    },

    clearFavouriteCars(state) {
      state.favouriteCars = [];
    },

    addFavCar(state, action: PayloadAction<FavCar>) {
      const car = action.payload;
      if (!state.favouriteCars) state.favouriteCars = []; // ensure array
      const existCar = state.favouriteCars.find(item => item._id === car._id);
      if (!existCar) {
        state.favouriteCars.push(car);
      }
    },
  },
});

export const {
  setLoading,
  setUserData,
  setDrivingLicense,
  clearUserData,
  setLoggedIn,
  addFavCar,
  removeFavCar,
  clearFavouriteCars,
  setToken,
  clearToken,
  continueAsGuest,
  clearGuest
} = userSlice.actions;

export default userSlice.reducer;
