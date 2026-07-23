import { createApiKey, updateApiKey } from '@linode/api-v4';
import { vi } from 'vitest';

import {
  clearStoredPlaygroundKey,
  createPlaygroundKey,
  getOrCreatePlaygroundKey,
  getStoredPlaygroundKey,
  rotatePlaygroundKey,
  storePlaygroundKey,
} from './playgroundKeyService';

import type { CreateApiKeyResponse } from '@linode/api-v4';

// Mock the API functions
vi.mock('@linode/api-v4', () => ({
  createApiKey: vi.fn(),
  updateApiKey: vi.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    clear: () => {
      store = {};
    },
    getItem: (key: string) => store[key] || null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Constants
const STORAGE_KEY = 'inference_playground_key';
const TEST_KEY = 'sk-aka-test-key';
const TEST_KEY_FULL = 'sk-aka-test-key-full';
const ROTATED_KEY = 'sk-aka-rotated-key';
const TEST_EXPIRY = '2026-06-26T10:15:00Z';

const mockKeyResponse: CreateApiKeyResponse = {
  allowed_models: ['*'],
  created: '2026-06-26T10:00:00Z',
  description: '',
  expiry: TEST_EXPIRY,
  id: 123,
  key: TEST_KEY_FULL,
  key_prefix: 'sk-aka-test',
  key_type: 'playground',
  label: 'playground-testuser-abc123',
  last_used: null,
  status: 'active',
  updated: '2026-06-26T10:00:00Z',
};

const createStoredKey = (overrides: Record<string, unknown> = {}) => ({
  expiry: TEST_EXPIRY,
  id: 123,
  key: TEST_KEY,
  status: 'active',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockSessionStorage.clear();
});

// ---------------------------------------------------------------------------
// getStoredPlaygroundKey
// ---------------------------------------------------------------------------

describe('getStoredPlaygroundKey', () => {
  it('returns null when no key is stored', () => {
    const result = getStoredPlaygroundKey();
    expect(result).toBeNull();
  });

  it('returns the stored key when valid', () => {
    const storedKey = createStoredKey();
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

    const result = getStoredPlaygroundKey();
    expect(result).toEqual(storedKey);
  });

  it('returns null and clears storage when key is revoked', () => {
    const storedKey = createStoredKey({ status: 'revoked' });
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

    const result = getStoredPlaygroundKey();
    expect(result).toBeNull();
    expect(mockSessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns null and clears storage when JSON is invalid', () => {
    mockSessionStorage.setItem(STORAGE_KEY, 'invalid-json');

    const result = getStoredPlaygroundKey();
    expect(result).toBeNull();
    expect(mockSessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns expired key (caller decides to rotate)', () => {
    const expiredKey = createStoredKey({
      expiry: '2020-01-01T00:00:00Z',
      status: 'expired',
    });
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(expiredKey));

    const result = getStoredPlaygroundKey();
    expect(result).toEqual(expiredKey);
  });
});

// ---------------------------------------------------------------------------
// storePlaygroundKey
// ---------------------------------------------------------------------------

describe('storePlaygroundKey', () => {
  it('stores the key in session storage', () => {
    storePlaygroundKey(mockKeyResponse);

    const stored = mockSessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed).toEqual({
      expiry: mockKeyResponse.expiry,
      id: mockKeyResponse.id,
      key: mockKeyResponse.key,
      status: mockKeyResponse.status,
    });
  });
});

// ---------------------------------------------------------------------------
// clearStoredPlaygroundKey
// ---------------------------------------------------------------------------

describe('clearStoredPlaygroundKey', () => {
  it('removes the key from session storage', () => {
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify({ key: 'test' }));

    clearStoredPlaygroundKey();

    expect(mockSessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createPlaygroundKey
// ---------------------------------------------------------------------------

describe('createPlaygroundKey', () => {
  it('creates a new playground key with generated label', async () => {
    vi.mocked(createApiKey).mockResolvedValue(mockKeyResponse);

    const result = await createPlaygroundKey('testuser');

    expect(createApiKey).toHaveBeenCalledWith({
      key_type: 'playground',
      label: expect.stringMatching(/^playground-testuser-[a-z0-9]+$/),
    });
    expect(result).toEqual(mockKeyResponse);
  });

  it('stores the created key in session storage', async () => {
    vi.mocked(createApiKey).mockResolvedValue(mockKeyResponse);

    await createPlaygroundKey('testuser');

    const stored = mockSessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.key).toBe(mockKeyResponse.key);
  });
});

// ---------------------------------------------------------------------------
// rotatePlaygroundKey
// ---------------------------------------------------------------------------

describe('rotatePlaygroundKey', () => {
  it('rotates an existing playground key', async () => {
    const rotatedResponse: CreateApiKeyResponse = {
      ...mockKeyResponse,
      expiry: '2026-06-26T10:30:00Z',
      key: ROTATED_KEY,
      key_prefix: 'sk-aka-rotated',
    };
    vi.mocked(updateApiKey).mockResolvedValue(rotatedResponse);

    const result = await rotatePlaygroundKey(123);

    expect(updateApiKey).toHaveBeenCalledWith(123, {});
    expect(result).toEqual(rotatedResponse);
  });

  it('stores the rotated key in session storage', async () => {
    const rotatedResponse: CreateApiKeyResponse = {
      ...mockKeyResponse,
      key: ROTATED_KEY,
    };
    vi.mocked(updateApiKey).mockResolvedValue(rotatedResponse);

    await rotatePlaygroundKey(123);

    const stored = mockSessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.key).toBe(ROTATED_KEY);
  });
});

// ---------------------------------------------------------------------------
// getOrCreatePlaygroundKey
// ---------------------------------------------------------------------------

// Check if env var is set at test time
const ENV_API_KEY = import.meta.env.REACT_APP_INFERENCE_API_KEY;

describe('getOrCreatePlaygroundKey', () => {
  if (ENV_API_KEY) {
    // When REACT_APP_INFERENCE_API_KEY env var is set,
    // the function returns it directly without creating/rotating keys.
    it('returns env API key directly when REACT_APP_INFERENCE_API_KEY is set', async () => {
      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(ENV_API_KEY);
      expect(createApiKey).not.toHaveBeenCalled();
      expect(updateApiKey).not.toHaveBeenCalled();
    });
  } else {
    // When env var is NOT set, test the full key management logic
    it('returns stored key if valid and not expired', async () => {
      const futureExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const storedKey = createStoredKey({ expiry: futureExpiry });
      mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(TEST_KEY);
      expect(createApiKey).not.toHaveBeenCalled();
      expect(updateApiKey).not.toHaveBeenCalled();
    });

    it('rotates key if expired or expiring soon', async () => {
      const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();
      const storedKey = createStoredKey({ expiry: pastExpiry });
      mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

      const rotatedResponse: CreateApiKeyResponse = {
        ...mockKeyResponse,
        key: ROTATED_KEY,
      };
      vi.mocked(updateApiKey).mockResolvedValue(rotatedResponse);

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(ROTATED_KEY);
      expect(updateApiKey).toHaveBeenCalledWith(123, {});
    });

    it('rotates key if server status is expired (even if timestamp has not expired)', async () => {
      // Key has a future expiry timestamp, but server marked it as 'expired'
      const futureExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const storedKey = createStoredKey({
        expiry: futureExpiry,
        status: 'expired',
      });
      mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

      const rotatedResponse: CreateApiKeyResponse = {
        ...mockKeyResponse,
        key: ROTATED_KEY,
        status: 'active',
      };
      vi.mocked(updateApiKey).mockResolvedValue(rotatedResponse);

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(ROTATED_KEY);
      expect(updateApiKey).toHaveBeenCalledWith(123, {});
    });

    it('creates new key if rotation fails', async () => {
      const pastExpiry = new Date(Date.now() - 60 * 1000).toISOString();
      const storedKey = createStoredKey({ expiry: pastExpiry });
      mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

      vi.mocked(updateApiKey).mockRejectedValue(new Error('Key not found'));
      vi.mocked(createApiKey).mockResolvedValue(mockKeyResponse);

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(mockKeyResponse.key);
      expect(createApiKey).toHaveBeenCalled();
    });

    it('creates new key if no stored key exists', async () => {
      vi.mocked(createApiKey).mockResolvedValue(mockKeyResponse);

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe(mockKeyResponse.key);
      expect(createApiKey).toHaveBeenCalledWith({
        key_type: 'playground',
        label: expect.stringMatching(/^playground-testuser-[a-z0-9]+$/),
      });
    });

    it('returns stored key with no expiry (never expires)', async () => {
      const storedKey = createStoredKey({
        expiry: null,
        key: 'sk-aka-no-expiry-key',
      });
      mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedKey));

      const result = await getOrCreatePlaygroundKey('testuser');

      expect(result).toBe('sk-aka-no-expiry-key');
      expect(createApiKey).not.toHaveBeenCalled();
      expect(updateApiKey).not.toHaveBeenCalled();
    });
  }
});
