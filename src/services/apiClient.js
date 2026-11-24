import axios from 'axios';
import { PRODUCT_API_BASE } from '../utils/constants';

/**
 * Single configured Axios instance for the whole app.
 * Components never call axios directly — they go through `src/services/productsApi.js`.
 */
export const apiClient = axios.create({
  baseURL: PRODUCT_API_BASE,
  timeout: 12000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // A cancelled request (AbortController) is control flow, not a failure:
    // pass it through untouched so callers can tell it apart from a real outage.
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error?.response?.status ?? null;
    const isNetwork = !error?.response;
    const message = isNetwork
      ? 'Network unavailable — showing curated pieces.'
      : error?.response?.data?.message || `Request failed with status ${status}`;

    // Normalised, predictable error shape for the whole app.
    return Promise.reject(
      Object.assign(new Error(message), {
        status,
        isNetwork,
        isTimeout: error?.code === 'ECONNABORTED',
      }),
    );
  },
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Worth retrying: the request never got an answer, or the server hiccuped. */
const isTransient = (error) => error?.isNetwork || error?.isTimeout || (error?.status >= 500 && error?.status < 600);

/**
 * Small helper so the service layer reads declaratively.
 * GETs are idempotent, so one transient failure is retried once after a short pause.
 */
export const get = async (url, config, { retries = 1, retryDelay = 350 } = {}) => {
  try {
    const { data } = await apiClient.get(url, config);
    return data;
  } catch (error) {
    if (retries > 0 && isTransient(error) && !config?.signal?.aborted) {
      await wait(retryDelay);
      return get(url, config, { retries: retries - 1, retryDelay: retryDelay * 2 });
    }
    throw error;
  }
};
