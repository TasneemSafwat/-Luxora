import { createSlice, nanoid } from '@reduxjs/toolkit';

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

/** Demo order history so the account dashboard is populated on first visit. */
const SEED_ORDERS = [
  {
    id: 'ord-1001',
    number: 'LX-20481',
    createdAt: daysAgo(9),
    status: 'Delivered',
    items: [
      { id: 22, title: 'Cashmere Ribbed Knit', brand: 'LUXORA Atelier', price: 445, quantity: 1, color: 'Cream', size: 'M', thumbnail: null },
      { id: 8, title: '18k Gold Vermeil Chain', brand: 'Ferro & Co.', price: 260, quantity: 1, color: 'Gold', size: null, thumbnail: null },
    ],
    totals: { subtotal: 705, discount: 70.5, shipping: 0, tax: 50.76, total: 685.26 },
    shippingMethod: 'express',
    paymentMethod: 'card',
    shippingAddress: {
      fullName: 'Amelia Hart',
      line1: '42 Chelsea Manor Street',
      line2: 'Apartment 5',
      city: 'London',
      state: 'Greater London',
      postalCode: 'SW3 5RN',
      country: 'United Kingdom',
      phone: '+44 20 7946 0311',
    },
    timeline: [
      { label: 'Order placed', date: daysAgo(9), done: true },
      { label: 'Prepared in atelier', date: daysAgo(8), done: true },
      { label: 'Shipped', date: daysAgo(7), done: true },
      { label: 'Delivered', date: daysAgo(5), done: true },
    ],
  },
  {
    id: 'ord-1002',
    number: 'LX-20517',
    createdAt: daysAgo(4),
    status: 'In transit',
    items: [
      { id: 1, title: 'Silk Column Midi Dress', brand: 'LUXORA Atelier', price: 480, quantity: 1, color: 'Ivory', size: 'S', thumbnail: null },
      { id: 12, title: 'Leather Slingback Heel', brand: 'Marchetti', price: 520, quantity: 1, color: 'Cream', size: '39', thumbnail: null },
    ],
    totals: { subtotal: 1000, discount: 0, shipping: 0, tax: 80, total: 1080 },
    shippingMethod: 'standard',
    paymentMethod: 'wallet',
    shippingAddress: {
      fullName: 'Amelia Hart',
      line1: '42 Chelsea Manor Street',
      line2: 'Apartment 5',
      city: 'London',
      state: 'Greater London',
      postalCode: 'SW3 5RN',
      country: 'United Kingdom',
      phone: '+44 20 7946 0311',
    },
    timeline: [
      { label: 'Order placed', date: daysAgo(4), done: true },
      { label: 'Prepared in atelier', date: daysAgo(3), done: true },
      { label: 'Shipped', date: daysAgo(2), done: true },
      { label: 'Delivered', date: null, done: false },
    ],
  },
  {
    id: 'ord-1003',
    number: 'LX-20542',
    createdAt: daysAgo(1),
    status: 'Processing',
    items: [{ id: 26, title: 'Oud & Amber Eau de Parfum', brand: 'Maison Lune', price: 240, quantity: 2, color: 'Black', size: null, thumbnail: null }],
    totals: { subtotal: 480, discount: 48, shipping: 0, tax: 34.56, total: 466.56 },
    shippingMethod: 'atelier',
    paymentMethod: 'transfer',
    shippingAddress: {
      fullName: 'Amelia Hart',
      line1: '42 Chelsea Manor Street',
      line2: 'Apartment 5',
      city: 'London',
      state: 'Greater London',
      postalCode: 'SW3 5RN',
      country: 'United Kingdom',
      phone: '+44 20 7946 0311',
    },
    timeline: [
      { label: 'Order placed', date: daysAgo(1), done: true },
      { label: 'Prepared in atelier', date: null, done: false },
      { label: 'Shipped', date: null, done: false },
      { label: 'Delivered', date: null, done: false },
    ],
  },
];

const SEED_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home',
    fullName: 'Amelia Hart',
    line1: '42 Chelsea Manor Street',
    line2: 'Apartment 5',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW3 5RN',
    country: 'United Kingdom',
    phone: '+44 20 7946 0311',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Atelier',
    fullName: 'Amelia Hart',
    line1: '9 Via della Spiga',
    line2: '',
    city: 'Milan',
    state: 'Lombardy',
    postalCode: '20121',
    country: 'Italy',
    phone: '+39 02 7600 1122',
    isDefault: false,
  },
];

const initialState = {
  orders: SEED_ORDERS,
  addresses: SEED_ADDRESSES,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: {
      reducer(state, action) {
        state.orders.unshift(action.payload);
      },
      prepare(order) {
        const id = nanoid();
        const number = `LX-${20600 + Math.floor(Math.random() * 900)}`;
        return {
          payload: {
            id,
            number,
            createdAt: new Date().toISOString(),
            status: 'Processing',
            timeline: [
              { label: 'Order placed', date: new Date().toISOString(), done: true },
              { label: 'Prepared in atelier', date: null, done: false },
              { label: 'Shipped', date: null, done: false },
              { label: 'Delivered', date: null, done: false },
            ],
            ...order,
          },
        };
      },
    },
    addAddress: {
      reducer(state, action) {
        if (action.payload.isDefault) state.addresses.forEach((a) => (a.isDefault = false));
        state.addresses.push(action.payload);
      },
      prepare(address) {
        return { payload: { id: nanoid(), isDefault: false, ...address } };
      },
    },
    updateAddress(state, action) {
      const index = state.addresses.findIndex((item) => item.id === action.payload.id);
      if (index === -1) return;
      if (action.payload.isDefault) state.addresses.forEach((a) => (a.isDefault = false));
      state.addresses[index] = { ...state.addresses[index], ...action.payload };
    },
    removeAddress(state, action) {
      state.addresses = state.addresses.filter((item) => item.id !== action.payload);
    },
    setDefaultAddress(state, action) {
      state.addresses.forEach((item) => {
        item.isDefault = item.id === action.payload;
      });
    },
  },
});

export const { addOrder, addAddress, updateAddress, removeAddress, setDefaultAddress } = ordersSlice.actions;

export const selectOrders = (state) => state.orders.orders;
export const selectAddresses = (state) => state.orders.addresses;
export const selectOrderById = (id) => (state) => state.orders.orders.find((order) => order.id === id) ?? null;
export const selectDefaultAddress = (state) =>
  state.orders.addresses.find((address) => address.isDefault) ?? state.orders.addresses[0] ?? null;

export default ordersSlice.reducer;
