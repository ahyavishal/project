// frontend/store/index.ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

interface PriceState {
    symbol: string;
    prices: Array<{ price: number; timestamp: string }>;
}

const initialState: PriceState = {
    symbol: 'bitcoin',
    prices: [],
};

const priceSlice = createSlice({
    name: 'price',
    initialState,
    reducers: {
        setSymbol: (state, action: PayloadAction<string>) => {
            state.symbol = action.payload;
        },
        setPrices: (state, action: PayloadAction<Array<{ price: number; timestamp: string }>>) => {
            state.prices = action.payload;
        },
        addPrice: (state, action: PayloadAction<{ price: number; timestamp: string }>) => {
            state.prices = [action.payload, ...state.prices].slice(0, 20);
        },
    },
});

export const { setSymbol, setPrices, addPrice } = priceSlice.actions;

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['symbol', 'prices'],
};

const persistedReducer = persistReducer(persistConfig, priceSlice.reducer);

const makeStore = () => configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export const store = makeStore();
export const persistor = persistStore(store);

export const wrapper = createWrapper(() => store);

export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export type AppDispatch = ReturnType<typeof makeStore>['dispatch'];
export const useDispatch = () => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
