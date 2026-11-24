import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

/**
 * DEMO AUTHENTICATION ONLY.
 * Credentials are validated in-browser and a profile is persisted to
 * localStorage. This is intentionally NOT secure and must never be used
 * for a real application — it exists purely to demonstrate protected routes.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_ACCOUNT = {
  id: 'demo-1',
  firstName: 'Amelia',
  lastName: 'Hart',
  email: 'client@luxora.com',
  phone: '+1 (212) 555 0148',
  birthDate: '1991-04-18',
  avatar: null,
  memberSince: '2021-09-02T00:00:00.000Z',
  tier: 'Private client',
};

function titleCase(value = '') {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function profileFromEmail(email = '') {
  const [rawLocal] = String(email).split('@');
  const local = rawLocal.replace(/[^a-zA-Z]+/g, ' ').trim();
  const [first = 'LUXORA', second = 'Client'] = local.split(/\s+/);
  return { firstName: titleCase(first.toLowerCase()), lastName: titleCase(second.toLowerCase()) };
}

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  await delay(750);
  const isDemoAccount = String(email).trim().toLowerCase() === DEMO_ACCOUNT.email;

  if (isDemoAccount) {
    if (String(password).length < 8) return rejectWithValue('Those credentials do not match our records.');
    return DEMO_ACCOUNT;
  }

  if (String(password).length < 8) return rejectWithValue('Those credentials do not match our records.');

  const { firstName, lastName } = profileFromEmail(email);
  return {
    ...DEMO_ACCOUNT,
    id: `user-${btoa(String(email)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`,
    firstName,
    lastName,
    email: String(email).trim(),
    memberSince: new Date().toISOString(),
    tier: 'Member',
  };
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  await delay(900);
  if (!payload?.email) return rejectWithValue('Registration failed');
  return {
    id: `user-${Date.now().toString(36)}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone ?? '',
    birthDate: '',
    avatar: null,
    memberSince: new Date().toISOString(),
    tier: 'Member',
  };
});

const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    updateProfile(state, action) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to sign in';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to create your account';
      });
  },
});

export const { logout, updateProfile, clearAuthError } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export { DEMO_ACCOUNT };
export default authSlice.reducer;
