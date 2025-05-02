/**
 * Used for tests where a component relies on localStorage.
 *
 * @example Usage:
 *
 * import { LocalStorageMock } from '@linode/utilities';
 * Object.defineProperty(window, 'localStorage', {
 *   value: new LocalStorageMock()
 * });
 */
export class LocalStorageMock {
  store: any = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }
}
