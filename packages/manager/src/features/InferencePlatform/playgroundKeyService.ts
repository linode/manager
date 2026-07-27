import { createApiKey, updateApiKey } from '@linode/api-v4';

import type { ApiKeyStatus, CreateApiKeyResponse } from '@linode/api-v4';

const PLAYGROUND_KEY_STORAGE_KEY = 'inference_playground_key';
const KEY_EXPIRY_BUFFER_MS = 60 * 1000; // 1 minute buffer before expiry

interface StoredPlaygroundKey {
  expiry: null | string;
  id: number;
  key: string;
  status: ApiKeyStatus;
}

/**
 * Generates a unique label for playground keys.
 * Format: playground-<username>-<random-suffix>
 */
const generatePlaygroundKeyLabel = (username: string): string => {
  const randomSuffix = crypto.randomUUID().substring(0, 8);
  return `playground-${username}-${randomSuffix}`;
};

/**
 * Checks if a stored key is expired or about to expire.
 */
const isKeyExpiredOrExpiring = (expiry: null | string): boolean => {
  if (!expiry) {
    return false; // No expiry means never expires
  }

  const expiryTime = new Date(expiry).getTime();
  if (isNaN(expiryTime)) {
    return false;
  }

  return expiryTime - KEY_EXPIRY_BUFFER_MS <= Date.now();
};

/**
 * Retrieves the playground key from session storage if it exists and is not revoked.
 * Note: This returns the key even if expired - the caller can decide to rotate it.
 */
export const getStoredPlaygroundKey = (): null | StoredPlaygroundKey => {
  try {
    const stored = sessionStorage.getItem(PLAYGROUND_KEY_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsedKey: StoredPlaygroundKey = JSON.parse(stored);

    // Only reject revoked keys - expired keys can be rotated
    if (parsedKey.status === 'revoked') {
      clearStoredPlaygroundKey();
      return null;
    }

    return parsedKey;
  } catch {
    // Invalid JSON or storage error
    clearStoredPlaygroundKey();
    return null;
  }
};

/**
 * Stores a playground key in session storage.
 */
export const storePlaygroundKey = (keyResponse: CreateApiKeyResponse): void => {
  const keyData: StoredPlaygroundKey = {
    expiry: keyResponse.expiry,
    id: keyResponse.id,
    key: keyResponse.key,
    status: keyResponse.status,
  };

  sessionStorage.setItem(PLAYGROUND_KEY_STORAGE_KEY, JSON.stringify(keyData));
};

/**
 * Clears the stored playground key from session storage.
 */
export const clearStoredPlaygroundKey = (): void => {
  sessionStorage.removeItem(PLAYGROUND_KEY_STORAGE_KEY);
};

/**
 * Creates a new playground API key via the Linode API.
 * @param username - The current user's username for generating a unique label
 */
export const createPlaygroundKey = async (
  username: string
): Promise<CreateApiKeyResponse> => {
  const label = generatePlaygroundKeyLabel(username);

  const response = await createApiKey({
    key_type: 'playground',
    label,
  });

  // Store the key in session storage
  storePlaygroundKey(response);

  return response;
};

/**
 * Rotates an existing playground key by calling PUT.
 * This generates new credentials and resets the expiry to +15 minutes.
 * @param keyId - The ID of the playground key to rotate
 * @returns The rotated key response with new credentials
 */
export const rotatePlaygroundKey = async (
  keyId: number
): Promise<CreateApiKeyResponse> => {
  // For playground keys, PUT performs rotation - label/description are ignored
  // but the server requires a valid payload structure
  const response = await updateApiKey(keyId, {});

  // Store the rotated key in session storage
  storePlaygroundKey(response);

  return response;
};

/**
 * Gets an existing valid playground key, rotates if expired, or creates a new one.
 * - If COMPUTE_INFERENCE_API_KEY env var is set, uses that directly
 * - If a valid (non-expired) key exists in session storage, returns it
 * - If the key is expired/expiring, rotates it to get fresh credentials
 * - If no key exists, creates a new one
 * @param username - The current user's username for creating new keys
 * @returns The API key string to be used for inference requests.
 */
export const getOrCreatePlaygroundKey = async (
  username: string
): Promise<string> => {
  // If a static API key is configured via env, use it directly
  const envApiKey = import.meta.env.COMPUTE_INFERENCE_API_KEY;
  if (envApiKey) {
    return envApiKey;
  }

  const storedKey = getStoredPlaygroundKey();

  if (storedKey) {
    // Check if the key is expired (by timestamp or server status) or about to expire
    if (
      isKeyExpiredOrExpiring(storedKey.expiry) ||
      storedKey.status === 'expired'
    ) {
      // Rotate the existing key to get fresh credentials
      try {
        const rotatedKey = await rotatePlaygroundKey(storedKey.id);
        return rotatedKey.key;
      } catch {
        // Rotation failed (key might be deleted/revoked on server)
        // Clear and create a new one
        clearStoredPlaygroundKey();
      }
    } else {
      // Key is still valid, use it
      return storedKey.key;
    }
  }

  // No valid key found - create a new one
  const newKey = await createPlaygroundKey(username);
  return newKey.key;
};
